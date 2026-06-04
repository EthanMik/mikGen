import { useEffect, useRef, useState } from "react";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import { ConfigCheckboxButton } from "../Util/CheckboxButton";
import Tooltip from "../Util/Tooltip";
import { fileFormatStore, usePath } from "../../hooks/useFileFormat";
import { convertPathToString, templateToRegex } from "../../simulation/Conversion";
import type { FormatDef, Format, SegmentDef, SegmentKind } from "../../simulation/FormatDefinition";
import type { Path } from "../../core/Types/Path";
import fileIcon from "../../assets/file.svg";
import folderIcon from "../../assets/folder.svg";
import back from "../../assets/back.svg";
import refresh from "../../assets/cw.svg";

// ─── export-dir helpers ───────────────────────────────────────────────────────

type Entry = {
    name: string;
    kind: "file" | "directory";
    handle: FileSystemFileHandle | FileSystemDirectoryHandle;
};

async function readExportDirEntries(handle: FileSystemDirectoryHandle): Promise<Entry[]> {
    const result: Entry[] = [];
    for await (const [name, h] of handle.entries()) {
        const kind = h.kind as "file" | "directory";
        if (kind === "file" && !name.endsWith(".cpp")) continue;
        result.push({ name, kind, handle: h as FileSystemFileHandle | FileSystemDirectoryHandle });
    }
    result.sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === "directory" ? -1 : 1;
        return a.name.localeCompare(b.name);
    });
    return result;
}

// ─── export-block functions ───────────────────────────────────────────────────

function spliceGeneratedBlock(fileContent: string, generated: string, path: Path): { content: string; message: string } {
    const marker = "[" + path.name + "]";
    const begin = fileContent.indexOf(marker);
    if (begin === -1) return { content: "", message: `No start marker found. Add this comment to your file:\n// ${marker}\n// your code here\n// ${marker}` };

    const end = fileContent.indexOf(marker, begin + marker.length);
    if (end === -1) return { content: "", message: `No end marker found. Add a closing marker after the start:\n// ${marker}` };

    const openLineStart = fileContent.lastIndexOf('\n', begin - 1) + 1;
    const indent = fileContent.slice(openLineStart, begin).match(/^(\s*)/)?.[1] ?? '';
    const indented = generated.split('\n').map(line => line ? indent + line : line).join('\n');

    const before = fileContent.slice(0, begin + marker.length);
    const startLine = (before.match(/\n/g) ?? []).length + 2;
    const endLine = startLine + indented.split('\n').length - 2;

    const lineStart = fileContent.lastIndexOf('\n', end - 1) + 1;
    const after = fileContent.slice(lineStart);
    return { content: `${before}\n${indented}${after}`, message: `Wrote to file (lines ${startLine}-${endLine})` };
}

function lcsIndices(a: string[], b: string[]): [number, number][] {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0) as number[]);
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    const pairs: [number, number][] = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
        if (a[i - 1] === b[j - 1] && dp[i][j] > dp[i][j - 1]) { pairs.unshift([i - 1, j - 1]); i--; j--; }
        else if (dp[i - 1][j] > dp[i][j - 1]) i--;
        else j--;
    }
    return pairs;
}

function flexReplaceGeneratedBlock(fileContent: string, formatDef: FormatDef<Format>, path: Path): { content: string; message: string } {
    const marker = "[" + path.name + "]";
    const begin = fileContent.indexOf(marker);
    if (begin === -1) return { content: "", message: `No start marker found. Add this comment to your file:\n// ${marker}\n// your code here\n// ${marker}` };

    const end = fileContent.indexOf(marker, begin + marker.length);
    if (end === -1) return { content: "", message: `No end marker found. Add a closing marker after the start:\n// ${marker}` };

    const blockStart = fileContent.indexOf('\n', begin + marker.length) + 1;
    const closingLineStart = fileContent.lastIndexOf('\n', end - 1) + 1;
    const endMarkerIndent = fileContent.slice(closingLineStart, fileContent.indexOf('\n', closingLineStart)).match(/^(\s*)/)?.[1] ?? '';

    const beforeEndMarker = fileContent.slice(closingLineStart, end);
    const commentPrefix = beforeEndMarker.match(/\/\/\s*$/);
    const codeOnClosingLine = (commentPrefix
        ? beforeEndMarker.slice(0, beforeEndMarker.length - commentPrefix[0].length)
        : beforeEndMarker).trimEnd();

    const block = codeOnClosingLine
        ? fileContent.slice(blockStart, closingLineStart) + codeOnClosingLine + '\n'
        : fileContent.slice(blockStart, closingLineStart);
    const after = (codeOnClosingLine && commentPrefix)
        ? '\n' + endMarkerIndent + fileContent.slice(closingLineStart + beforeEndMarker.lastIndexOf('//'))
        : fileContent.slice(closingLineStart);
    const lines = block.split('\n');

    const lineToFileSeg = new Map<number, number>();
    const fileKinds: string[] = [];
    const fileContinuationLines = new Set<number>();
    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (!trimmed || fileContinuationLines.has(i)) continue;
        for (const [kind, segDef] of Object.entries(formatDef.segments) as [SegmentKind, SegmentDef<Format>][]) {
            if (!segDef || segDef.castTo || !segDef.toStringTemplate) continue;
            const templateLineCount = segDef.toStringTemplate.split('\n').length;
            const chunk = lines.slice(i, i + templateLineCount).map(l => l.trim()).join('\n');
            if (templateToRegex(segDef.toStringTemplate).regex.test(chunk)) {
                lineToFileSeg.set(i, fileKinds.length);
                fileKinds.push(kind);
                for (let j = 1; j < templateLineCount; j++) fileContinuationLines.add(i + j);
                break;
            }
        }
    }

    const webSegs = path.segments.filter(seg => {
        const def = formatDef.segments[seg.kind as SegmentKind];
        return def && (def.castTo ? formatDef.segments[def.castTo] : def)?.toStringTemplate;
    });

    const webKinds = webSegs.map(seg => {
        const k = seg.kind as SegmentKind;
        return (formatDef.segments[k]?.castTo ?? k) as string;
    });

    const alignment = lcsIndices(fileKinds, webKinds);
    const fileToWeb = new Map(alignment);
    const webToFile = new Map(alignment.map(([fi, wi]): [number, number] => [wi, fi]));

    // insertAfter[fi] = new web segs to place after fi's segment block (including its trailing non-seg lines)
    const insertAfter = new Map<number, number[]>();
    const insertAtStart: number[] = [];
    for (let wi = 0; wi < webSegs.length; wi++) {
        if (webToFile.has(wi)) continue;
        let prevFi = -1;
        for (const [fi, lwi] of alignment) {
            if (lwi < wi) prevFi = fi;
        }
        if (prevFi >= 0) {
            if (!insertAfter.has(prevFi)) insertAfter.set(prevFi, []);
            insertAfter.get(prevFi)!.push(wi);
        } else {
            insertAtStart.push(wi);
        }
    }

    const anySelected = webSegs.some(seg => seg.selected);

    // Build per-segment string arrays so multi-line templates (e.g. drive + pid_wait) stay together
    const allGenLines = convertPathToString(formatDef, path, false).split('\n').filter(Boolean);
    let genOffset = 0;
    const newSegStrings = webSegs.map(seg => {
        const k = seg.kind as SegmentKind;
        const def = formatDef.segments[k];
        const resolved = def?.castTo ? (formatDef.segments[def.castTo] ?? def) : def;
        const lineCount = resolved?.toStringTemplate?.split('\n').length ?? 1;
        const segLines = allGenLines.slice(genOffset, genOffset + lineCount);
        genOffset += lineCount;
        return segLines;
    });

    const newLines: string[] = [];
    let replacedCount = 0, insertedCount = 0, deletedCount = 0;
    let pendingWis: number[] = [...insertAtStart];
    let insertedAtEnd = 0;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        // Skip continuation lines belonging to an already-processed multi-line segment
        if (fileContinuationLines.has(lineIdx)) continue;

        const fileSeg = lineToFileSeg.get(lineIdx);
        if (fileSeg === undefined) { newLines.push(lines[lineIdx]); continue; }

        const indent = lines[lineIdx].match(/^(\s*)/)?.[1] ?? '';

        if (!fileToWeb.has(fileSeg)) {
            // Unmatched file segment: keep or delete, but do NOT flush pending
            if (anySelected) { newLines.push(lines[lineIdx]); } else { deletedCount++; }
            continue;
        }

        // Only flush pending when hitting a matched segment (after its preceding trailing non-seg content)
        for (const insertWi of pendingWis) {
            const seg = webSegs[insertWi];
            if (!seg.visible || (anySelected && !seg.selected)) continue;
            for (const subLine of newSegStrings[insertWi]) newLines.push(indent + subLine);
            insertedCount++;
        }
        pendingWis = [];

        const wi = fileToWeb.get(fileSeg)!;
        const seg = webSegs[wi];
        if (seg.visible && (!anySelected || seg.selected)) {
            const trailingMarker = lines[lineIdx].match(/(\/\/\s*\[.*?\])$/)?.[1];
            for (const subLine of newSegStrings[wi]) newLines.push(indent + subLine);
            if (trailingMarker) newLines.push(indent + trailingMarker);
            replacedCount++;
        } else {
            // Keep the original segment lines (anchor + continuations) unchanged
            const k = fileKinds[fileSeg] as SegmentKind;
            const segDef = formatDef.segments[k];
            const templateLineCount = segDef?.toStringTemplate?.split('\n').length ?? 1;
            for (let j = 0; j < templateLineCount; j++) newLines.push(lines[lineIdx + j]);
        }

        pendingWis = insertAfter.get(fileSeg) ?? [];
    }

    // Flush remaining pending after all trailing non-seg content in the block
    for (const wi of pendingWis) {
        const seg = webSegs[wi];
        if (!seg.visible || (anySelected && !seg.selected)) continue;
        for (const subLine of newSegStrings[wi]) newLines.push(endMarkerIndent + subLine);
        insertedCount++;
        insertedAtEnd++;
    }

    const before = fileContent.slice(0, begin + marker.length);
    const parts = [
        replacedCount && `replaced ${replacedCount}`,
        insertedCount && `inserted ${insertedCount}`,
        deletedCount && `deleted ${deletedCount}`,
    ].filter(Boolean);
    const joined = newLines.join('\n');
    const separator = insertedAtEnd > 0 && !after.startsWith('\n') && !joined.endsWith('\n') ? '\n' : '';
    return {
        content: `${before}\n${joined}${separator}${after}`,
        message: parts.length ? `Synced: ${parts.join(', ')} segments` : 'No changes made',
    };
}

function replaceGeneratedBlock(fileContent: string, formatDef: FormatDef<Format>, path: Path): { content: string; message: string } {
    const marker = "[" + path.name + "]";
    const begin = fileContent.indexOf(marker);
    if (begin === -1) return { content: "", message: `No start marker found. Add this comment to your file:\n// ${marker}\n// your code here\n// ${marker}` };

    const end = fileContent.indexOf(marker, begin + marker.length);
    if (end === -1) return { content: "", message: `No end marker found. Add a closing marker after the start:\n// ${marker}` };

    const blockStart = fileContent.indexOf('\n', begin + marker.length) + 1;
    const lineStart = fileContent.lastIndexOf('\n', end - 1) + 1;
    const block = fileContent.slice(blockStart, lineStart);
    const lines = block.split('\n');
    const blockLineOffset = (fileContent.slice(0, blockStart).match(/\n/g) ?? []).length + 1;

    const matchedIndices: number[] = [];
    const fileKinds: SegmentKind[] = [];
    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (!trimmed) continue;
        for (const [kind, segDef] of Object.entries(formatDef.segments) as [SegmentKind, SegmentDef<Format>][]) {
            if (!segDef || segDef.castTo || !segDef.toStringTemplate) continue;
            if (templateToRegex(segDef.toStringTemplate).regex.test(trimmed)) {
                matchedIndices.push(i);
                fileKinds.push(kind);
                break;
            }
        }
    }

    const webSegs = path.segments.filter(seg => {
        const def = formatDef.segments[seg.kind as SegmentKind];
        return def && (def.castTo ? formatDef.segments[def.castTo] : def)?.toStringTemplate;
    });

    if (fileKinds.length !== webSegs.length) {
        const firstExtraIdx = matchedIndices[Math.min(fileKinds.length, webSegs.length)];
        const lineInfo = firstExtraIdx !== undefined ? ` (line ${blockLineOffset + firstExtraIdx})` : "";
        return { content: "", message: `Count mismatch: file has ${fileKinds.length} segments, path has ${webSegs.length}${lineInfo}` };
    }

    for (let i = 0; i < fileKinds.length; i++) {
        const webKind = webSegs[i].kind as SegmentKind;
        const resolvedWebKind = (formatDef.segments[webKind]?.castTo ?? webKind) as SegmentKind;
        if (fileKinds[i] !== resolvedWebKind)
            return { content: "", message: `Segment ${i + 1} mismatch: "${fileKinds[i]}" vs "${resolvedWebKind}"` };
    }

    const anySelected = webSegs.some(seg => seg.selected);
    const newSegLines = convertPathToString(formatDef, path, false).split('\n').filter(Boolean);
    const newLines = [...lines];
    let replacedCount = 0;
    for (let i = 0; i < matchedIndices.length; i++) {
        const seg = webSegs[i];
        if (!seg.visible) continue;
        if (anySelected && !seg.selected) continue;
        const indent = lines[matchedIndices[i]].match(/^(\s*)/)?.[1] ?? '';
        newLines[matchedIndices[i]] = indent + newSegLines[i];
        replacedCount++;
    }

    const before = fileContent.slice(0, begin + marker.length);
    const after = fileContent.slice(lineStart);
    return {
        content: `${before}\n${newLines.join('\n')}${after}`,
        message: `Replaced ${replacedCount} of ${matchedIndices.length} segments`,
    };
}

// ─── DragAndDrop ──────────────────────────────────────────────────────────────

type DragAndDropProps = {
    onHandle: (handle: FileSystemFileHandle) => void;
    onDirHandle: (handle: FileSystemDirectoryHandle) => void;
}

function DragAndDrop({ onHandle, onDirHandle }: DragAndDropProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); if (e.dataTransfer.items.length > 0) setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const item = e.dataTransfer.items[0];
        if (!item) return;
        const handle = await (item as DataTransferItem & {
            getAsFileSystemHandle?: () => Promise<FileSystemHandle | null>
        }).getAsFileSystemHandle?.();
        if (!handle) return;
        if (handle.kind === "directory") onDirHandle(handle as FileSystemDirectoryHandle);
        else if (handle.kind === "file") onHandle(handle as FileSystemFileHandle);
    };

    const handleFileClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            // @ts-expect-error showOpenFilePicker not in all TS DOM libs
            const [handle] = await window.showOpenFilePicker({
                types: [{ description: "C++ Source", accept: { "text/plain": [".cpp"] } }],
                multiple: false,
            });
            if (handle) onHandle(handle);
        } catch {
            // ignore abort
        }
    };

    const handleFolderClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            // @ts-expect-error showDirectoryPicker not in all TS DOM libs
            const handle = await window.showDirectoryPicker({ mode: "readwrite" });
            onDirHandle(handle);
        } catch {
            // ignore abort
        }
    };

    return (
        <div
            className={`h-12 outline-1 outline-dashed flex items-stretch rounded-sm transition-colors duration-100
                ${isDragging ? "outline-white" : "outline-lightgray"}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div
                onClick={handleFileClick}
                className="flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer hover:opacity-60 py-1"
            >
                <img src={fileIcon} className="w-3.5 h-3.5" />
                <span className="text-[8px]">.cpp file</span>
            </div>
            <div className="w-px bg-lightgray opacity-20 self-stretch my-2" />
            <div
                onClick={handleFolderClick}
                className="flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer hover:opacity-60 py-1"
            >
                <img src={folderIcon} className="w-3.5 h-3.5" />
                <span className="text-[8px]">folder</span>
            </div>
        </div>
    );
}

// ─── ErrorConsole ─────────────────────────────────────────────────────────────

function ErrorConsole({ lines }: { lines: string[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) contentRef.current.textContent = lines.join('\n');
        const el = containerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [lines]);

    return (
        <div
            ref={containerRef}
            className="h-18 bg-blackgray rounded-sm px-2 py-1 overflow-y-auto font-mono text-[9px]"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
            <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                onBeforeInput={e => e.preventDefault()}
                className="text-lightgray whitespace-pre-wrap outline-none cursor-text [&::-webkit-scrollbar]:hidden"
            />
        </div>
    );
}

// ─── ExportButton ─────────────────────────────────────────────────────────────

export default function ExportButton() {
    const [handle, setHandle] = useState<FileSystemFileHandle | null>(null);
    const [currentExportDir, setCurrentExportDir] = useState<FileSystemDirectoryHandle | null>(null);
    const [exportDirHistory, setExportDirHistory] = useState<FileSystemDirectoryHandle[]>([]);
    const [exportDirEntries, setExportDirEntries] = useState<Entry[]>([]);
    const [consoleLines, setConsoleLines] = useState<string[]>([]);
    const [mergeMode, setMergeMode] = useState(true);
    const [replaceMode, setReplaceMode] = useState(false);
    const [path,] = usePath();

    const mode = handle ? "writeInterface" : currentExportDir ? "folderView" : "default";

    const log = (text: string) => setConsoleLines(prev => [...prev, text]);

    const handleDirChosen = async (dirHandle: FileSystemDirectoryHandle) => {
        setCurrentExportDir(dirHandle);
        setExportDirHistory([]);
        setExportDirEntries(await readExportDirEntries(dirHandle));
    };

    const openExportSubDir = async (h: FileSystemDirectoryHandle) => {
        if (currentExportDir) setExportDirHistory(prev => [...prev, currentExportDir]);
        setCurrentExportDir(h);
        setExportDirEntries(await readExportDirEntries(h));
    };

    const goExportBack = async () => {
        const prev = exportDirHistory[exportDirHistory.length - 1];
        if (!prev) {
            setCurrentExportDir(null);
            setExportDirHistory([]);
            setExportDirEntries([]);
            return;
        }
        setExportDirHistory(h => h.slice(0, -1));
        setCurrentExportDir(prev);
        setExportDirEntries(await readExportDirEntries(prev));
    };

    const refreshExportDir = () => {
        if (currentExportDir) readExportDirEntries(currentExportDir).then(setExportDirEntries);
    };

    const toggleMergeMode = () => {
        const next = !mergeMode;
        setMergeMode(next);
        if (next) { setReplaceMode(false); log("Merge Mode: Replaces segments by matching them to segments in file. Will delete or add segments. Non-visible segments are ignored."); }
    };

    const toggleReplaceMode = () => {
        const next = !replaceMode;
        setReplaceMode(next);
        if (next) setMergeMode(false);
        if (next) log("Replace Mode: Only replaces segments that match the type and amount as mikGen. Non-visible or non selected segments are ignored.");
    };

    useEffect(() => {
        if (!handle) return;
        const name = fileFormatStore.getState().path.name;
        log("Auton will paste between marker:");
        log(`// [${name}]`);
        log("chassis.drive(2);");
        log(`// [${name}]`);
    }, [handle, path.name]);

    const replaceInFile = async () => {
        if (!handle) return;
        try {
            log("Replacing...");
            const { formatDef, path } = fileFormatStore.getState();
            const file = await handle.getFile();
            const content = await file.text();
            const result = replaceMode
                ? replaceGeneratedBlock(content, formatDef, path)
                : flexReplaceGeneratedBlock(content, formatDef, path);
            if (!result.content) { log(result.message); return; }
            const writable = await handle.createWritable();
            await writable.write(result.content);
            await writable.close();
            log(result.message);
        } catch (err) {
            log(err instanceof Error ? err.message : String(err));
        }
    };

    const writeToFile = async () => {
        if (!handle) return;
        try {
            log("Writing to file...");
            const { formatDef, path } = fileFormatStore.getState();
            const generated = convertPathToString(formatDef, path, false);
            const file = await handle.getFile();
            const content = await file.text();
            const result = spliceGeneratedBlock(content, generated, path);
            if (!result.content) { log(result.message); return; }
            const writable = await handle.createWritable();
            await writable.write(result.content);
            await writable.close();
            log(result.message);
        } catch (err) {
            log(err instanceof Error ? err.message : String(err));
        }
    };

    const writeRef = useRef<() => void>(() => {});
    useEffect(() => {
        writeRef.current = replaceMode || mergeMode ? replaceInFile : writeToFile;
    });

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'e') { e.preventDefault(); writeRef.current(); }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const backButton = { icon: back, visible: true, onClick: goExportBack, tooltip: "Go Back" };
    const refreshButton = { icon: refresh, visible: true, onClick: refreshExportDir, tooltip: "Refresh Folder" };

    return (
        <ConfigButtonTemplate
            title="Export"
            iconButtons={mode === "folderView" ? [backButton, refreshButton] : []}
        >
            {mode === "default" && (
                <>
                    <span className="text-[7.5px] mb-1 opacity-50">Segments can be also be exported by Ctrl+C</span>
                    <DragAndDrop onHandle={setHandle} onDirHandle={handleDirChosen} />
                </>
            )}

            {mode === "folderView" && (
                exportDirEntries.length === 0
                    ? <span className="text-[12px] opacity-40 px-1">Empty folder</span>
                    : exportDirEntries.map(entry => (
                        <button
                            key={entry.name}
                            className="flex flex-row px-2 py-0.5 items-center justify-between cursor-pointer rounded-sm w-full text-left hover:bg-medlightgray"
                            onClick={() => entry.kind === "directory"
                                ? openExportSubDir(entry.handle as FileSystemDirectoryHandle)
                                : setHandle(entry.handle as FileSystemFileHandle)
                            }
                        >
                            <span className="text-[13px] truncate min-w-0">{entry.name}</span>
                            <img src={entry.kind === "file" ? fileIcon : folderIcon} className="w-3.5 h-3.5 shrink-0 ml-1" />
                        </button>
                    ))
            )}

            {mode === "writeInterface" && handle && (
                <div className="flex flex-col gap-0.5">
                    <div className="flex flex-row items-center gap-2">
                        <button
                            onClick={() => setHandle(null)}
                            className="text-[10px] opacity-70 cursor-pointer hover:opacity-100 truncate"
                            title={handle.name}
                        >
                            {handle.name}
                        </button>
                    </div>
                    <Tooltip label="Export Path  Ctrl+E" placement="right">
                        <button
                            className="w-full flex items-center justify-center px-2 py-1 brightness-120 bg-medgray hover:brightness-95 cursor-pointer rounded-sm"
                            onClick={replaceMode || mergeMode ? replaceInFile : writeToFile}
                        >
                            <span className="text-[14px]">Write</span>
                        </button>
                    </Tooltip>
                    <div className="pt-2 pb-2">
                        <ErrorConsole lines={consoleLines} />
                    </div>
                    <ConfigCheckboxButton name="Merge" label="Toggles Merge Mode (Read Console)" checked={mergeMode} setChecked={toggleMergeMode} />
                    <ConfigCheckboxButton name="Replace" label="Toggles Replace Mode (Read Console)" checked={replaceMode} setChecked={toggleReplaceMode} />
                </div>
            )}
        </ConfigButtonTemplate>
    );
}

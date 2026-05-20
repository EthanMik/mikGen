import { useEffect, useRef, useState } from "react";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import CheckboxButton from "../Util/CheckboxButton";
import download from "../../assets/download.svg"
import { fileFormatStore, usePath } from "../../hooks/useFileFormat";
import { convertPathToString, templateToRegex } from "../../simulation/Conversion";
import type { FormatDef, Format, SegmentDef, SegmentKind } from "../../simulation/FormatDefinition";
import type { Path } from "../../core/Types/Path";

function spliceGeneratedBlock(fileContent: string, generated: string, path: Path): { content: string; message: string } {
    const marker = "[" + path.name + "]";
    const begin = fileContent.indexOf(marker);
    if (begin === -1) return { content: "", message: `No start marker found: ${marker}` };

    const end = fileContent.indexOf(marker, begin + marker.length);
    if (end === -1) return { content: "", message: `No end marker found: ${marker}` };

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

function replaceGeneratedBlock(fileContent: string, formatDef: FormatDef<Format>, path: Path): { content: string; message: string } {
    const marker = "[" + path.name + "]";
    const begin = fileContent.indexOf(marker);
    if (begin === -1) return { content: "", message: `No start marker found: ${marker}` };

    const end = fileContent.indexOf(marker, begin + marker.length);
    if (end === -1) return { content: "", message: `No end marker found: ${marker}` };

    const blockStart = fileContent.indexOf('\n', begin + marker.length) + 1;
    const lineStart = fileContent.lastIndexOf('\n', end - 1) + 1;
    const block = fileContent.slice(blockStart, lineStart);
    const lines = block.split('\n');
    const blockLineOffset = (fileContent.slice(0, blockStart).match(/\n/g) ?? []).length + 1;

    // Find which lines match a segment template and record their index and kind
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

type DragAndDropProps = {
    onHandle: (handle: FileSystemFileHandle) => void;
}

function DragAndDrop({ onHandle }: DragAndDropProps) {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.items.length > 0) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const item = e.dataTransfer.items[0];
        if (!item) return;
        const handle = await (item as DataTransferItem & {
            getAsFileSystemHandle?: () => Promise<FileSystemHandle | null>
        }).getAsFileSystemHandle?.();
        if (handle && handle.kind === "file") onHandle(handle as FileSystemFileHandle);
    };

    const handleClick = async () => {
        try {
            const picker = (window as unknown as { showOpenFilePicker: (o: object) => Promise<FileSystemFileHandle[]> }).showOpenFilePicker;
            const [handle] = await picker({
                types: [{ description: "C++ Source", accept: { "text/plain": [".cpp"] } }],
                multiple: false,
            });
            if (handle) onHandle(handle);
        } catch {
            // user cancelled
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.value = "";
    };

    return (
        <div
            className={`h-12 outline-1 pt-2.5 pb-1.5 outline-dashed flex items-center justify-between flex-col rounded-sm cursor-pointer transition-colors duration-100
                ${isDragging ? "outline-white" : "outline-lightgray"}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input ref={inputRef} type="file" accept=".cpp" className="hidden" onChange={handleInputChange} />
            <img src={download} className="w-4 h-4" />
            <span className="text-[8px]">Choose .cpp file or drag it here</span>
        </div>
    );
}

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
            className="h-15 bg-blackgray rounded-sm px-2 py-1 overflow-y-auto font-mono text-[9px]"
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

export default function ExportButton() {
    const [handle, setHandle] = useState<FileSystemFileHandle | null>(null);
    const [consoleLines, setConsoleLines] = useState<string[]>([]);
    const [replaceMode, setReplaceMode] = useState(false);
    const [strictReplace, setStrictReplace] = useState(false);
    const [ path, ] = usePath();

    const log = (text: string) => setConsoleLines(prev => [...prev, text]);

    const toggleReplaceMode = () => {
        const next = !replaceMode;
        setReplaceMode(next);
        if (next) { setStrictReplace(false); log("Replace Mode: Replaces segments by matching them to segments in file. Will delete or add segments. Non-visible segments are ignored."); }
    };

    const toggleStrictReplace = () => {
        const next = !strictReplace;
        setStrictReplace(next);
        if (next) setReplaceMode(false);
        if (next) log("Strict Replace Mode: Only replaces segments that match the type and amount as mikGen. Non-visible or non selected segments are ignored.");
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
            const result = replaceGeneratedBlock(content, formatDef, path);
            if (!result.content) {
                log(result.message);
                return;
            }
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
            if (!result.content) {
                log(result.message);
                return;
            }

            const writable = await handle.createWritable();
            await writable.write(result.content);
            await writable.close();
            log(result.message);
        } catch (err) {
            log(err instanceof Error ? err.message : String(err));
        }
    };

    return (
        <ConfigButtonTemplate title="Export">
            {handle ? (
                <div className="flex flex-col gap-0.5">
                    <div className="flex flex-row items-center gap-2">
                        <button
                            onClick={() => { setHandle(null); }}
                            className="text-[10px] opacity-70 cursor-pointer hover:opacity-100 truncate"
                            title={handle.name}
                        >
                            {handle.name}
                        </button>
                    </div>
                    <button
                        className="w-full flex items-center justify-center px-2 py-1 brightness-120 bg-medgray hover:brightness-95 cursor-pointer rounded-sm"
                        onClick={strictReplace || replaceMode ? replaceInFile : writeToFile}
                    >
                        <span className="text-[14px]">Write</span>
                    </button>
                    <div className="pt-2 pb-2">
                        <ErrorConsole lines={consoleLines} />
                    </div>
                    <CheckboxButton name="Replace" checked={replaceMode} setChecked={toggleReplaceMode} />
                    <CheckboxButton name="Strict Replace" checked={strictReplace} setChecked={toggleStrictReplace} />
                </div>
            ) : (
                <DragAndDrop onHandle={setHandle} />
            )}
        </ConfigButtonTemplate>
    );
}

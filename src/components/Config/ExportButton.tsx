import { useRef, useState } from "react";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import download from "../../assets/download.svg"

type DragAndDropProps = {
    onFile: (file: File) => void;
}

function DragAndDrop({ onFile }: DragAndDropProps) {
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

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFile(file);
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
            onClick={() => inputRef.current?.click()}
        >
            <input ref={inputRef} type="file" accept=".cpp" className="hidden" onChange={handleInputChange} />
            <img src={download} className="w-4 h-4" />
            <span className="text-[8px]">Choose .cpp file or drag it here</span>
        </div>
    )
}

type ExportButtonProps = {
    onFile?: (file: File) => void;
}

export default function ExportButton({ onFile }: ExportButtonProps) {
    return (
        <ConfigButtonTemplate title="Export">
            <DragAndDrop onFile={file => onFile?.(file)} />
        </ConfigButtonTemplate>
    );
}

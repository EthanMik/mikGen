import { useEffect, useRef, useState } from "react";
import { useFormat, type Format } from "../../hooks/useFormat";
import { AddToUndoHistory } from "../../core/Undo/UndoHistory";

type PathFormats = {
  name: string,
  format: Format,
}

const FORMATS: PathFormats[] = [ 
  { name: "mikLib v1.2.4", format: "mikLib"}, 
  { name: "ReveilLib v2.1.0", format: "ReveilLib"}, 
  { name: "JAR-Template [SOON]", format: "JAR-Template"}, 
  { name: "LemLib [SOON]", format: "LemLib"} 
];

export default function FormatButton() {
  const [isOpen, setOpen] = useState(false);
  const [ format, setFormat ] = useFormat();
  const menuRef = useRef<HTMLDivElement>(null);
  const prevFormatRef = useRef<Format>(format);

  const handleToggleMenu = () => setOpen((prev) => !prev);
  
  const handleClickItem = (format: Format) => {
    setFormat(format);
    if (prevFormatRef.current !== format) {
      AddToUndoHistory({ format: format })
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div
      ref={menuRef}
      className={`relative ${
        isOpen ? "bg-medgray_hover" : "bg-none"
      } hover:bg-medgray_hover rounded-sm`}
    >
      <button onClick={handleToggleMenu} className="px-2 py-1 cursor-pointer">
        <span className="text-[20px]">Format</span>
      </button>

      {isOpen && (
        <div
          className="absolute shadow-xs mt-1 shadow-black left-0 top-full w-55 rounded-sm bg-medgray_hover min-h-2"
        >
          <div className="mt-2 pl-2 pr-2 mb-2 gap-1 flex flex-col max-h-40 overflow-y-auto">
            {FORMATS.map((c) => (
              <>
                {c.name !== "" && <button
                  key={c.format}
                  type="button"
                  className={`flex items-center justify-between px-2 py-1 hover:bg-blackgrayhover cursor-pointer rounded-sm ${format === c.format ? "bg-blackgrayhover" : ""}`}
                  onClick={() => handleClickItem(c.format)}
                >
                  <span className="text-[16px]">{c.name}</span>
                  {format === c.format && (
                    <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
                      <path
                        d="M1 6.5L5.66752 10.7433C6.11058 11.1461 6.8059 11.0718 7.15393 10.5846L14 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>}
                {c.name === "" && <div className="mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]"></div>}
              </>
              
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

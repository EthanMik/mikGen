import { useEffect, useRef, useState } from "react";
import { usePath } from "../../hooks/usePath";
import { convertPathToString } from "../../Conversion/Conversion";
import { useFormat } from "../../hooks/useFormat";
import FieldMacros from "../../macros/FieldMacros";

function CopyIcon({ className }: { className?: string }) {
  const href =
    "data:image/png;base64,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"

  return (
    <svg
      className={className}
      viewBox="0 0 25 25"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <mask id="copyMask" maskUnits="userSpaceOnUse" x="0" y="0" width="25" height="25">
          <image href={href} x="0" y="0" width="25" height="25" preserveAspectRatio="none" />
        </mask>
      </defs>

      <rect width="25" height="25" fill="currentColor" mask="url(#copyMask)" />
    </svg>
  );
}

export default function CopyPathButton() {
  const [isOpen, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [ pathFormat,  ] = useFormat();
  const [path] = usePath();

  const [flash, setFlash] = useState(false);
  const flashTimeoutRef = useRef<number | null>(null);

  const pathRef = useRef(path);
  const formatRef = useRef(pathFormat);

  useEffect(() => { pathRef.current = path; }, [path]);
  useEffect(() => { formatRef.current = pathFormat; }, [pathFormat]);

  const triggerFlash = () => {
    setFlash(true);
    if (flashTimeoutRef.current) window.clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = window.setTimeout(() => setFlash(false), 400);
  };

  const handleToggleMenu = () => setOpen((prev) => !prev);

  const {
    copyAllPath,
    copySelectedPath
  } = FieldMacros();

  useEffect(() => {
      const handleKeyDown = (evt: KeyboardEvent) => {
          const target = evt.target as HTMLElement | null;
          if (target?.isContentEditable || target?.tagName === "INPUT") return;
          copyAllPath(evt, pathRef.current, formatRef.current, triggerFlash);
          copySelectedPath(evt, pathRef.current, formatRef.current, triggerFlash);
      }

      document.addEventListener('keydown', handleKeyDown)

      return () => {
          document.removeEventListener('keydown', handleKeyDown)
      }
  }, []);

  const copyAllOnClick = () => {
    triggerFlash();
    const out = convertPathToString(path, pathFormat);
    setOpen(false);
    navigator.clipboard.writeText(out ?? "");
  };
  
  const copySelectedOnClick = () => {
    triggerFlash();
    const out = convertPathToString(path, pathFormat, true);
    setOpen(false);
    navigator.clipboard.writeText(out ?? "");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (flashTimeoutRef.current) window.clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      className={`relative ${isOpen ? "bg-medgray_hover" : "bg-none"} hover:bg-medgray_hover rounded-sm`}
    >
      <button
        className="w-[30px] h-[30px] flex items-center justify-center cursor-pointer
                   rounded-sm hover:bg-medgray_hover active:scale-95 transition-normal duration-50"
        onClick={handleToggleMenu}
      >
        <CopyIcon
          className={[
            "w-[25px] h-[25px]",
            "transition-all duration-[0]",
            flash ? "scale-[1.3] text-lightgray" : "text-white",
          ].join(" ")}
        />
      </button>

      {isOpen && (
        <div
          className="absolute shadow-xs mt-1 shadow-black right-0 top-full w-50 z-40
                     rounded-sm bg-medgray_hover min-h-2"
        >
          <div className="flex flex-col mt-2 pl-2 pr-2 mb-2 gap-1">
            <button
              className="flex justify-between px-2 py-1 hover:bg-blackgrayhover rounded-sm"
              onClick={copyAllOnClick}
            >
              <span className="text-[16px]">Copy All</span>
              <span className="text-[14px] text-lightgray">Ctrl+Shift+C</span>
            </button>

            <button
              className="flex justify-between px-2 py-1 hover:bg-blackgrayhover rounded-sm"
              onClick={copySelectedOnClick}
            >
              <span className="text-[16px]">Copy Selected</span>
              <span className="text-[14px] text-lightgray">Ctrl+C</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

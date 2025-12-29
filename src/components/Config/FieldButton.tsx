import { useEffect, useRef, useState, useTransition } from "react";
import { useField } from "../../hooks/useField";

import pushbackVEXUMatchField from "../../assets/pushback-match.png";
import pushbackSkillsField from "../../assets/pushback-skills.png";
import pushbackV5MatchField from "../../assets/pushback-matchv5.png"
import emptyField from "../../assets/empty-field.png";

type Field = {
  src: string;
  name: string;
};

const fields: Field[] = [
  { src: pushbackV5MatchField, name: "V5 Push Back Match Field"},
  { src: pushbackSkillsField, name: "V5 Push Back Skills Field" },
  { src: pushbackVEXUMatchField, name: "VEXU Push Back Match Field" },
  { src: "", name: "" },
  { src: emptyField, name: "Empty Field" },
];

function usePreloadImages(srcs: string[]) {
  useEffect(() => {
    (async () => {
      await Promise.all(
        srcs.map(async (src) => {
          const img = new Image();
          img.src = src;
          try {
            await img.decode();
          } catch {
            // do nothing
          }
        })
      );
    })();
  }, [srcs.join("|")]);
}

export default function FieldButton() {
  const [isOpen, setOpen] = useState(false);
  const { field, setField } = useField();
  const menuRef = useRef<HTMLDivElement>(null);

  const [isPending, startTransition] = useTransition();

  const hoverTimer = useRef<number | null>(null);

  usePreloadImages(fields.map((f) => f.src));

  const handleToggleMenu = () => setOpen((prev) => !prev);

  
  const setFieldSmooth = (src: string) => {
    startTransition(() => setField(src));
  };

  if (field === "") {
    setFieldSmooth(fields[0].src);
  };

  const handleHover = (src: string) => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      setFieldSmooth(src);
    }, 0);
  };

  const handleLeaveMenu = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  };

  const handleClickItem = () => {
    setOpen(false);
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

  useEffect(() => {
    return () => {
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      className={`relative ${
        isOpen ? "bg-medgray_hover" : "bg-none"
      } hover:bg-medgray_hover rounded-sm`}
    >
      <button onClick={handleToggleMenu} className="px-2 py-1 cursor-pointer">
        <span className="text-[20px]">Field {isPending ? "…" : ""}</span>
      </button>

      {isOpen && (
        <div
          className="absolute shadow-xs mt-1 shadow-black left-0 top-full w-65 rounded-sm bg-medgray_hover min-h-2"
          onMouseLeave={handleLeaveMenu}
        >
          <div className="mt-2 pl-2 pr-2 mb-2 gap-1 flex flex-col max-h-40 overflow-y-auto">
            {fields.map((c) => (
              <>
                {c.name !== "" && <button
                  key={c.src}
                  type="button"
                  className={`flex items-center justify-between px-2 py-1 hover:bg-blackgrayhover cursor-pointer rounded-sm ${field === c.src ? "bg-blackgrayhover" : ""}`}
                  onMouseEnter={() => handleHover(c.src)}
                  onClick={handleClickItem}
                >
                  <span className="text-[16px]">{c.name}</span>
                  {field === c.src && (
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

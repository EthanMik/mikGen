import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { fieldMap, useField, type FieldType } from "../../hooks/useField";
import { AddToUndoHistory } from "../../core/Undo/UndoHistory";

const imageCache: { [key: string]: HTMLImageElement } = {};

async function preloadImage(src: string): Promise<HTMLImageElement> {
  if (!src) return new Image();
  
  if (imageCache[src]) {
    return imageCache[src];
  }
  
  const img = new Image();
  img.src = src;
  try {
    await img.decode();
    imageCache[src] = img;
  } catch {
    // do nothing
  }
  return img;
}

function usePreloadImagesOnMount(srcs: string[]) {
  const imgRefs = useRef<HTMLImageElement[]>([]);
  
  useEffect(() => {
    (async () => {
      imgRefs.current = await Promise.all(srcs.map(preloadImage));
    })();
    
    return () => {
      imgRefs.current = [];
    };
  }, []);
}

export default function FieldButton() {
  const [isOpen, setOpen] = useState(false);
  const [fieldKey, setFieldKey] = useField();
  const menuRef = useRef<HTMLDivElement>(null);
  const [, setIsLoading] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const [, startTransition] = useTransition();

  const hoverTimer = useRef<number | null>(null);
  const fieldWhenMenuOpened = useRef<FieldType>(fieldKey);

  usePreloadImagesOnMount(fieldMap.map((f) => f.src));

  const handleCloseMenu = useCallback(() => {
    if (isOpen && fieldKey !== fieldWhenMenuOpened.current) {
      AddToUndoHistory({ field: fieldKey });
    }
    setOpen(false);
  }, [isOpen, fieldKey]);

  const handleToggleMenu = async () => {
    if (!isOpen && !imagesLoaded) {
      setIsLoading(true);
      await Promise.all(fieldMap.map(f => preloadImage(f.src)));
      setImagesLoaded(true);
      setIsLoading(false);
    }

    if (!isOpen) {
      // Opening menu - save current field
      fieldWhenMenuOpened.current = fieldKey;
      setOpen(true);
    } else {
      // Closing menu
      handleCloseMenu();
    }
  };

  const setFieldSmooth = (key: FieldType) => {
    startTransition(() => setFieldKey(key));
  };

  if (fieldKey === undefined) {
    setFieldSmooth(fieldMap[0].key);
  }

  const handleHover = (key: FieldType) => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      setFieldSmooth(key);
    }, 0);
  };

  const handleLeaveMenu = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  };

  const handleClickItem = () => {
    handleCloseMenu();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleCloseMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleCloseMenu]);

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
        <span className="text-[20px]">Field</span>
      </button>

      {isOpen && (
        <div
          className="absolute shadow-xs mt-1 shadow-black left-0 top-full w-50 rounded-sm bg-medgray_hover min-h-2"
          onMouseLeave={handleLeaveMenu}
        >
          <div className="mt-2 pl-2 pr-2 mb-2 gap-1 flex flex-col max-h-40 overflow-y-auto">
            {fieldMap.map((c) => (
              <>
                {c.name !== "" && <button
                  key={c.key}
                  type="button"
                  className={`flex items-center justify-between px-2 py-1 hover:bg-blackgrayhover cursor-pointer rounded-sm ${fieldKey === c.key ? "bg-blackgrayhover" : ""}`}
                  onMouseEnter={() => handleHover(c.key)}
                  onClick={handleClickItem}
                >
                  <span className="text-[16px]">{c.name}</span>
                  {fieldKey === c.key && (
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
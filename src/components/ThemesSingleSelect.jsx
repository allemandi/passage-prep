import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import clsx from "clsx";
import defaultThemes from "../data/themes.json";

const ThemesSingleSelect = ({
  value,
  onChange,
  themes = defaultThemes,
  label = "Themes",
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectTheme = (theme) => {
    onChange(theme);
    setOpen(false);
  };

  return (
    <div className="relative w-full max-w-[260px]" ref={containerRef}>
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          "flex justify-between items-center w-full rounded-md px-3 py-2 text-sm",
          "border border-gray-300 dark:border-gray-600",
          "bg-white dark:bg-gray-800",
          "text-gray-900 dark:text-gray-100",
          "shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          open ? "ring-2 ring-blue-500 border-blue-500" : "hover:border-gray-400 dark:hover:border-gray-500"
        )}
      >
   <span className={clsx("truncate", !value && "text-gray-400")}>
  {value || "Select a theme"}
</span>
        <ChevronDown
          className={clsx(
            "w-4 h-4 transition-colors",
            open ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
          )}
        />
      </button>

      {open && (
        <div
          className={clsx(
            "absolute z-10 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-gray-300 dark:border-gray-600",
            "bg-white dark:bg-gray-800 shadow-lg"
          )}
          role="listbox"
        >
          {themes.map((theme) => {
            const isSelected = value === theme;
            return (
              <div
                key={theme}
                role="option"
                aria-selected={isSelected}
                onClick={() => selectTheme(theme)}
                className={clsx(
                  "flex items-center justify-between px-3 py-2 text-sm cursor-pointer select-none",
                  isSelected
                    ? "bg-blue-500 text-white font-medium"
                    : "text-gray-900 dark:text-gray-100 hover:bg-blue-600 hover:text-white"
                )}
              >
                <span>{theme}</span>
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemesSingleSelect;

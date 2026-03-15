import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import clsx from "clsx";
import defaultThemes from "../../data/themes.json";

export { defaultThemes };

const ThemeSelect = ({
  value,
  onChange,
  themes = defaultThemes,
  label = "Theme(s)",
  isRequired = false,
  isMulti = false,
  placeholder = "Select theme(s)",
  className,
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

  const toggleTheme = (theme) => {
    if (isMulti) {
      const allSelected = value.length === themes.length;
      const isSelected = value.includes(theme);

      if (allSelected) {
        onChange([theme]);
      } else if (isSelected) {
        const newValue = value.filter((t) => t !== theme);
        onChange(newValue.length === 0 ? themes : newValue);
      } else {
        onChange([...value, theme]);
      }
    } else {
      onChange(theme);
      setOpen(false);
    }
  };

  const displayText = isMulti
    ? value.length === themes.length
      ? "All"
      : value.join(", ")
    : value || placeholder;

  return (
    <div className={clsx("relative w-full", className)} ref={containerRef}>
      <label className="block mb-1.5 text-sm font-medium text-app-text">
        {label} {isRequired && <span className="text-secondary-500">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          "flex justify-between items-center w-full rounded-lg px-3 py-2.5 text-sm",
          "border-2 border-app-border transition-all duration-200",
          "bg-app-surface text-app-text shadow-sm",
          "focus:outline-none focus:ring-4 focus:ring-primary-400/20",
          "overflow-hidden",
          open
            ? "border-primary-400 ring-4 ring-primary-400/20"
            : "hover:border-primary-300"
        )}
      >
        <span className={clsx("truncate flex-grow text-left", !isMulti && !value && "text-app-text-muted")}>
          {displayText}
        </span>
        <ChevronDown
          className={clsx(
            "w-4 h-4 flex-shrink-0 transition-transform duration-300 ml-2",
            open ? "rotate-180 text-primary-500" : "text-app-text-muted"
          )}
        />
      </button>

      {open && (
        <div
          className={clsx(
            "absolute z-20 mt-2 w-full max-h-60 overflow-y-auto rounded-xl border-2 border-app-border",
            "bg-app-surface shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-200"
          )}
          role="listbox"
        >
          {themes.map((theme) => {
            const isSelected = isMulti ? value.includes(theme) : value === theme;
            return (
              <div
                key={theme}
                role="option"
                aria-selected={isSelected}
                onClick={() => toggleTheme(theme)}
                className={clsx(
                  "flex items-center justify-between px-4 py-3 text-sm cursor-pointer select-none transition-all duration-200",
                  isSelected
                    ? "bg-primary-500 text-white font-bold"
                    : "text-app-text hover:bg-primary-50 dark:hover:bg-primary-900/30"
                )}
              >
                <span>{theme}</span>
                {isSelected && <Check className="w-4 h-4" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeSelect;

import React from "react";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, Label, Transition } from "@headlessui/react";
import { ChevronDown, Check, Square, CheckSquare, X } from "lucide-react";
import clsx from "clsx";
import defaultThemes from "../../data/themes.json";

export { defaultThemes };

const ThemeSelect = ({
  value,
  onChange,
  themes = defaultThemes,
  label = "Theme(s)",
  required = false,
  isMulti = false,
  placeholder = "Select theme(s)",
  error,
  className,
}) => {
  const isAllSelected = Array.isArray(value) && value.length === themes.length;
  const isNoneSelected = !Array.isArray(value) || value.length === 0;

  const displayText = React.useMemo(() => {
    if (!isMulti) return value || placeholder;
    if (!Array.isArray(value) || value.length === 0) return "Any theme";
    if (isAllSelected) return "All themes";
    if (value.length > 2) return `${value.length} themes selected`;
    return value.join(", ");
  }, [isMulti, value, isAllSelected, placeholder]);

  const handleSelectionChange = (newSelection) => {
    onChange(newSelection);
  };

  const selectAll = (e) => {
    e.stopPropagation();
    onChange(themes);
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className={clsx("relative w-full", className)}>
      <Listbox value={value} onChange={handleSelectionChange} multiple={isMulti}>
        {({ open }) => (
          <>
            <Label className="block mb-2 text-base font-bold text-app-text">
              {label} {required && <span className="text-secondary-600 font-bold" aria-hidden="true">*</span>}
            </Label>
            <div className="relative">
              <ListboxButton
                className={clsx(
                  "flex justify-between items-center w-full rounded-xl px-4 py-3 text-base min-h-[48px]",
                  "border transition-all duration-200",
                  "bg-app-surface text-app-text shadow-2xs",
                  "focus:outline-none focus-visible:ring-4 overflow-hidden text-left font-medium",
                  error
                    ? "border-secondary-500 focus-visible:ring-secondary-500/30"
                    : open
                    ? "border-primary-500 ring-4 ring-primary-500/20"
                    : "border-app-border hover:border-primary-400"
                )}
              >
                <span className={clsx("truncate flex-grow", isMulti ? isNoneSelected && "text-app-text-muted" : !value && "text-app-text-muted")}>
                  {displayText}
                </span>
                <ChevronDown
                  className={clsx(
                    "w-5 h-5 flex-shrink-0 transition-transform duration-200 ml-2",
                    open ? "rotate-180 text-primary-600 dark:text-primary-400" : "text-app-text-muted"
                  )}
                />
              </ListboxButton>

              {error && (
                <p className="mt-1.5 text-sm text-secondary-600 font-bold">
                  {error}
                </p>
              )}

              <Transition
                as={React.Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <ListboxOptions
                  className={clsx(
                    "absolute z-[100] mt-2 w-full max-h-64 overflow-y-auto rounded-xl border border-app-border",
                    "bg-app-surface shadow-2xl py-1 focus:outline-none",
                    "bottom-full mb-2.5 mt-0" // Always position above button if tight at bottom or stack cleanly with high z-index
                  )}
                >
                  {isMulti && (
                    <div className="sticky top-0 z-10 bg-app-surface border-b border-app-border p-2 flex gap-2 shadow-2xs">
                        <button
                            type="button"
                            onClick={selectAll}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg bg-primary-100 text-primary-800 hover:bg-primary-200 dark:bg-primary-950/60 dark:text-primary-200 transition-colors min-h-[36px]"
                        >
                            <CheckSquare size={14} />
                            Select All
                        </button>
                        <button
                            type="button"
                            onClick={clearAll}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 transition-colors min-h-[36px]"
                        >
                            <X size={14} />
                            Clear
                        </button>
                    </div>
                  )}
                  {themes.map((theme) => (
                    <ListboxOption
                      key={theme}
                      value={theme}
                      className={({ focus, selected }) =>
                        clsx(
                          "flex items-center justify-between px-4 py-3 text-base cursor-pointer select-none transition-all duration-150 min-h-[44px]",
                          selected
                            ? "bg-primary-600 text-white font-bold dark:bg-primary-500"
                            : focus
                            ? "bg-primary-100 text-primary-900 dark:bg-primary-950/60 dark:text-primary-100 font-semibold"
                            : "text-app-text"
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className="truncate flex items-center gap-3">
                            {isMulti && (
                                selected ? <CheckSquare size={18} /> : <Square size={18} className="text-app-text-muted opacity-60" />
                            )}
                            {theme}
                          </span>
                          {selected && !isMulti && <Check className="w-5 h-5 ml-2 flex-shrink-0 stroke-[3]" />}
                        </>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  );
};

export default ThemeSelect;

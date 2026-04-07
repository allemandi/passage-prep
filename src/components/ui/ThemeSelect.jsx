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
            <Label className="block mb-1.5 text-sm font-medium text-app-text">
              {label} {required && <span className="text-secondary-600 font-bold">*</span>}
            </Label>
            <div className="relative">
              <ListboxButton
                className={clsx(
                  "flex justify-between items-center w-full rounded-lg px-3 py-2.5 text-sm",
                  "border-2 transition-all duration-200",
                  "bg-app-surface text-app-text shadow-sm",
                  "focus:outline-none focus:ring-4 overflow-hidden text-left",
                  error
                    ? "border-secondary-400 focus:ring-secondary-400/20"
                    : open
                    ? "border-primary-400 ring-4 ring-primary-400/20"
                    : "border-app-border hover:border-primary-300"
                )}
              >
                <span className={clsx("truncate flex-grow", isMulti ? isNoneSelected && "text-app-text-muted" : !value && "text-app-text-muted")}>
                  {displayText}
                </span>
                <ChevronDown
                  className={clsx(
                    "w-4 h-4 flex-shrink-0 transition-transform duration-300 ml-2",
                    open ? "rotate-180 text-primary-500" : "text-app-text-muted"
                  )}
                />
              </ListboxButton>

              {error && (
                <p className="mt-1 text-xs text-secondary-600 font-medium">
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
                    "absolute z-50 mt-2 w-full max-h-72 overflow-y-auto rounded-xl border-2 border-app-border",
                    "bg-app-surface shadow-2xl py-1 focus:outline-none"
                  )}
                >
                  {isMulti && (
                    <div className="sticky top-0 z-10 bg-app-surface border-b border-app-border px-2 py-2 flex gap-2">
                        <button
                            type="button"
                            onClick={selectAll}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 transition-colors"
                        >
                            <CheckSquare size={14} />
                            Select All
                        </button>
                        <button
                            type="button"
                            onClick={clearAll}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg bg-secondary-50 text-secondary-600 hover:bg-secondary-100 dark:bg-secondary-900/20 dark:text-secondary-400 transition-colors"
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
                          "flex items-center justify-between px-4 py-3 text-sm cursor-pointer select-none transition-all duration-200",
                          selected
                            ? "bg-primary-500 text-white font-bold"
                            : focus
                            ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-200"
                            : "text-app-text"
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className="truncate flex items-center gap-3">
                            {isMulti && (
                                selected ? <CheckSquare size={16} /> : <Square size={16} className="text-app-text-muted opacity-50" />
                            )}
                            {theme}
                          </span>
                          {selected && !isMulti && <Check className="w-4 h-4 ml-2 flex-shrink-0" />}
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

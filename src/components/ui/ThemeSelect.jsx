import React from "react";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, Label, Transition } from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";
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
  className,
}) => {
  const displayText = isMulti
    ? (Array.isArray(value) && value.length === themes.length)
      ? "All"
      : Array.isArray(value) ? value.join(", ") : placeholder
    : value || placeholder;

  const handleSelectionChange = (newSelection) => {
    if (!isMulti) {
      onChange(newSelection);
      return;
    }

    const currentValues = Array.isArray(value) ? value : [];
    const allSelected = currentValues.length === themes.length;

    if (allSelected) {
      // In multiple mode, if we were at "All" and clicked one theme,
      // Headless UI returns an array with all OTHER themes (it toggles the clicked one OFF).
      // We want to detect which one was toggled and make it the ONLY selected one.
      const toggledOff = themes.find(t => !newSelection.includes(t));
      if (toggledOff) {
        onChange([toggledOff]);
        return;
      }
    }

    if (newSelection.length === 0) {
      // If everything is deselected, reset to all themes
      onChange(themes);
    } else {
      onChange(newSelection);
    }
  };

  return (
    <div className={clsx("relative w-full", className)}>
      <Listbox value={value} onChange={handleSelectionChange} multiple={isMulti}>
        {({ open }) => (
          <>
            <Label className="block mb-1.5 text-sm font-medium text-app-text">
              {label} {required && <span className="text-secondary-500">*</span>}
            </Label>
            <div className="relative">
              <ListboxButton
                className={clsx(
                  "flex justify-between items-center w-full rounded-lg px-3 py-2.5 text-sm",
                  "border-2 border-app-border transition-all duration-200",
                  "bg-app-surface text-app-text shadow-sm",
                  "focus:outline-none focus:ring-4 focus:ring-primary-400/20",
                  "overflow-hidden text-left",
                  open
                    ? "border-primary-400 ring-4 ring-primary-400/20"
                    : "hover:border-primary-300"
                )}
              >
                <span className={clsx("truncate flex-grow", isMulti ? (!value || value.length === 0) && "text-app-text-muted" : !value && "text-app-text-muted")}>
                  {displayText}
                </span>
                <ChevronDown
                  className={clsx(
                    "w-4 h-4 flex-shrink-0 transition-transform duration-300 ml-2",
                    open ? "rotate-180 text-primary-500" : "text-app-text-muted"
                  )}
                />
              </ListboxButton>

              <Transition
                as={React.Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <ListboxOptions
                  className={clsx(
                    "absolute z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-xl border-2 border-app-border",
                    "bg-app-surface shadow-2xl py-1 focus:outline-none"
                  )}
                >
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
                          <span className="truncate">{theme}</span>
                          {selected && <Check className="w-4 h-4 ml-2 flex-shrink-0" />}
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

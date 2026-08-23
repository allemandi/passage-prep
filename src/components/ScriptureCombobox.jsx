import React, { useMemo } from 'react';
import Select from 'react-select';
import clsx from 'clsx';

const ScriptureCombobox = React.forwardRef(({
    id,
    label,
    ariaLabel,
    value,
    onChange,
    options = [],
    placeholder,
    disabled = false,
    required = false,
    helperText = '',
    isEndVerse = false,
    startVerseValue = '',
    error,
    className,
}, ref) => {
    const processedOptions = useMemo(() => {
        let opts = options;
        if (isEndVerse && startVerseValue) {
            const numericStartVerse = parseInt(startVerseValue, 10);
            if (!isNaN(numericStartVerse)) {
                opts = opts.filter(v => {
                    const numericOption = parseInt(String(v), 10);
                    return !isNaN(numericOption) && numericOption >= numericStartVerse;
                });
            }
        }
        return opts.map(opt => ({ value: String(opt), label: String(opt) }));
    }, [options, isEndVerse, startVerseValue]);

    const selectedValue = useMemo(() =>
        value ? { value: String(value), label: String(value) } : null
    , [value]);

    const handleChange = (selectedOption) => {
        onChange(selectedOption ? selectedOption.value : '');
    };

    const finalIsDisabled = disabled || (isEndVerse && !startVerseValue);

    const displayPlaceholder = useMemo(() => {
        if (finalIsDisabled && isEndVerse && !startVerseValue) return "Select start verse first";
        return placeholder || `Select ${label.toLowerCase()}...`;
    }, [finalIsDisabled, isEndVerse, startVerseValue, placeholder, label]);

    return (
        <div className={clsx("relative w-full", className)}>
            <label
                htmlFor={id}
                className="block mb-1.5 text-sm font-medium text-app-text"
            >
                {label} {required && <span className="text-secondary-600 font-bold" aria-hidden="true">*</span>}
            </label>
            <Select
                ref={ref}
                inputId={id}
                aria-label={ariaLabel || label}
                options={processedOptions}
                value={selectedValue}
                onChange={handleChange}
                placeholder={displayPlaceholder}
                isDisabled={finalIsDisabled}
                isClearable
                isSearchable
                unstyled
                classNames={{
                    control: ({ isFocused }) =>
                        clsx(
                            "flex items-center min-h-[42px] px-3 rounded-lg border-2 transition-all duration-300 bg-app-surface",
                            error
                                ? "border-secondary-400"
                                : isFocused
                                    ? "border-primary-400 ring-4 ring-primary-400/20"
                                    : "border-app-border hover:border-primary-300",
                            finalIsDisabled && "opacity-50 cursor-not-allowed"
                        ),
                    valueContainer: () => "flex gap-1 py-1 overflow-hidden",
                    input: () => "text-app-text !m-0 !p-0",
                    singleValue: () => "text-app-text truncate",
                    placeholder: () => "text-app-text-muted truncate",
                    indicatorsContainer: () => "flex items-center gap-1",
                    indicatorSeparator: () => "hidden",
                    dropdownIndicator: ({ isFocused }) =>
                        clsx("p-1 transition-colors duration-200", isFocused ? "text-app-text" : "text-app-text-muted"),
                    clearIndicator: () => "p-1 text-app-text-muted hover:text-secondary-500 transition-colors duration-200",
                    menu: () => "absolute z-50 w-full mt-2 bg-app-surface border-2 border-app-border shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200",
                    menuList: () => "max-h-72 overflow-y-auto py-1",
                    option: ({ isFocused, isSelected }) =>
                        clsx(
                            "px-4 py-3 text-sm cursor-pointer select-none transition-colors duration-150",
                            isSelected
                                ? "bg-primary-500 text-white font-bold"
                                : isFocused
                                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-200"
                                    : "text-app-text hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        ),
                    noOptionsMessage: () => "px-4 py-8 text-sm text-app-text-muted text-center",
                    loadingMessage: () => "px-4 py-8 text-sm text-app-text-muted text-center",
                }}
                styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={document.body}
                menuShouldBlockScroll={true}
                classNamePrefix="react-select"
                aria-required={required}
                aria-disabled={finalIsDisabled}
                aria-describedby={clsx(
                    helperText && `${id}-helper`,
                    error && `${id}-error`
                )}
            />
            {error && (
                <p id={`${id}-error`} className="mt-1 text-xs text-secondary-600 font-medium" role="alert">
                    {error}
                </p>
            )}
            {helperText && (
                <p id={`${id}-helper`} className={clsx("mt-1 text-xs text-app-text-muted", error && "sr-only")}>
                    {helperText}
                </p>
            )}
        </div>
    );
});

ScriptureCombobox.displayName = 'ScriptureCombobox';

export default ScriptureCombobox;

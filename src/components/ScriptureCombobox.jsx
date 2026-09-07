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
                className="block mb-2 text-base font-bold text-app-text"
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
                            "flex items-center min-h-[48px] px-4 rounded-xl border-2 transition-all duration-200 bg-app-surface text-base font-medium",
                            error
                                ? "border-secondary-500"
                                : isFocused
                                    ? "border-primary-500 ring-4 ring-primary-500/20"
                                    : "border-app-border hover:border-primary-400",
                            finalIsDisabled && "opacity-50 cursor-not-allowed bg-app-bg"
                        ),
                    valueContainer: () => "flex gap-1 py-1.5 overflow-hidden",
                    input: () => "text-app-text !m-0 !p-0 text-base",
                    singleValue: () => "text-app-text font-bold truncate text-base",
                    placeholder: () => "text-app-text-muted truncate text-base font-normal",
                    indicatorsContainer: () => "flex items-center gap-1.5",
                    indicatorSeparator: () => "hidden",
                    dropdownIndicator: ({ isFocused }) =>
                        clsx("p-1.5 transition-colors duration-200", isFocused ? "text-primary-600 dark:text-primary-400" : "text-app-text-muted"),
                    clearIndicator: () => "p-1.5 text-app-text-muted hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors duration-200",
                    menu: () => "absolute z-50 w-full mt-2 bg-app-surface border-2 border-app-border shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200",
                    menuList: () => "max-h-80 overflow-y-auto py-1.5",
                    option: ({ isFocused, isSelected }) =>
                        clsx(
                            "px-4 py-3.5 text-base cursor-pointer select-none transition-colors duration-150 min-h-[48px] flex items-center",
                            isSelected
                                ? "bg-primary-600 text-white font-bold dark:bg-primary-500"
                                : isFocused
                                    ? "bg-primary-100 text-primary-900 dark:bg-primary-900/40 dark:text-primary-100 font-semibold"
                                    : "text-app-text hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        ),
                    noOptionsMessage: () => "px-4 py-8 text-base text-app-text-muted text-center font-medium",
                    loadingMessage: () => "px-4 py-8 text-base text-app-text-muted text-center font-medium",
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
                <p id={`${id}-error`} className="mt-1.5 text-sm text-secondary-600 font-bold" role="alert">
                    {error}
                </p>
            )}
            {helperText && (
                <p id={`${id}-helper`} className={clsx("mt-1.5 text-sm text-app-text-muted font-medium", error && "sr-only")}>
                    {helperText}
                </p>
            )}
        </div>
    );
});

ScriptureCombobox.displayName = 'ScriptureCombobox';

export default ScriptureCombobox;

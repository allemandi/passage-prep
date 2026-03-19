import React, { useMemo } from 'react';
import Select from 'react-select';
import clsx from 'clsx';

const ScriptureCombobox = ({
    id,
    label,
    value,
    onChange,
    options = [],
    placeholder,
    disabled = false,
    isRequired = false,
    helperText = '',
    isEndVerse = false,
    startVerseValue = '',
    className,
}) => {
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
                {label} {isRequired && <span className="text-secondary-500">*</span>}
            </label>
            <Select
                inputId={id}
                aria-label={label}
                options={processedOptions}
                value={selectedValue}
                onChange={handleChange}
                placeholder={displayPlaceholder}
                isDisabled={finalIsDisabled}
                isClearable
                isSearchable
                styles={{
                    control: (base) => ({
                        ...base,
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-app)',
                    }),
                    menu: (base) => ({
                        ...base,
                        backgroundColor: 'var(--bg-surface)',
                    }),
                    option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                            ? 'var(--color-primary-500)'
                            : state.isFocused
                                ? 'rgba(56, 189, 248, 0.15)'
                                : 'transparent',
                        color: state.isSelected
                            ? 'white'
                            : 'var(--text-app)',
                        ':active': {
                            backgroundColor: 'var(--color-primary-500)',
                        },
                    }),
                    input: (base) => ({ ...base, color: 'var(--select-text-color)' }),
                    singleValue: (base) => ({ ...base, color: 'var(--select-text-color)' }),
                    placeholder: (base) => ({ ...base, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={document.body}
                menuShouldBlockScroll={true}
                classNamePrefix="react-select"
                aria-required={isRequired}
                aria-disabled={finalIsDisabled}
                aria-describedby={helperText ? `${id}-helper` : undefined}
            />
            {helperText && (
                <p id={`${id}-helper`} className="mt-1 text-xs text-app-text-muted">
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default ScriptureCombobox;

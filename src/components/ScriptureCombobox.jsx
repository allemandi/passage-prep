import Select from 'react-select';

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
    startVerseValue = ''
}) => {

    let processedOptions = options;
    if (isEndVerse && startVerseValue) {
        const numericStartVerse = parseInt(startVerseValue, 10);
        if (!isNaN(numericStartVerse)) {
            processedOptions = processedOptions.filter(v => {
                const numericOption = parseInt(String(v), 10);
                return !isNaN(numericOption) && numericOption >= numericStartVerse;
            });
        }
    }
    const selectOptions = processedOptions.map(opt => ({ value: String(opt), label: String(opt) }));
    const selectedValue = value ? { value: String(value), label: String(value) } : null;

    const handleChange = (selectedOption) => {
        onChange(selectedOption ? selectedOption.value : '');
    };

    const finalIsDisabled = disabled || (isEndVerse && !startVerseValue);

    const displayPlaceholder = () => {
        if (finalIsDisabled && isEndVerse && !startVerseValue) return "Select start verse first";
        return placeholder || `Select ${label.toLowerCase()}...`;
    };


    return (
        <div className="relative w-full">
            <label
                htmlFor={id}
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
                {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <Select
                inputId={id}
                options={selectOptions}
                value={selectedValue}
                onChange={handleChange}
                placeholder={displayPlaceholder()}
                isDisabled={finalIsDisabled}
                isClearable
                isSearchable
                styles={{
                    input: (base) => ({ ...base, color: 'var(--select-text-color)' }),
                    singleValue: (base) => ({ ...base, color: 'var(--select-text-color)' }),
                }}
                menuPortalTarget={document.body}
                menuShouldBlockScroll={true}
                classNamePrefix="react-select"
                aria-label={label}
            />
            {helperText && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
            )}
        </div>
    );
};

export default ScriptureCombobox;

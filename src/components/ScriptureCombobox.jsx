import React, { useState, useEffect, useRef } from 'react';

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
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [inputValue, setInputValue] = useState(value || '');
  const containerRef = useRef(null);

  // Filter options based on end verse logic
  useEffect(() => {
    if (isEndVerse && startVerseValue) {
      setFilteredOptions(options.filter(v => parseInt(v) >= parseInt(startVerseValue)));
    } else {
      setFilteredOptions(options);
    }
  }, [options, isEndVerse, startVerseValue]);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleInputClick = () => {
    if (!disabled && (!isEndVerse || startVerseValue)) {
      setIsOpen(true);
    }
  };

  const handleSelect = (option) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
  };

  const isDisabled = disabled || (isEndVerse && !startVerseValue);

  const displayPlaceholder = () => {
    if (disabled) return placeholder || "Select previous field first";
    if (isEndVerse && !startVerseValue) return "Select start verse first";
    return placeholder || `Select ${label.toLowerCase()}...`;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label
        htmlFor={id}
        className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type="text"
        className={`
          w-full rounded-md border border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-800
          py-2 px-3
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed
          ${isDisabled ? 'cursor-not-allowed' : 'cursor-text'}
        `}
        placeholder={displayPlaceholder()}
        value={inputValue}
        onClick={handleInputClick}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
        }}
        disabled={isDisabled}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={`${id}-listbox`}
        aria-haspopup="listbox"
        aria-required={isRequired}
      />
      {helperText && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
      {isOpen && filteredOptions.length > 0 && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 shadow-lg focus:outline-none"
        >
          {filteredOptions.map((option) => (
            <li
              key={option}
              role="option"
              aria-selected={option === inputValue}
              className={`cursor-pointer select-none py-2 px-3 text-gray-900 dark:text-gray-100 hover:bg-blue-600 hover:text-white
                ${option === inputValue ? 'bg-blue-500 text-white' : ''}
              `}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(option);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ScriptureCombobox;

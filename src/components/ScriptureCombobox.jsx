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
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // Added
  const containerRef = useRef(null);
  const listboxRef = useRef(null); // Added for scrolling UL
  const optionRefs = useRef([]); // Added for LI refs

  // Effect for syncing inputValue from the external `value` prop
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Effect for determining `highlightedIndex` based on `filteredOptions`, `inputValue`, and `value` (external prop)
  // Also updates `optionRefs.current` for scrolling purposes.
  useEffect(() => {
    let newIndex = -1; // Default: no highlight

    if (inputValue) {
      // If there's text in the input box (user typing), try to match it exactly
      const exactMatchIndex = filteredOptions.findIndex(
        (option) => String(option).toLowerCase() === String(inputValue).toLowerCase()
      );
      if (exactMatchIndex !== -1) {
        newIndex = exactMatchIndex;
      }
      // If inputValue is present but no exact match, newIndex remains -1.
      // This allows arrow keys to start fresh from top/bottom as per requirements.
    } else if (value) {
      // If input box is empty, but there's an external `value` prop, try to match that.
      // This handles initial load with a value, or when value prop changes externally while input is empty.
      const valueMatchIndex = filteredOptions.findIndex(
        (option) => String(option).toLowerCase() === String(value).toLowerCase()
      );
      if (valueMatchIndex !== -1) {
        newIndex = valueMatchIndex;
      }
    }
    // If both inputValue and value are empty or non-matching from the above, newIndex correctly remains -1.

    setHighlightedIndex(newIndex);

    // Ensure option refs are updated for scrolling functionality
    optionRefs.current = filteredOptions.map(
      (_, i) => optionRefs.current[i] || React.createRef()
    );
  }, [filteredOptions, inputValue, value]); // Dependencies: These are the signals that should re-evaluate highlight.

  // Filter options based on end verse logic AND inputValue typed by user (primary filtering logic)
  useEffect(() => {
    let newFilteredOptions = options;

    if (isEndVerse && startVerseValue) {
      newFilteredOptions = newFilteredOptions.filter(v => parseInt(v) >= parseInt(startVerseValue));
    }

    if (inputValue) {
      newFilteredOptions = newFilteredOptions.filter(option =>
        String(option).toLowerCase().startsWith(String(inputValue).toLowerCase())
      );
    }

    setFilteredOptions(newFilteredOptions);
  }, [options, isEndVerse, startVerseValue, inputValue]); // This hook is responsible for producing `filteredOptions`

  // Commenting out the placeholder for the removed useEffect to make the diff cleaner.
  // No actual code change here, just removing commented out lines from previous attempts.

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1); // Reset highlight when closing
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Scroll to highlighted item
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
      const optionElement = optionRefs.current[highlightedIndex]?.current;
      if (optionElement) {
        optionElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen, filteredOptions]); // Added filteredOptions dependency

  const handleInputClick = () => {
    if (!disabled && (!isEndVerse || startVerseValue)) {
      setIsOpen(true);
    }
  };

  const handleSelect = (option) => {
    setInputValue(String(option)); // Ensure inputValue is a string
    onChange(option);
    setIsOpen(false);
    setHighlightedIndex(filteredOptions.findIndex(op => op === option)); // Highlight selected
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      // Prevent opening if there are no options to navigate to, unless user is typing
      if (filteredOptions.length === 0 && inputValue === "") return;
      setIsOpen(true);
    }

    // Guard for no options available for navigation or selection
    if (!filteredOptions.length && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prevIndex => {
        const newIndex = prevIndex + 1;
        return newIndex >= filteredOptions.length ? 0 : newIndex;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prevIndex => {
        const newIndex = prevIndex - 1;
        return newIndex < 0 ? filteredOptions.length - 1 : newIndex;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex]);
      } else if (filteredOptions.length === 1) {
        // If there's only one option and nothing is highlighted (e.g. after typing to filter to one)
        // treat Enter as selecting that one option.
        handleSelect(filteredOptions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
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
          // No need to reset highlightedIndex here explicitly,
          // the useEffect on filteredOptions will handle it if they change.
          // However, if input becomes empty, we might want to reset.
          if (e.target.value === "") {
            setHighlightedIndex(-1);
          }
        }}
        onKeyDown={handleKeyDown} // Added
        disabled={isDisabled}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={`${id}-listbox`}
        aria-haspopup="listbox"
        aria-required={isRequired}
        aria-activedescendant={isOpen && highlightedIndex > -1 ? `${id}-option-${highlightedIndex}` : undefined} // Added
      />
      {helperText && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
      {isOpen && filteredOptions.length > 0 && (
        <ul
          id={`${id}-listbox`}
          ref={listboxRef} // Added
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 shadow-lg focus:outline-none"
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option} // Assuming options are unique. If not, a unique key is needed.
              id={`${id}-option-${index}`} // Added
              ref={optionRefs.current[index]} // Added
              role="option"
              aria-selected={highlightedIndex === index} // Simplified aria-selected
              className={`cursor-pointer select-none py-2 px-3 text-gray-900 dark:text-gray-100 hover:bg-blue-600 hover:text-white
                ${highlightedIndex === index ? 'bg-blue-600 text-white' : ''}
                ${highlightedIndex === -1 && inputValue === String(option) ? 'bg-blue-500 text-white' : ''}
              `}
              onMouseDown={(e) => { // Using onMouseDown to prevent input blur before click registers
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

import React, { useEffect } from 'react';
import { Autocomplete, TextField, useTheme } from '@mui/material';

const ScriptureCombobox = ({ 
  id, 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, 
  disabled, 
  isRequired, 
  helperText, 
  sx,
  isEndVerse = false,
  startVerseValue = ''
}) => {
  const theme = useTheme();
  
  // Filter options for end verse to be >= start verse
  const filteredOptions = isEndVerse && startVerseValue 
    ? options.filter(v => parseInt(v) >= parseInt(startVerseValue))
    : options;

  // Disable end verse if no start verse selected
  const isDisabled = disabled || (isEndVerse && !startVerseValue);

  // Placeholder text logic
  const getPlaceholder = () => {
    if (disabled) return placeholder || "Select previous field first";
    if (isEndVerse && !startVerseValue) return "Select start verse first";
    return placeholder || `Select ${label.toLowerCase()}...`;
  };

  return (
    <Autocomplete
      id={id}
      options={filteredOptions}
      value={value || null}
      onChange={(_, newValue) => onChange(newValue)}
      disabled={isDisabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={getPlaceholder()}
          required={isRequired}
          helperText={helperText}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              transition: 'none',
              '& fieldset': {
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                borderWidth: 1.5,
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderWidth: 2,
              },
              '&.Mui-disabled': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
              }
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.95rem',
              transform: 'translate(14px, 16px) scale(1)',
              '&.Mui-focused, &.MuiFormLabel-filled': {
                transform: 'translate(14px, -9px) scale(0.75)'
              }
            },
            '& .MuiAutocomplete-input': {
              fontSize: '1rem',
              padding: '12.5px 14px !important',
              minWidth: '120px'
            },
            '& .MuiFormHelperText-root': {
              mt: 1,
              fontSize: '0.85rem',
              ml: 0,
            },
            width: '100%',
            ...sx
          }}
        />
      )}
      sx={{
        width: '100%',
        '& .MuiAutocomplete-listbox': {
          '& .MuiAutocomplete-option': {
            fontSize: '1rem',
            paddingTop: 1,
            paddingBottom: 1,
          },
        },
      }}
    />
  );
};

export default ScriptureCombobox;
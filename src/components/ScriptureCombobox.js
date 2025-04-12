import React from 'react';
import { Autocomplete, TextField, Typography, Box } from '@mui/material';

const ScriptureCombobox = ({ 
  id, 
  label, 
  value, 
  onChange, 
  options, 
  isRequired = false,
  placeholder = "Select...",
  disabled = false,
  helperText
}) => {
  const handleChange = (event, newValue) => {
    onChange(newValue || '');
  };

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography 
          variant="subtitle2" 
          sx={{ mb: 0.5, fontWeight: isRequired ? 'medium' : 'regular' }}
        >
          {label}{isRequired && <Box component="span" sx={{ color: 'error.main' }}>*</Box>}
        </Typography>
      )}
      
      <Autocomplete
        id={id}
        value={value}
        onChange={handleChange}
        options={options}
        disabled={disabled}
        fullWidth
        blurOnSelect
        clearOnBlur
        handleHomeEndKeys
        selectOnFocus
        autoHighlight
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            variant="outlined"
            size="small"
            fullWidth
            required={isRequired}
            helperText={helperText}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
            }}
          />
        )}
        noOptionsText="No options available"
        ListboxProps={{
          style: { maxHeight: 200 }
        }}
      />
    </Box>
  );
};

export default ScriptureCombobox; 
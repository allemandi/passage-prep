import { 
  Box, 
  Typography, 
  MenuItem,
  Paper,
  useTheme,
  Checkbox,
  ListItemText,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput
} from '@mui/material';
import React from 'react';

const ThemesSection = ({ selectedThemes, setSelectedThemes, themes }) => {
  const theme = useTheme();
  if (!theme?.palette) {
    return null;
  }

  const borderColor = theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(0, 0, 0, 0.12)';

  const handleThemeChange = (event) => {
    const { value } = event.target;
    setSelectedThemes(value);
  };

  return (
    <Paper 
      elevation={theme.palette.mode === 'dark' ? 2 : 1}
      sx={{ 
        p: { xs: 2.5, sm: 3.5 }, 
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default', 
        borderRadius: 3,
        height: '100%',
        border: `1px solid ${borderColor}`
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          fontWeight: 500, 
          color: 'primary.main',
          pb: 1.5,
          borderBottom: `2px solid ${theme.palette.primary.main}`,
          mb: 3.5
        }}
      >
        Themes
      </Typography>
      
      <Box>
        <FormControl fullWidth>
          <InputLabel id="themes-select-label">Themes</InputLabel>
          <Select
            labelId="themes-select-label"
            id="themes-select"
            multiple
            value={selectedThemes}
            onChange={handleThemeChange}
            input={<OutlinedInput label="Themes" />}
            renderValue={(selected) => selected.join(', ')}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                '& fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  borderWidth: 1.5,
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderWidth: 2,
                }
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.95rem',
              },
              '& .MuiMenuItem-root': {
                fontSize: '0.95rem',
              }
            }}
          >
            {themes.map((themeOption) => (
              <MenuItem key={themeOption} value={themeOption}>
                <Checkbox checked={selectedThemes.indexOf(themeOption) > -1} />
                <ListItemText primary={themeOption} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default ThemesSection;
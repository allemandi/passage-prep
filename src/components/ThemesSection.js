import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  MenuItem,
  Paper,
  useTheme
} from '@mui/material';

const ThemesSection = ({ theme1, setTheme1, theme2, setTheme2, themes }) => {
  const theme = useTheme();
  
  return (
    <Paper 
      elevation={theme.palette.mode === 'dark' ? 2 : 1}
      sx={{ 
        p: { xs: 2.5, sm: 3.5 }, 
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default', 
        borderRadius: 3,
        height: '100%',
        border: `1px solid ${theme.palette.divider}`
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
        <TextField
          select
          fullWidth
          id="theme1"
          label="Theme 1"
          value={theme1}
          onChange={(e) => setTheme1(e.target.value)}
          required
          size="medium"
          sx={{ 
            mb: 3.5,
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
          <MenuItem value="">
            <em>Select a theme</em>
          </MenuItem>
          {themes.map((theme, index) => (
            <MenuItem key={index} value={theme}>{theme}</MenuItem>
          ))}
        </TextField>
        
        <TextField
          select
          fullWidth
          id="theme2"
          label="Theme 2 (Optional)"
          value={theme2}
          onChange={(e) => setTheme2(e.target.value)}
          size="medium"
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
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {themes.map((theme, index) => (
            <MenuItem key={index} value={theme}>{theme}</MenuItem>
          ))}
        </TextField>
      </Box>
    </Paper>
  );
};

export default ThemesSection;
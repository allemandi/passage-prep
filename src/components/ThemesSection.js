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
      elevation={theme.palette.mode === 'dark' ? 2 : 0} 
      sx={{ 
        p: 3, 
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default', 
        borderRadius: 2,
        height: '100%',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          fontWeight: 'medium', 
          color: 'primary.main',
          pb: 1,
          borderBottom: `2px solid ${theme.palette.primary.main}`
        }}
      >
        Themes
      </Typography>
      
      <Box sx={{ my: 3 }}>
        <TextField
          select
          fullWidth
          id="theme1"
          label="Theme 1"
          value={theme1}
          onChange={(e) => setTheme1(e.target.value)}
          required
          margin="normal"
          size="small"
          sx={{ mt: 3 }}
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
          margin="normal"
          size="small"
          sx={{ mt: 3 }}
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
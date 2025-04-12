import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  MenuItem,
  Paper,
  useTheme
} from '@mui/material';

const GeneralSettingsSection = ({ subChoice, setSubChoice, maxLimit, setMaxLimit, subcategories }) => {
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
        General Settings
      </Typography>
      
      <Box sx={{ my: 3 }}>
        <TextField
          select
          fullWidth
          id="subChoice"
          label="Subcategories"
          value={subChoice}
          onChange={(e) => setSubChoice(e.target.value)}
          margin="normal"
          size="small"
          sx={{ mt: 3 }}
        >
          {subcategories.map((sub, index) => (
            <MenuItem key={index} value={sub}>{sub}</MenuItem>
          ))}
        </TextField>
        
        <TextField
          select
          fullWidth
          id="maxLimit"
          label="Max Questions"
          value={maxLimit}
          onChange={(e) => setMaxLimit(e.target.value)}
          margin="normal"
          size="small"
          helperText="More themes, more questions"
          sx={{ mt: 3 }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <MenuItem key={num} value={num.toString()}>{num}</MenuItem>
          ))}
        </TextField>
      </Box>
    </Paper>
  );
};

export default GeneralSettingsSection; 
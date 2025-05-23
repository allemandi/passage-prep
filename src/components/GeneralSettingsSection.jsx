import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  MenuItem,
  Paper,
  useTheme
} from '@mui/material';

const GeneralSettingsSection = ({ maxLimit, setMaxLimit }) => {
  const theme = useTheme();
  if (!theme?.palette) {
    return null;
  }

  const borderColor = theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(0, 0, 0, 0.12)';

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
        General Settings
      </Typography>
      
      <Box>
        <TextField
          select
          fullWidth
          id="maxLimit"
          label="Max Questions per Theme"
          value={maxLimit}
          onChange={(e) => setMaxLimit(e.target.value)}
          size="medium"
          helperText="Maximum number of questions to show for each theme"
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
            },
            '& .MuiFormHelperText-root': {
              mt: 1,
              fontSize: '0.85rem'
            }
          }}
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
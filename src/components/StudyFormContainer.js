import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Grid,
  Paper,
  useTheme
} from '@mui/material';
import ScriptureCombobox from './ScriptureCombobox';
import ThemesSection from './ThemesSection';
import GeneralSettingsSection from './GeneralSettingsSection';

const StudyFormContainer = ({ 
  // Bible References props
  bibleBooks,
  selectedBook1,
  setSelectedBook1,
  selectedChapter1,
  setSelectedChapter1,
  availableChapters1,
  totalChapters1,
  selectedBook2,
  setSelectedBook2,
  selectedChapter2,
  setSelectedChapter2,
  availableChapters2,
  totalChapters2,
  scripture1,
  scripture2,
  
  // Themes props
  theme1,
  setTheme1,
  theme2,
  setTheme2,
  themes,
  
  // General Settings props
  subChoice,
  setSubChoice,
  maxLimit,
  setMaxLimit,
  subcategories,
  
  // Form submission props
  isLoading,
  isSubmitting,
  handleSubmit
}) => {
  const theme = useTheme();
  
  return (
    <Paper 
      elevation={theme.palette.mode === 'dark' ? 2 : 0} 
      sx={{ 
        p: 3, 
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default', 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold', 
          textAlign: 'center',
          color: 'primary.main',
          mb: 3
        }}
      >
        Request Bible Study
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
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
              Bible References
            </Typography>
            <Paper 
              elevation={theme.palette.mode === 'dark' ? 2 : 0} 
              sx={{ 
                p: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default', 
                borderRadius: 2,
                mb: 3,
                height: 'auto'
              }}
            >
              <Box sx={{ my: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
                  Scripture 1
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <ScriptureCombobox
                      id="bookSelect1"
                      label="Book"
                      value={selectedBook1}
                      onChange={setSelectedBook1}
                      options={bibleBooks}
                      placeholder="Select a book..."
                      isRequired
                      helperText={selectedBook1 ? `Total chapters: ${totalChapters1}` : ""}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ScriptureCombobox
                      id="chapterSelect1"
                      label="Chapter"
                      value={selectedChapter1}
                      onChange={setSelectedChapter1}
                      options={availableChapters1}
                      placeholder={selectedBook1 ? `Select chapter (1-${totalChapters1})` : "Select a book first"}
                      disabled={!selectedBook1}
                    />
                  </Grid>
                </Grid>
                <input 
                  id="scripture1" 
                  type="hidden" 
                  value={scripture1}
                  required
                />
              </Box>
              <Box sx={{ my: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
                  Scripture 2 (Optional)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <ScriptureCombobox
                      id="bookSelect2"
                      label="Book"
                      value={selectedBook2}
                      onChange={setSelectedBook2}
                      options={bibleBooks}
                      placeholder="Select a book..."
                      helperText={selectedBook2 ? `Total chapters: ${totalChapters2}` : ""}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ScriptureCombobox
                      id="chapterSelect2"
                      label="Chapter"
                      value={selectedChapter2}
                      onChange={setSelectedChapter2}
                      options={availableChapters2}
                      placeholder={selectedBook2 ? `Select chapter (1-${totalChapters2})` : "Select a book first"}
                      disabled={!selectedBook2}
                    />
                  </Grid>
                </Grid>
                <input 
                  id="scripture2" 
                  type="hidden" 
                  value={scripture2}
                />
              </Box>
            </Paper>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <ThemesSection 
              theme1={theme1}
              setTheme1={setTheme1}
              theme2={theme2}
              setTheme2={setTheme2}
              themes={themes}
              sx={{ 
                p: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default', 
                borderRadius: 2,
                mb: 3,
                height: 'auto'
              }}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <GeneralSettingsSection
              subChoice={subChoice}
              setSubChoice={setSubChoice}
              maxLimit={maxLimit}
              setMaxLimit={setMaxLimit}
              subcategories={subcategories}
              sx={{ 
                p: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default', 
                borderRadius: 2,
                mb: 3,
                height: 'auto'
              }}
            />
          </Box>
        </Grid>
      </Grid>
      
      {/* Submit Button */}
      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          disabled={isLoading || isSubmitting}
          size="large"
          sx={{ 
            px: 6, 
            py: 1.5, 
            minWidth: 200,
            borderRadius: 3,
            fontSize: '1rem',
            fontWeight: 'medium'
          }}
          disableElevation
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
              Submitting...
            </>
          ) : 'Generate Study'}
        </Button>
      </Box>
    </Paper>
  );
};

export default StudyFormContainer; 
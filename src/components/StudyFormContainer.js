import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Grid,
  Paper,
  useTheme,
  Container
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
    <Container 
      maxWidth="xl" 
      sx={{ 
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, sm: 4 }
      }}
    >
      <Paper 
        elevation={theme.palette.mode === 'dark' ? 4 : 1}
        sx={{ 
          p: { xs: 2.5, sm: 3.5, md: 4.5 }, 
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
            : '0 8px 24px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 600, 
            textAlign: 'center',
            color: 'primary.main',
            mb: 4,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
          }}
        >
          Request Bible Study
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={theme.palette.mode === 'dark' ? 2 : 1}
              sx={{ 
                p: { xs: 2.5, sm: 3.5 }, 
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default', 
                borderRadius: 3,
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
                Bible References
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 500, 
                    color: 'text.primary', 
                    mb: 2.5,
                    fontSize: '1.1rem'
                  }}
                >
                  Scripture 1
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <ScriptureCombobox
                      id="bookSelect1"
                      label="Book"
                      value={selectedBook1}
                      onChange={setSelectedBook1}
                      options={bibleBooks}
                      placeholder="Select a book..."
                      isRequired
                      helperText={selectedBook1 ? `Total chapters: ${totalChapters1}` : ""}
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ScriptureCombobox
                      id="chapterSelect1"
                      label="Chapter"
                      value={selectedChapter1}
                      onChange={setSelectedChapter1}
                      options={availableChapters1}
                      placeholder={selectedBook1 ? `Select chapter (1-${totalChapters1})` : "Select a book first"}
                      disabled={!selectedBook1}
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                </Grid>
              </Box>
              
              <Box>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 500, 
                    color: 'text.primary', 
                    mb: 2.5,
                    fontSize: '1.1rem'
                  }}
                >
                  Scripture 2 (Optional)
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <ScriptureCombobox
                      id="bookSelect2"
                      label="Book"
                      value={selectedBook2}
                      onChange={setSelectedBook2}
                      options={bibleBooks}
                      placeholder="Select a book..."
                      helperText={selectedBook2 ? `Total chapters: ${totalChapters2}` : ""}
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ScriptureCombobox
                      id="chapterSelect2"
                      label="Chapter"
                      value={selectedChapter2}
                      onChange={setSelectedChapter2}
                      options={availableChapters2}
                      placeholder={selectedBook2 ? `Select chapter (1-${totalChapters2})` : "Select a book first"}
                      disabled={!selectedBook2}
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Paper>
            
            <Box sx={{ mt: 4 }}>
              <ThemesSection 
                theme1={theme1}
                setTheme1={setTheme1}
                theme2={theme2}
                setTheme2={setTheme2}
                themes={themes}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <GeneralSettingsSection
              subChoice={subChoice}
              setSubChoice={setSubChoice}
              maxLimit={maxLimit}
              setMaxLimit={setMaxLimit}
              subcategories={subcategories}
            />
          </Grid>
        </Grid>
        
        <Box 
          sx={{ 
            mt: { xs: 4, sm: 5, md: 6 }, 
            display: 'flex', 
            justifyContent: 'center' 
          }}
        >
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={isLoading || isSubmitting}
            size="large"
            sx={{ 
              px: { xs: 4, sm: 5, md: 6 }, 
              py: 1.5, 
              minWidth: { xs: 200, sm: 240 },
              borderRadius: 2,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 500,
              textTransform: 'none',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 2px 8px rgba(144, 202, 249, 0.2)' 
                : '0 2px 8px rgba(25, 118, 210, 0.2)',
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 12px rgba(144, 202, 249, 0.3)' 
                  : '0 4px 12px rgba(25, 118, 210, 0.3)'
              }
            }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1.5 }} />
                Submitting...
              </>
            ) : 'Generate Study'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default StudyFormContainer;
import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid,
  Paper,
  useTheme,
  Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ScriptureCombobox from './ScriptureCombobox';
import ThemesSection from './ThemesSection';
import GeneralSettingsSection from './GeneralSettingsSection';

const StudyFormContainer = ({ 
  // Bible References props
  bibleBooks,
  scriptureRefs,
  onUpdateScriptureRef,
  onAddScriptureRef,
  
  // Themes props
  selectedThemes,
  setSelectedThemes,
  themes,
  
  // General Settings props
  maxLimit,
  setMaxLimit,
  
  // Form submission props
  isLoading,
  isSubmitting,
  handleSubmit
}) => {
  const theme = useTheme();
  
  // Safety check for theme initialization
  if (!theme?.palette) {
    return null;
  }

  const borderColor = theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(0, 0, 0, 0.12)';
  
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
          border: `1px solid ${borderColor}`,
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
                Bible References
              </Typography>
              
              {scriptureRefs.map((ref, index) => (
                <Box key={ref.id} sx={{ mb: index < scriptureRefs.length - 1 ? 4 : 0 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <ScriptureCombobox
                        id={`bookSelect${ref.id}`}
                        label="Book"
                        value={ref.selectedBook}
                        onChange={(newValue) => onUpdateScriptureRef(index, { selectedBook: newValue })}
                        options={bibleBooks}
                        placeholder="Select a book..."
                        isRequired={index === 0}
                        helperText={ref.selectedBook ? `Total chapters: ${ref.totalChapters}` : ""}
                        sx={{ width: '100%' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ScriptureCombobox
                        id={`chapterSelect${ref.id}`}
                        label="Chapter"
                        value={ref.selectedChapter}
                        onChange={(newValue) => onUpdateScriptureRef(index, { selectedChapter: newValue })}
                        options={ref.availableChapters}
                        placeholder={ref.selectedBook ? `Select chapter (1-${ref.totalChapters})` : "Select a book first"}
                        disabled={!ref.selectedBook}
                        sx={{ width: '100%' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ScriptureCombobox
                        id={`verse-start-${ref.id}`}
                        label="Start Verse"
                        value={ref.startVerse}
                        onChange={(value) => onUpdateScriptureRef(index, { startVerse: value })}
                        options={ref.availableVerses}
                        placeholder="Select start verse"
                        disabled={!ref.selectedChapter}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ScriptureCombobox
                        id={`verse-end-${ref.id}`}
                        label="End Verse"
                        value={ref.endVerse}
                        onChange={(value) => onUpdateScriptureRef(index, { endVerse: value })}
                        options={ref.availableVerses}
                        placeholder="Select end verse"
                        disabled={!ref.selectedChapter}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={onAddScriptureRef}
                  variant="outlined"
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3,
                    py: 1
                  }}
                >
                  Add Scripture Reference
                </Button>
              </Box>
            </Paper>
            
            <Box sx={{ mt: 4 }}>
              <ThemesSection 
                selectedThemes={selectedThemes}
                setSelectedThemes={setSelectedThemes}
                themes={themes}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <GeneralSettingsSection
              maxLimit={maxLimit}
              setMaxLimit={setMaxLimit}
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
        </Box>
      </Paper>
    </Container>
  );
};

export default StudyFormContainer;
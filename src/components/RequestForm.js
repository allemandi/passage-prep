import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  Snackbar,
  useTheme,
  Button,
  Stack,
  Container,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Checkbox,
  ListItemText
} from '@mui/material';
import { processForm, searchQuestions } from '../data/dataService';
import { getBibleBooks, getChaptersForBook, getChapterCountForBook, formatReference, getVerseCountForBookAndChapter } from '../utils/bibleData';
import StudyFormContainer from './StudyFormContainer';
import QuestionTable from './QuestionTable';
import { rateLimiter, getUserIdentifier } from '../utils/rateLimit';
import { processInput } from '../utils/inputUtils';
import themes from '../data/themes.json';
import ScriptureCombobox from './ScriptureCombobox';

const RequestForm = ({ onStudyGenerated, isLoading }) => {
  const theme = useTheme();
  const [scriptureRefs, setScriptureRefs] = useState([
    {
      id: 1,
      scripture: '',
      selectedBook: '',
      selectedChapter: '',
      startVerse: '',
      endVerse: '',
      availableChapters: [],
      totalChapters: 0,
      availableVerses: []
    }
  ]);
  
  const [selectedThemes, setSelectedThemes] = useState(themes); // Default to all themes selected
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noQuestionsFound, setNoQuestionsFound] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Bible books from the JSON data
  const bibleBooks = getBibleBooks();

  const addScriptureReference = () => {
    setScriptureRefs(prev => [...prev, {
      id: prev.length + 1,
      scripture: '',
      selectedBook: '',
      selectedChapter: '',
      startVerse: '',
      endVerse: '',
      availableChapters: [],
      totalChapters: 0,
      availableVerses: []
    }]);
  };

  const updateScriptureRef = (index, updates) => {
    setScriptureRefs(prev => {
      const newRefs = [...prev];
      const currentRef = newRefs[index];
      
      // If updating the book, reset the chapter and recalculate chapters
      if (updates.selectedBook !== undefined && updates.selectedBook !== currentRef.selectedBook) {
        const chapters = getChaptersForBook(updates.selectedBook);
        const chapterCount = getChapterCountForBook(updates.selectedBook);
        newRefs[index] = {
          ...currentRef,
          ...updates,
          selectedChapter: '',
          startVerse: '',
          endVerse: '',
          availableChapters: chapters,
          totalChapters: chapterCount,
          availableVerses: [],
          scripture: formatReference(updates.selectedBook, '')
        };
      } 
      // If updating the chapter, reset the verses and recalculate verses
      else if (updates.selectedChapter !== undefined) {
        const verseCount = getVerseCountForBookAndChapter(currentRef.selectedBook, updates.selectedChapter);
        const verses = Array.from({ length: verseCount }, (_, i) => (i + 1).toString());
        newRefs[index] = {
          ...currentRef,
          selectedChapter: updates.selectedChapter,
          startVerse: '',
          endVerse: '',
          availableVerses: verses,
          scripture: formatReference(currentRef.selectedBook, updates.selectedChapter)
        };
      }
      // For any other updates (e.g., startVerse, endVerse)
      else {
        newRefs[index] = { ...currentRef, ...updates };
      }
      
      return newRefs;
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Rate limiting
    const userIdentifier = getUserIdentifier();
    try {
      await rateLimiter.consume(userIdentifier);
    } catch (rejRes) {
      setShowError(true);
      setErrorMessage('Too many requests. Please slow down.');
      return;
    }

    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);
    setNoQuestionsFound(false);
    
    // Gather all scripture references and themes
    const refArr = scriptureRefs.map(ref => {
      const { sanitizedValue: sanitizedScripture } = processInput(ref.scripture, 'scripture reference');
      return sanitizedScripture;
    }).filter(Boolean);
    
    const themeArr = selectedThemes.length === themes.length ? [] : selectedThemes; // Empty array means all themes
    
    // Check if at least one scripture reference is selected
    if (!refArr.length) {
      setShowError(true);
      setErrorMessage('Please select at least one scripture reference.');
      setIsSubmitting(false);
      return;
    }
    
    // Process the form data
    const formData = {
      refArr,
      themeArr,
    };
    
    try {
      const studyData = await processForm(formData);
      
      // Pass the selected questions to the StudyModal
      const filteredQuestions = selectedQuestions.map(index => {
        return searchResults[index]; // Get the question based on the selected index from searchResults
      }).filter(Boolean); // Filter out any undefined values

      onStudyGenerated({ ...studyData, filteredQuestions }); // Pass filtered questions
      setShowSuccess(true);
    } catch (error) {
      console.error("Error in study generation:", error);
      setShowError(true);
      
      if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An error occurred while generating your study. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async () => {
    // Rate limiting
    const userIdentifier = getUserIdentifier();
    try {
      await rateLimiter.consume(userIdentifier);
    } catch (rejRes) {
      setShowError(true);
      setErrorMessage('Too many requests. Please slow down.');
      return;
    }

    try {
      // Ensure at least one reference has a book selected
      const hasValidRef = scriptureRefs.some(ref => ref.selectedBook);
      if (!hasValidRef) {
        setShowError(true);
        setErrorMessage('Please select a book in at least one reference');
        return;
      }

      // Process all references
      const searchPromises = scriptureRefs
        .filter(ref => ref.selectedBook) // Only include references with a book selected
        .map(ref => {
          const searchData = {
            book: ref.selectedBook,
            chapter: ref.selectedChapter || null,
            startVerse: ref.startVerse || null,
            endVerse: ref.endVerse || null,
            themeArr: selectedThemes.length === themes.length ? [] : selectedThemes
          };
          return searchQuestions(searchData);
        });

      const results = await Promise.all(searchPromises);
      const combinedResults = results.flat(); // Flatten the array of arrays

      setSearchResults(combinedResults);
      setShowSearchResults(true);

      if (combinedResults.length === 0) {
        setNoQuestionsFound(true);
      }
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message || 'Search failed');
    }
  };

  const handleQuestionSelect = (index, isSelected) => {
    setSelectedQuestions(prev => {
      if (isSelected) {
        return [...prev, index];
      } else {
        return prev.filter(i => i !== index);
      }
    });
  };

  const closeAlert = (alertType) => {
    if (alertType === 'success') setShowSuccess(false);
    if (alertType === 'error') setShowError(false);
    if (alertType === 'noQuestions') setNoQuestionsFound(false);
  };
  
  return (
    <Container maxWidth="lg" sx={{ pt: 1, pb: 2 }}>
      <Typography 
        variant="h5" 
        component="h2" 
        sx={{ 
          mb: 4, 
          fontWeight: 'bold', 
          textAlign: 'center',
          color: 'primary.main'
        }}
      >
        Request Bible Study
      </Typography>
      
      <Paper 
        elevation={theme.palette.mode === 'dark' ? 2 : 0}
        sx={{ 
          p: { xs: 2.5, sm: 3.5 },
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          maxWidth: 'min(100%, 900px)',
          mx: 'auto'
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontWeight: 500, 
                color: 'primary.main',
                pb: 1,
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                mb: 2.5
              }}
            >
              Bible References
            </Typography>
            
            {scriptureRefs.map((ref, index) => (
              <Box key={ref.id} sx={{ mb: 3 }}>
                <ScriptureCombobox
                  id={`bookSelect-${index}`}
                  label="Book"
                  value={ref.selectedBook}
                  onChange={(book) => updateScriptureRef(index, { selectedBook: book })}
                  options={bibleBooks}
                  placeholder="Select a book..."
                  isRequired
                  helperText={ref.selectedBook ? `Total chapters: ${ref.totalChapters}` : ""}
                />
                
                <Box sx={{ mt: 2 }}>
                  <ScriptureCombobox
                    id={`chapterSelect-${index}`}
                    label="Chapter"
                    value={ref.selectedChapter}
                    onChange={(chapter) => updateScriptureRef(index, { selectedChapter: chapter })}
                    options={ref.availableChapters}
                    placeholder={ref.selectedBook ? `Select chapter (1-${ref.totalChapters})` : "Select a book first"}
                    disabled={!ref.selectedBook}
                  />
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <ScriptureCombobox
                    id={`verseStartSelect-${index}`}
                    label="Start Verse"
                    value={ref.startVerse}
                    onChange={(verse) => updateScriptureRef(index, { startVerse: verse })}
                    options={ref.availableVerses}
                    placeholder={ref.selectedChapter ? "Select start verse" : "Select a chapter first"}
                    disabled={!ref.selectedChapter}
                  />
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <ScriptureCombobox
                    id={`verseEndSelect-${index}`}
                    label="End Verse"
                    value={ref.endVerse}
                    onChange={(verse) => updateScriptureRef(index, { endVerse: verse })}
                    options={ref.availableVerses}
                    placeholder={ref.selectedChapter ? "Select end verse (optional)" : "Select a chapter first"}
                    disabled={!ref.selectedChapter}
                  />
                </Box>
              </Box>
            ))}
            
            <Button 
              variant="text" 
              onClick={addScriptureReference}
              sx={{ mt: 1 }}
            >
              + Add Another Reference
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontWeight: 500, 
                color: 'primary.main',
                pb: 1,
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                mb: 2.5
              }}
            >
              Themes
            </Typography>
            
            <TextField
              select
              fullWidth
              SelectProps={{
                multiple: true,
                value: selectedThemes,
                onChange: (e) => setSelectedThemes(e.target.value),
                renderValue: (selected) => selected.join(', ')
              }}
              variant="outlined"
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
                }
              }}
            >
              {themes.map((theme) => (
                <MenuItem key={theme} value={theme}>
                  <Checkbox checked={selectedThemes.indexOf(theme) > -1} />
                  <ListItemText primary={theme} />
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Button 
            variant="contained"
            color="primary" 
            onClick={handleSearch}
            disabled={isLoading || isSubmitting}
            size="large"
            sx={{ 
              px: 6, 
              py: 1.5, 
              minWidth: 200,
              borderRadius: 2,
              fontSize: '1rem',
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
            Search Questions
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleSubmit}
            disabled={isLoading || isSubmitting}
            size="large"
            sx={{ 
              px: 6, 
              py: 1.5, 
              minWidth: 200,
              borderRadius: 2,
              fontSize: '1rem',
              fontWeight: 500,
              textTransform: 'none',
              borderWidth: 1.5,
              '&:hover': {
                borderWidth: 1.5
              }
            }}
          >
            Generate Study
          </Button>
        </Stack>

        {showSearchResults && (
          <QuestionTable 
            questions={searchResults}
            selectedQuestions={selectedQuestions}
            onQuestionSelect={handleQuestionSelect}
          />
        )}
      </Paper>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => closeAlert('success')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => closeAlert('success')} 
          severity="success" 
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          Success! Your Bible study has been generated.
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => closeAlert('error')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => closeAlert('error')} 
          severity="error" 
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={noQuestionsFound}
        autoHideDuration={6000}
        onClose={() => closeAlert('noQuestions')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => closeAlert('noQuestions')} 
          severity="warning" 
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          No questions found that match your criteria. Try different themes or contribute more questions to expand the pool.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RequestForm;
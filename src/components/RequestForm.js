import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  Snackbar,
  useTheme,
  Button,
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
    },
    {
      id: 2,
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
  const [showSearchSuccess, setShowSearchSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noQuestionsFound, setNoQuestionsFound] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Bible books from the JSON data
  const bibleBooks = getBibleBooks();

  // Helper to check if all themes are selected
  const allThemesSelected = selectedThemes.length === themes.length;

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
      
      // Handle verse validation before any other updates
      if (updates.startVerse !== undefined && currentRef.endVerse) {
        if (parseInt(currentRef.endVerse) < parseInt(updates.startVerse)) {
          updates.endVerse = updates.startVerse;
        }
      }

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
      
      // Ensure scripture reference is updated when verses change
      if (updates.startVerse !== undefined || updates.endVerse !== undefined) {
        newRefs[index].scripture = formatReference(
          newRefs[index].selectedBook,
          newRefs[index].selectedChapter,
          updates.startVerse ?? currentRef.startVerse,
          updates.endVerse ?? currentRef.endVerse
        );
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
      } else {
        setShowSearchSuccess(true);
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
    if (alertType === 'searchSuccess') setShowSearchSuccess(false);
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
          color: 'primary.main',
          maxWidth: 240,
          mx: 'auto'
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
          maxWidth: 600,
          mx: 'auto'
        }}
      >
        {/* Bible References Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
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
          
          <Grid container spacing={2} justifyContent="center">
            {scriptureRefs.map((ref, index) => (
              <Grid item xs={12} md={5} key={ref.id}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1,
                  p: { xs: 2, sm: 0 },
                  mb: { xs: 3, md: 0 },
                  borderBottom: { xs: `1px solid ${theme.palette.divider}`, md: 'none' },
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: 'text.secondary',
                      mb: 1,
                      display: { xs: 'block', md: 'none' }
                    }}
                  >
                    Reference {index + 1}
                  </Typography>
                  
                  <ScriptureCombobox
                    id={`bookSelect-${index}`}
                    label="Book"
                    value={ref.selectedBook}
                    onChange={(book) => updateScriptureRef(index, { selectedBook: book })}
                    options={bibleBooks}
                    placeholder="Select a book..."
                    isRequired
                    helperText={ref.selectedBook ? `Total chapters: ${ref.totalChapters}` : " "}
                    sx={{ 
                      minWidth: 240, 
                      width: '100%',
                      mb: 0,
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.875rem', md: '1rem' }
                      },
                      '& .MuiOutlinedInput-root': {
                        padding: '6px 12px',
                        marginBottom: '0px'
                      },
                      '& .MuiFormHelperText-root': {
                        visibility: ref.selectedBook ? 'visible' : 'hidden',
                        height: '16px',  // Minimal height
                        mt: 0,          // No top margin
                        mb: 0,          // No bottom margin
                        lineHeight: 1,
                        fontSize: '0.7rem'  // Smaller font
                      }
                    }}
                  />
                  
                  <ScriptureCombobox
                    id={`chapterSelect-${index}`}
                    label="Chapter"
                    value={ref.selectedChapter}
                    onChange={(chapter) => updateScriptureRef(index, { selectedChapter: chapter })}
                    options={ref.availableChapters}
                    placeholder={ref.selectedBook ? `Select chapter (1-${ref.totalChapters})` : "Select a book first"}
                    disabled={!ref.selectedBook}
                    sx={{ 
                      minWidth: 240, 
                      width: '100%',
                      mt: 0,
                      '& .MuiOutlinedInput-root': {
                        padding: '6px 12px'
                      }
                    }}
                  />
                  
                  <ScriptureCombobox
                    id={`verseStartSelect-${index}`}
                    label="Start Verse"
                    value={ref.startVerse}
                    onChange={(verse) => updateScriptureRef(index, { startVerse: verse })}
                    options={ref.availableVerses}
                    placeholder={ref.selectedChapter ? "Select start verse" : "Select a chapter first"}
                    disabled={!ref.selectedChapter}
                    sx={{ 
                      minWidth: 240, 
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        padding: '6px 12px'
                      }
                    }}
                  />
                  
                  <ScriptureCombobox
                    id={`verseEndSelect-${index}`}
                    label="End Verse"
                    value={ref.endVerse}
                    onChange={(verse) => updateScriptureRef(index, { endVerse: verse })}
                    options={ref.availableVerses}
                    isEndVerse
                    startVerseValue={ref.startVerse}
                    disabled={!ref.selectedChapter}
                    sx={{ 
                      minWidth: 240,
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        padding: '6px 12px'
                      }
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={addScriptureReference}
              sx={{ width: 240 }}
            >
              + Add Another Reference
            </Button>
          </Box>
        </Box>

        {/* Themes and Actions Section - Modified for mobile */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, // Column on mobile, row on desktop
          gap: 4, 
          mb: 4,
          alignItems: { sm: 'flex-end' } // Align only on desktop
        }}>
          {/* Themes Dropdown - Full width on mobile */}
          <Box sx={{ 
            flex: 1,
            width: { xs: '100%', sm: 'auto' } // Full width on mobile
          }}>
            <Typography 
              variant="h6" 
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
                renderValue: (selected) => allThemesSelected ? "All" : selected.join(', ')
              }}
              variant="outlined"
              size="medium"
              sx={{
                minWidth: 240,
                width: 240,
                '& .MuiOutlinedInput-root': {
                  padding: '6px 12px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              }}
            >
              {themes.map((theme) => (
                <MenuItem key={theme} value={theme}>
                  <Checkbox checked={selectedThemes.includes(theme)} />
                  <ListItemText primary={theme} />
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Action Buttons - Stacked below on mobile */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: { xs: '100%', sm: 240 }, // Full width on mobile
            order: { xs: 1, sm: 0 } // Move below on mobile
          }}>
            <Button 
              variant="contained"
              color="primary" 
              onClick={handleSearch}
              disabled={isLoading || isSubmitting}
              fullWidth
            >
              Search Questions
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleSubmit}
              disabled={isLoading || isSubmitting}
              fullWidth
            >
              Generate Study
            </Button>
          </Box>
        </Box>

        {/* Question Table */}
        {showSearchResults && (
          <Box sx={{ mt: 4 }}>
            <QuestionTable 
              questions={searchResults}
              selectedQuestions={selectedQuestions}
              onQuestionSelect={handleQuestionSelect}
            />
          </Box>
        )}
      </Paper>
      
      <Snackbar
        open={showSearchSuccess}
        autoHideDuration={6000}
        onClose={() => closeAlert('searchSuccess')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => closeAlert('searchSuccess')} 
          severity="success" 
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          Questions found! Select the ones you'd like to include in your study.
        </Alert>
      </Snackbar>
      
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
          No questions found that match your criteria. Try different themes or contribute more questions.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RequestForm;
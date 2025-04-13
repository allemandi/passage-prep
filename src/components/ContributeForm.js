import React, { useState, useCallback } from 'react';
import { 
  TextField, 
  Button, 
  MenuItem, 
  Box, 
  Typography, 
  Grid, 
  CircularProgress, 
  Alert, 
  Paper,
  Snackbar,
  useTheme,
  Container
} from '@mui/material';
import ScriptureCombobox from './ScriptureCombobox';
import { getBibleBooks, getChaptersForBook, getChapterCountForBook, formatReference, getVerseCountForBookAndChapter } from '../utils/bibleData';
import {
	RegExpMatcher,
	englishDataset,
	englishRecommendedTransformers,
} from 'obscenity';
import { rateLimiter, getUserIdentifier } from '../utils/rateLimit';
import { processInput } from '../utils/inputUtils';
import { saveQuestion } from '../data/dataService';
import themes from '../data/themes.json';

const ContributeForm = () => {
  const theme = useTheme();
  const [questionText, setQuestionText] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [scripture, setScripture] = useState('');
  
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [startVerse, setStartVerse] = useState('');
  const [endVerse, setEndVerse] = useState('');
  const [availableChapters, setAvailableChapters] = useState([]);
  const [availableVerses, setAvailableVerses] = useState([]);
  const [totalChapters, setTotalChapters] = useState(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
  });
  
  // Bible books from the JSON data
  const bibleBooks = getBibleBooks();
  
  const updateReference = useCallback((book, chapter, start, end) => {
    const reference = formatReference(book, chapter, start, end);
    setScripture(reference);
  }, []);
  
  // Update chapters when book changes
  React.useEffect(() => {
    if (selectedBook) {
      const chapters = getChaptersForBook(selectedBook);
      setAvailableChapters(chapters);
      
      const chapterCount = getChapterCountForBook(selectedBook);
      setTotalChapters(chapterCount);
      
      setSelectedChapter('');
      setStartVerse('');
      setEndVerse('');
      setAvailableVerses([]);
      updateReference(selectedBook, '', '', '');
    } else {
      setAvailableChapters([]);
      setSelectedChapter('');
      setStartVerse('');
      setEndVerse('');
      setAvailableVerses([]);
      setScripture('');
      setTotalChapters(0);
    }
  }, [selectedBook, updateReference]);
  
  // Update verses and reference when chapter changes
  React.useEffect(() => {
    if (selectedChapter) {
      const verseCount = getVerseCountForBookAndChapter(selectedBook, selectedChapter);
      const verses = Array.from({ length: verseCount }, (_, i) => (i + 1).toString());
      setAvailableVerses(verses);
      updateReference(selectedBook, selectedChapter, startVerse, endVerse);
    } else {
      setAvailableVerses([]);
      setStartVerse('');
      setEndVerse('');
      updateReference(selectedBook, '', '', '');
    }
  }, [selectedChapter, selectedBook, startVerse, endVerse, updateReference]);
  
  // Update reference when verses change
  React.useEffect(() => {
    if (selectedChapter) {
      updateReference(selectedBook, selectedChapter, startVerse, endVerse);
    }
  }, [startVerse, endVerse, selectedBook, selectedChapter, updateReference]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Generate a unique identifier for the current session/tab
    const userIdentifier = getUserIdentifier();
    try {
      await rateLimiter.consume(userIdentifier);
    } catch (rejRes) {
      setShowError(true);
      setErrorMessage('Too many requests. Please slow down.');
      return;
    }

    // Sanitize and validate all inputs
    const { sanitizedValue: sanitizedQuestionText, error: questionError } = processInput(questionText, 'question');
    if (questionError) {
      setShowError(true);
      setErrorMessage(questionError);
      return;
    }
    
    const { sanitizedValue: sanitizedTheme, error: themeError } = processInput(selectedTheme, 'theme');
    if (themeError) {
      setShowError(true);
      setErrorMessage(themeError);
      return;
    }
    
    const { sanitizedValue: sanitizedScripture, error: scriptureError } = processInput(scripture, 'scripture reference');
    if (scriptureError) {
      setShowError(true);
      setErrorMessage(scriptureError);
      return;
    }

    // Check for profanity
    if (matcher.hasMatch(sanitizedQuestionText)) {
      setShowError(true);
      setErrorMessage('Possible profanity detected. Please revise your question.');
      return;
    }

    setIsSubmitting(true);
    setShowError(false);
    
    try {
      await saveQuestion(sanitizedTheme, sanitizedQuestionText, sanitizedScripture);
      setShowSuccess(true);
      
      // Reset the form
      setQuestionText('');
      setSelectedTheme('');
      setSelectedBook('');
      setSelectedChapter('');
      setStartVerse('');
      setEndVerse('');
      setScripture('');
    } catch (error) {
      console.error('Error submitting question:', error);
      setShowError(true);
      setErrorMessage('Failed to submit your question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const closeAlert = (alertType) => {
    if (alertType === 'success') setShowSuccess(false);
    if (alertType === 'error') setShowError(false);
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
        Add New Question
      </Typography>
      
      <Paper 
        component="form"
        onSubmit={handleSubmit}
        noValidate
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
            <Box sx={{ mb: 4 }}>
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
                Bible Reference
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <ScriptureCombobox
                  id="bookSelect"
                  label="Book"
                  value={selectedBook}
                  onChange={setSelectedBook}
                  options={bibleBooks}
                  placeholder="Select a book..."
                  isRequired
                  helperText={selectedBook ? `Total chapters: ${totalChapters}` : ""}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <ScriptureCombobox
                  id="chapterSelect"
                  label="Chapter"
                  value={selectedChapter}
                  onChange={setSelectedChapter}
                  options={availableChapters}
                  placeholder={selectedBook ? `Select chapter (1-${totalChapters})` : "Select a book first"}
                  disabled={!selectedBook}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <ScriptureCombobox
                  id="verseStartSelect"
                  label="Start Verse"
                  value={startVerse}
                  onChange={setStartVerse}
                  options={availableVerses}
                  placeholder={selectedChapter ? "Select start verse" : "Select a chapter first"}
                  disabled={!selectedChapter}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <ScriptureCombobox
                  id="verseEndSelect"
                  label="End Verse"
                  value={endVerse}
                  onChange={setEndVerse}
                  options={availableVerses}
                  placeholder={selectedChapter ? "Select end verse (optional)" : "Select a chapter first"}
                  disabled={!selectedChapter}
                />
              </Box>
              
              <input 
                id="scripture" 
                type="hidden" 
                value={scripture}
                required
              />
            </Box>
            
            <Box>
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
                Theme
              </Typography>
              
              <TextField
                select
                fullWidth
                id="themeSelect"
                label="Theme"
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                required
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
                <MenuItem value="">
                  <em>Select a theme</em>
                </MenuItem>
                {themes.map((theme, index) => (
                  <MenuItem key={index} value={theme}>{theme}</MenuItem>
                ))}
              </TextField>
            </Box>
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
              Question Details
            </Typography>
            
            <TextField
              fullWidth
              id="questionText"
              label="Question"
              multiline
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
              placeholder="Type your Bible study question here..."
              variant="outlined"
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
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            type="submit" 
            disabled={isSubmitting}
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
            {isSubmitting ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1.5 }} />
                Submitting...
              </>
            ) : 'Submit Question'}
          </Button>
        </Box>
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
          Your question has been submitted successfully! Thank you for contributing.
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
    </Container>
  );
};

export default ContributeForm;
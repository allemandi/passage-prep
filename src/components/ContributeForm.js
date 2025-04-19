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
import { getBibleBooks, getChaptersForBook, getChapterCountForBook, getVerseCountForBookAndChapter } from '../utils/bibleData';
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
  const [reference, setReference] = useState({
    book: '',
    chapter: '',
    verseStart: '',
    verseEnd: '',
  });
  
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
  
  const updateReference = useCallback((book, chapter, verseStart, verseEnd) => {
    setReference({
      book: book || '',
      chapter: chapter || '',
      verseStart: verseStart || '',
      verseEnd: verseEnd || verseStart || '',
    });
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
      setReference({
        book: '',
        chapter: '',
        verseStart: '',
        verseEnd: '',
      });
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
  }, [selectedChapter, selectedBook, updateReference, startVerse, endVerse]);
  
  // Add this right after the state declarations
  React.useEffect(() => {
    if (startVerse && endVerse && parseInt(endVerse) < parseInt(startVerse)) {
      setEndVerse(startVerse);
      updateReference(selectedBook, selectedChapter, startVerse, startVerse);
    }
  }, [startVerse, endVerse, selectedBook, selectedChapter, updateReference]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Rate limiting
    const userIdentifier = getUserIdentifier();
    try {
      await rateLimiter.consume(userIdentifier);
    } catch (rejRes) {
      setShowError(true);
      setErrorMessage('Too many requests. Please slow down.');
      return;
    }

    // Validate required fields
    if (!reference.book || !reference.chapter || !reference.verseStart) {
      setShowError(true);
      setErrorMessage('Please complete all required fields.');
      return;
    }

    // Sanitize and validate inputs in parallel (non-blocking)
    const [
      { error: bookError },
      { error: chapterError },
      { error: verseStartError },
      { error: verseEndError },
      { sanitizedValue: sanitizedQuestionText, error: questionError },
      { sanitizedValue: sanitizedTheme, error: themeError }
    ] = await Promise.all([
      processInput(reference.book, 'book'),
      processInput(reference.chapter, 'chapter'),
      processInput(reference.verseStart, 'start verse'),
      processInput(reference.verseEnd || reference.verseStart, 'end verse'), // Fallback to start verse if empty
      processInput(questionText, 'question'),
      processInput(selectedTheme, 'theme')
    ]);

    // Check for errors (priority: scripture > question > theme)
    const error = bookError || chapterError || verseStartError || verseEndError || questionError || themeError;
    if (error) {
      setShowError(true);
      setErrorMessage(error);
      return;
    }

    // Profanity check (non-blocking)
    if (matcher.hasMatch(sanitizedQuestionText)) {
      setShowError(true);
      setErrorMessage('Possible profanity detected. Please revise your question.');
      return;
    }

    setIsSubmitting(true);
    setShowError(false);
    
    try {
      const saved = await saveQuestion(
        sanitizedTheme,
        sanitizedQuestionText,
        {
          book: reference.book,
          chapter: reference.chapter,
          verseStart: reference.verseStart,
          verseEnd: reference.verseEnd || reference.verseStart,
        }
      );
      if (saved) {
        setShowSuccess(true);
        resetForm();
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      setShowError(true);
      setErrorMessage('Failed to submit your question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper to reset form (extracted for clarity)
  const resetForm = () => {
    setQuestionText('');
    setSelectedTheme('');
    setSelectedBook('');
    setSelectedChapter('');
    setStartVerse('');
    setEndVerse('');
    setReference({
      book: '',
      chapter: '',
      verseStart: '',
      verseEnd: '',
    });
  };
  
  const closeAlert = (alertType) => {
    if (alertType === 'success') setShowSuccess(false);
    if (alertType === 'error') setShowError(false);
  };
  
  const handleEndVerseChange = (verse) => {
    setEndVerse(verse);
    updateReference(selectedBook, selectedChapter, startVerse, verse);
  };
  
  return (
    <Container maxWidth="xl" sx={{ pt: 3, pb: 4 }}>
     
      
      <Paper 
        component="form"
        onSubmit={handleSubmit}
        elevation={1}
        sx={{ 
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          maxWidth: 1200,
          mx: 'auto'
        }}
      >
        <Grid container spacing={4} justifyContent="center" sx={{ width: '100%', maxWidth: '900px', mx: 'auto' }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'center',
              p: { xs: 2, sm: 0 },
              mb: { xs: 3, md: 0 }
            }}>
              <Typography 
                variant="subtitle1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 500, 
                  color: 'primary.main',
                  pb: 1,
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  mb: 2.5,
                  width: '100%',
                  textAlign: 'center'
                }}
              >
                Bible Reference
              </Typography>
              <Box sx={{ width: { xs: '100%', sm: 260 }, mb: 1 }}>
                <ScriptureCombobox
                  id="bookSelect"
                  label="Book"
                  value={selectedBook}
                  onChange={(book) => {
                    setSelectedBook(book);
                    updateReference(book, '', '', '');
                  }}
                  options={bibleBooks}
                  placeholder="Select a book..."
                  isRequired
                  sx={{ minWidth: 0, width: '100%' }}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 260 }, mb: 1 }}>
                <ScriptureCombobox
                  id="chapterSelect"
                  label="Chapter"
                  value={selectedChapter}
                  onChange={(chapter) => {
                    setSelectedChapter(chapter);
                    updateReference(selectedBook, chapter, '', '');
                  }}
                  options={availableChapters}
                  placeholder={selectedBook ? `Select chapter (1-${totalChapters})` : "Select a book first"}
                  disabled={!selectedBook}
                  isRequired
                  sx={{ minWidth: 0, width: '100%' }}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 260 }, mb: 1 }}>
                <ScriptureCombobox
                  id="verseStartSelect"
                  label="Start Verse"
                  value={startVerse}
                  onChange={(verse) => {
                    setStartVerse(verse);
                    updateReference(selectedBook, selectedChapter, verse, endVerse);
                  }}
                  options={availableVerses}
                  placeholder={selectedChapter ? "Select start verse" : "Select a chapter first"}
                  disabled={!selectedChapter}
                  isRequired
                  sx={{ minWidth: 0, width: '100%' }}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                <ScriptureCombobox
                  id="verseEndSelect"
                  label="End Verse"
                  value={endVerse}
                  onChange={handleEndVerseChange}
                  options={availableVerses}
                  isEndVerse
                  startVerseValue={startVerse}
                  disabled={!selectedChapter}
                  sx={{ minWidth: 0, width: '100%' }}
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 2
            }}>
              <Box sx={{ 
                flex: '0 0 auto',
                mb: 2,
                width: { xs: '100%', sm: 260 }
              }}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 500, 
                    color: 'primary.main',
                    pb: 1,
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                    mb: 2.5,
                    textAlign: 'center'
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
                  sx={{ minWidth: 0, width: '100%' }}
                >
                  <MenuItem value="">
                    <em>Select a theme</em>
                  </MenuItem>
                  {themes.map((theme, index) => (
                    <MenuItem key={index} value={theme}>{theme}</MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ 
                flex: 1,
                width: { xs: '100%', sm: 260 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end'
              }}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 500, 
                    color: 'primary.main',
                    pb: 1,
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                    mb: 2.5,
                    textAlign: 'center'
                  }}
                >
                  Question Details
                </Typography>
                <TextField
                  fullWidth
                  id="questionText"
                  label="Question"
                  multiline
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  required
                  placeholder="Type your Bible study question here..."
                  variant="outlined"
                  sx={{ minWidth: 0, width: '100%' }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            type="submit" 
            disabled={isSubmitting}
            size="large"
            sx={{ px: 6, py: 1.5, minWidth: { xs: '100%', sm: 260 }, borderRadius: 2, fontSize: '1rem', fontWeight: 500, textTransform: 'none', boxShadow: theme.palette.mode === 'dark' ? '0 2px 8px rgba(144, 202, 249, 0.2)' : '0 2px 8px rgba(25, 118, 210, 0.2)', '&:hover': { boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(144, 202, 249, 0.3)' : '0 4px 12px rgba(25, 118, 210, 0.3)' } }}
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
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
import { themes, saveQuestion } from '../data/dataService';
import { getBibleBooks, getChaptersForBook, getChapterCountForBook, formatReference } from '../utils/bibleData';

const ContributeForm = () => {
  const theme = useTheme();
  const [questionText, setQuestionText] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [scripture, setScripture] = useState('');
  
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [availableChapters, setAvailableChapters] = useState([]);
  const [totalChapters, setTotalChapters] = useState(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Bible books from the JSON data
  const bibleBooks = getBibleBooks();
  
  const updateReference = useCallback((book, chapter) => {
    const reference = formatReference(book, chapter);
    setScripture(reference);
  }, []);
  
  // Update chapters when book changes
  React.useEffect(() => {
    if (selectedBook) {
      const chapters = getChaptersForBook(selectedBook);
      setAvailableChapters(chapters);
      
      // Get and set the total chapter count
      const chapterCount = getChapterCountForBook(selectedBook);
      setTotalChapters(chapterCount);
      
      // Reset chapter if the book changes
      setSelectedChapter('');
      
      // Update the reference
      updateReference(selectedBook, '');
    } else {
      setAvailableChapters([]);
      setSelectedChapter('');
      setScripture('');
      setTotalChapters(0);
    }
  }, [selectedBook, updateReference]);
  
  // Update reference when chapter changes
  React.useEffect(() => {
    updateReference(selectedBook, selectedChapter);
  }, [selectedChapter, selectedBook, updateReference]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!questionText.trim()) {
      setShowError(true);
      setErrorMessage('Please enter a question.');
      return;
    }
    
    if (!selectedTheme) {
      setShowError(true);
      setErrorMessage('Please select a theme.');
      return;
    }
    
    if (!scripture) {
      setShowError(true);
      setErrorMessage('Please select a scripture reference.');
      return;
    }
    
    setIsSubmitting(true);
    setShowError(false);
    
    try {
      await saveQuestion(selectedTheme, questionText, scripture);
      setShowSuccess(true);
      
      // Reset the form
      setQuestionText('');
      setSelectedTheme('');
      setSelectedBook('');
      setSelectedChapter('');
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
              
              <Box>
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
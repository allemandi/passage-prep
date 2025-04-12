import React, { useState } from 'react';
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
  useTheme
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
  }, [selectedBook]);
  
  // Update reference when chapter changes
  React.useEffect(() => {
    updateReference(selectedBook, selectedChapter);
  }, [selectedChapter]);
  
  const updateReference = (book, chapter) => {
    const reference = formatReference(book, chapter);
    setScripture(reference);
  };
  
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
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ pt: 1, pb: 2 }}>
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
        New Questions
      </Typography>
      
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
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontWeight: 'medium', 
            color: 'primary.main',
            pb: 1,
            mb: 3,
            borderBottom: `2px solid ${theme.palette.primary.main}`
          }}
        >
          Add Questions
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'medium', 
                color: 'primary.main',
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
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'medium', 
                color: 'primary.main',
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
              size="small"
            >
              <MenuItem value="">
                <em>Select a theme</em>
              </MenuItem>
              {themes.map((theme, index) => (
                <MenuItem key={index} value={theme}>{theme}</MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'medium', 
                color: 'primary.main',
              }}
            >
              Bible Reference
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
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
              </Grid>
              <Grid item xs={12}>
                <ScriptureCombobox
                  id="chapterSelect"
                  label="Chapter"
                  value={selectedChapter}
                  onChange={setSelectedChapter}
                  options={availableChapters}
                  placeholder={selectedBook ? `Select chapter (1-${totalChapters})` : "Select a book first"}
                  disabled={!selectedBook}
                />
              </Grid>
            </Grid>
            
            <input 
              id="scripture" 
              type="hidden" 
              value={scripture}
              required
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
    </Box>
  );
};

export default ContributeForm; 
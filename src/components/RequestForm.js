import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  Snackbar,
  useTheme
} from '@mui/material';
import { themes, subcategories, processForm } from '../data/dataService';
import { getBibleBooks, getChaptersForBook, getChapterCountForBook, formatReference } from '../utils/bibleData';
import StudyFormContainer from './StudyFormContainer';

const RequestForm = ({ onStudyGenerated, isLoading }) => {
  const theme = useTheme();
  const [scripture1, setScripture1] = useState('');
  const [scripture2, setScripture2] = useState('');
  
  const [theme1, setTheme1] = useState('');
  const [theme2, setTheme2] = useState('');
  
  const [subChoice, setSubChoice] = useState(subcategories[0]);
  const [maxLimit, setMaxLimit] = useState('5');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noQuestionsFound, setNoQuestionsFound] = useState(false);
  
  // New state for Scripture 1 Comboboxes
  const [selectedBook1, setSelectedBook1] = useState('');
  const [selectedChapter1, setSelectedChapter1] = useState('');
  const [availableChapters1, setAvailableChapters1] = useState([]);
  const [totalChapters1, setTotalChapters1] = useState(0);
  
  // New state for Scripture 2 Comboboxes
  const [selectedBook2, setSelectedBook2] = useState('');
  const [selectedChapter2, setSelectedChapter2] = useState('');
  const [availableChapters2, setAvailableChapters2] = useState([]);
  const [totalChapters2, setTotalChapters2] = useState(0);
  
  // Bible books from the JSON data
  const bibleBooks = getBibleBooks();
  
  // Update chapters when book 1 changes
  useEffect(() => {
    if (selectedBook1) {
      const chapters = getChaptersForBook(selectedBook1);
      setAvailableChapters1(chapters);
      
      // Get and set the total chapter count
      const chapterCount = getChapterCountForBook(selectedBook1);
      setTotalChapters1(chapterCount);
      
      // Reset chapter if the book changes
      setSelectedChapter1('');
      
      // Update the reference
      updateReference1(selectedBook1, '');
    } else {
      setAvailableChapters1([]);
      setSelectedChapter1('');
      setScripture1('');
      setTotalChapters1(0);
    }
  }, [selectedBook1]);
  
  // Update reference when chapter 1 changes
  useEffect(() => {
    updateReference1(selectedBook1, selectedChapter1);
  }, [selectedChapter1]);
  
  // Update chapters when book 2 changes
  useEffect(() => {
    if (selectedBook2) {
      const chapters = getChaptersForBook(selectedBook2);
      setAvailableChapters2(chapters);
      
      // Get and set the total chapter count
      const chapterCount = getChapterCountForBook(selectedBook2);
      setTotalChapters2(chapterCount);
      
      // Reset chapter if the book changes
      setSelectedChapter2('');
      
      // Update the reference
      updateReference2(selectedBook2, '');
    } else {
      setAvailableChapters2([]);
      setSelectedChapter2('');
      setScripture2('');
      setTotalChapters2(0);
    }
  }, [selectedBook2]);
  
  // Update reference when chapter 2 changes
  useEffect(() => {
    updateReference2(selectedBook2, selectedChapter2);
  }, [selectedChapter2]);
  
  const updateReference1 = (book, chapter) => {
    const reference = formatReference(book, chapter);
    setScripture1(reference);
  };
  
  const updateReference2 = (book, chapter) => {
    const reference = formatReference(book, chapter);
    setScripture2(reference);
  };
  
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);
    setNoQuestionsFound(false);
    
    // Gather all scripture references and themes
    const refArr = [scripture1, scripture2];
    const themeArr = [theme1, theme2];
    
    // Check if at least one theme is selected
    if (!themeArr.some(theme => theme)) {
      setShowError(true);
      setErrorMessage('Please select at least one theme.');
      setIsSubmitting(false);
      return;
    }
    
    // Process the form data
    const formData = {
      refArr,
      themeArr,
      subChoice,
      maxLimit: parseInt(maxLimit, 10)
    };
    
    try {
      const studyData = await processForm(formData);
      
      let totalQuestions = 0;
      studyData.questionArr.forEach(themeQuestions => {
        totalQuestions += themeQuestions.length;
      });
      
      if (totalQuestions === 0) {
        setNoQuestionsFound(true);
      } else {
        onStudyGenerated(studyData);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error("Error in study generation:", error);
      setShowError(true);
      
      // Use the specific error message if available
      if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An error occurred while generating your study. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const closeAlert = (alertType) => {
    if (alertType === 'success') setShowSuccess(false);
    if (alertType === 'error') setShowError(false);
    if (alertType === 'noQuestions') setNoQuestionsFound(false);
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
        Request Bible Study
      </Typography>
      
      <StudyFormContainer
        // Bible References props
        bibleBooks={bibleBooks}
        selectedBook1={selectedBook1}
        setSelectedBook1={setSelectedBook1}
        selectedChapter1={selectedChapter1}
        setSelectedChapter1={setSelectedChapter1}
        availableChapters1={availableChapters1}
        totalChapters1={totalChapters1}
        selectedBook2={selectedBook2}
        setSelectedBook2={setSelectedBook2}
        selectedChapter2={selectedChapter2}
        setSelectedChapter2={setSelectedChapter2}
        availableChapters2={availableChapters2}
        totalChapters2={totalChapters2}
        scripture1={scripture1}
        scripture2={scripture2}
        
        // Themes props
        theme1={theme1}
        setTheme1={setTheme1}
        theme2={theme2}
        setTheme2={setTheme2}
        themes={themes}
        
        // General Settings props
        subChoice={subChoice}
        setSubChoice={setSubChoice}
        maxLimit={maxLimit}
        setMaxLimit={setMaxLimit}
        subcategories={subcategories}
        
        // Form submission props
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        handleSubmit={handleSubmit}
      />
      
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
          Success! Your Bible study has been generated. You can keep clicking the Submit button if you want more based on the above.
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
          No Questions Found. There are not enough questions for that theme against your subcategory settings. Try a different combination or contribute questions to expand the pool.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RequestForm; 
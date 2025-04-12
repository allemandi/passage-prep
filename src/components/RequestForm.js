import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  Snackbar,
  useTheme
} from '@mui/material';
import { themes, processForm } from '../data/dataService';
import { getBibleBooks, getChaptersForBook, getChapterCountForBook, formatReference } from '../utils/bibleData';
import StudyFormContainer from './StudyFormContainer';

const RequestForm = ({ onStudyGenerated, isLoading }) => {
  const theme = useTheme();
  const [scriptureRefs, setScriptureRefs] = useState([
    {
      id: 1,
      scripture: '',
      selectedBook: '',
      selectedChapter: '',
      availableChapters: [],
      totalChapters: 0
    }
  ]);
  
  const [selectedThemes, setSelectedThemes] = useState(themes); // Default to all themes selected
  const [maxLimit, setMaxLimit] = useState('5');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noQuestionsFound, setNoQuestionsFound] = useState(false);

  // Bible books from the JSON data
  const bibleBooks = getBibleBooks();

  const addScriptureReference = () => {
    setScriptureRefs(prev => [...prev, {
      id: prev.length + 1,
      scripture: '',
      selectedBook: '',
      selectedChapter: '',
      availableChapters: [],
      totalChapters: 0
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
          availableChapters: chapters,
          totalChapters: chapterCount,
          scripture: formatReference(updates.selectedBook, '')
        };
      } 
      // If updating just the chapter
      else if (updates.selectedChapter !== undefined) {
        newRefs[index] = {
          ...currentRef,
          selectedChapter: updates.selectedChapter,
          scripture: formatReference(currentRef.selectedBook, updates.selectedChapter)
        };
      }
      // For any other updates
      else {
        newRefs[index] = { ...currentRef, ...updates };
      }
      
      return newRefs;
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);
    setNoQuestionsFound(false);
    
    // Gather all scripture references and themes
    const refArr = scriptureRefs.map(ref => ref.scripture).filter(Boolean);
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
        scriptureRefs={scriptureRefs}
        onUpdateScriptureRef={updateScriptureRef}
        onAddScriptureRef={addScriptureReference}
        
        // Themes props
        selectedThemes={selectedThemes}
        setSelectedThemes={setSelectedThemes}
        themes={themes}
        
        // General Settings props
        maxLimit={maxLimit}
        setMaxLimit={setMaxLimit}
        
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
    </Box>
  );
};

export default RequestForm;
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  Snackbar,
  useTheme,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { themes, subcategories, processForm } from '../data/dataService';
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
  
  const [theme1, setTheme1] = useState('');
  const [theme2, setTheme2] = useState('');
  
  const [subChoice, setSubChoice] = useState(subcategories[0]);
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
      newRefs[index] = { ...newRefs[index], ...updates };
      return newRefs;
    });
  };

  // Update chapters when book changes
  useEffect(() => {
    scriptureRefs.forEach((ref, index) => {
      if (ref.selectedBook) {
        const chapters = getChaptersForBook(ref.selectedBook);
        const chapterCount = getChapterCountForBook(ref.selectedBook);
        
        updateScriptureRef(index, {
          availableChapters: chapters,
          totalChapters: chapterCount,
          selectedChapter: '',
          scripture: formatReference(ref.selectedBook, '')
        });
      }
    });
  }, [scriptureRefs.map(ref => ref.selectedBook).join(',')]);

  // Update reference when chapter changes
  useEffect(() => {
    scriptureRefs.forEach((ref, index) => {
      if (ref.selectedBook && ref.selectedChapter) {
        updateScriptureRef(index, {
          scripture: formatReference(ref.selectedBook, ref.selectedChapter)
        });
      }
    });
  }, [scriptureRefs.map(ref => ref.selectedChapter).join(',')]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);
    setNoQuestionsFound(false);
    
    // Gather all scripture references and themes
    const refArr = scriptureRefs.map(ref => ref.scripture).filter(Boolean);
    const themeArr = [theme1, theme2].filter(Boolean);
    
    // Check if at least one theme is selected
    if (!themeArr.length) {
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
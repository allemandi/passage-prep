import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  Snackbar,
  // useTheme,
  Button,
  Stack
} from '@mui/material';
import { processForm, searchQuestions } from '../data/dataService';
import { getBibleBooks, getChaptersForBook, getChapterCountForBook, formatReference, getVerseCountForBookAndChapter } from '../utils/bibleData';
import StudyFormContainer from './StudyFormContainer';
import QuestionTable from './QuestionTable';
import { rateLimiter, getUserIdentifier } from '../utils/rateLimit';
import { processInput } from '../utils/inputUtils';
import themes from '../data/themes.json';

const RequestForm = ({ onStudyGenerated, isLoading }) => {
  // const theme = useTheme();
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
    <Box component="form" noValidate sx={{ pt: 1, pb: 2 }}>
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
        
        // Form submission props
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        handleSubmit={handleSubmit}
      />

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
      <Button 
          variant="contained"
          color="primary" 
          onClick={handleSearch}
          disabled={isLoading || isSubmitting}
          size="large"
          sx={{ 
            px: { xs: 4, sm: 5, md: 6 }, 
            py: 1.5, 
            minWidth: { xs: 200, sm: 240 }
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
            px: { xs: 4, sm: 5, md: 6 }, 
            py: 1.5, 
            minWidth: { xs: 200, sm: 240 }
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
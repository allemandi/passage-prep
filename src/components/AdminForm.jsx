import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography,
  Paper, 
  Alert, 
  Snackbar,
  Container,
  Grid,
  Checkbox,
  ListItemText,
  MenuItem,
  CircularProgress
} from '@mui/material';
import QuestionTable from './QuestionTable';
import { searchQuestions, fetchAllQuestions, fetchUnapprovedQuestions, approveQuestions } from '../services/dataService';
import ScriptureCombobox from './ScriptureCombobox';
import { getBibleBooks, getChaptersForBook, getVerseCountForBookAndChapter } from '../utils/bibleData';
import themes from '../data/themes.json';
import { useTheme } from '@mui/material/styles';
import Papa from 'papaparse';

const authChannel = new BroadcastChannel('auth');

const excludeFields = ['_id', '__v'];

const SESSION_TIMEOUT_MINUTES = 30; // Adjustable timeout in minutes
const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_MINUTES * 60 * 1000; // Convert to milliseconds

const AdminForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeButton, setActiveButton] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [scriptureRefs, setScriptureRefs] = useState([{
    id: 1,
    selectedBook: '',
    selectedChapter: '',
    startVerse: '',
    endVerse: '',
    availableChapters: [],
    availableVerses: [],
  }]);
  const [selectedThemes, setSelectedThemes] = useState(themes);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [hideUnapproved, setHideUnapproved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const fileInputRef = useRef(null);

  // Use ref for logoutTimer to avoid dependency issues
  const logoutTimerRef = useRef(null);

  // Add state for download filters
  const [downloadRef, setDownloadRef] = useState({
    selectedBook: '',
    selectedChapter: '',
    startVerse: '',
    endVerse: '',
    availableChapters: [],
    availableVerses: [],
  });

  const theme = useTheme();

  const handleLogout = useCallback((reason) => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    
    authChannel.postMessage({ type: 'LOGOUT' });
    setIsLoggedIn(false);
    sessionStorage.removeItem('isLoggedIn');
    
    if (reason === 'inactivity') {
      setShowError(true);
      setErrorMessage('Logged out due to inactivity');
    } else if (reason === 'manual') {
      setLogoutSuccess(true);
    }
  }, []);

  const resetLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    logoutTimerRef.current = setTimeout(() => {
      handleLogout('inactivity');
    }, SESSION_TIMEOUT_MS);
  }, [handleLogout]);

  useEffect(() => {
    if (isLoggedIn) {
      resetLogoutTimer();
      const handleActivity = () => resetLogoutTimer();
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      
      return () => {
        if (logoutTimerRef.current) {
          clearTimeout(logoutTimerRef.current);
        }
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
      };
    }
  }, [isLoggedIn, resetLogoutTimer]);

  useEffect(() => {
    const handleAuthMessage = (event) => {
      if (event.data.type === 'LOGIN') {
        setIsLoggedIn(true);
        sessionStorage.setItem('isLoggedIn', 'true');
        resetLogoutTimer();
      } else if (event.data.type === 'LOGOUT') {
        setIsLoggedIn(false);
        sessionStorage.removeItem('isLoggedIn');
        if (logoutTimerRef.current) {
          clearTimeout(logoutTimerRef.current);
          logoutTimerRef.current = null;
        }
      }
    };

    authChannel.addEventListener('message', handleAuthMessage);
    return () => authChannel.removeEventListener('message', handleAuthMessage);
  }, [resetLogoutTimer]);

  useEffect(() => {
    if (isLoggedIn) {
      const updateLastActivity = () => {
        sessionStorage.setItem('lastActivity', Date.now().toString());
      };

      const checkInactivity = () => {
        const lastActivity = sessionStorage.getItem('lastActivity');
        const now = Date.now();
        if (lastActivity && (now - parseInt(lastActivity) > SESSION_TIMEOUT_MS)) {
          handleLogout('inactivity');
        }
      };

      window.addEventListener('mousemove', updateLastActivity);
      window.addEventListener('keydown', updateLastActivity);

      const intervalId = setInterval(checkInactivity, 60000);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener('mousemove', updateLastActivity);
        window.removeEventListener('keydown', updateLastActivity);
      };
    }
  }, [isLoggedIn, handleLogout]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error('Invalid credentials');
      
      setIsLoggedIn(true);
      sessionStorage.setItem('isLoggedIn', 'true');
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message);
    }
  };

  const closeError = () => {
    setShowError(false);
  };

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  const handleQuestionSelect = (indices, isSelected) => {
    setSelectedQuestions(prev => {
      // Normalize to array if single index
      if (!Array.isArray(indices)) indices = [indices];

      // Check if this is a "Select All" action (indices contains all visible items)
      if (indices.length === filteredQuestions.length) {
        // Toggle behavior - deselect all if all were selected, select all otherwise
        return prev.length === filteredQuestions.length ? [] : indices;
      }

      // Check if this is a header checkbox click (indices is empty array)
      if (indices.length === 0) {
        // Toggle behavior based on current selection state
        return prev.length === filteredQuestions.length ? [] : 
               Array.from({length: filteredQuestions.length}, (_, i) => i);
      }

      // Regular selection/deselection
      return isSelected
        ? [...new Set([...prev, ...indices])]
        : prev.filter(i => !indices.includes(i));
    });
  };

  const updateScriptureRef = (index, updates) => {
    setScriptureRefs(prev => {
      const newRefs = [...prev];
      const currentRef = newRefs[index];
      // Handle verse validation before any other updates
      if (updates.startVerse !== undefined) {
        const newStart = updates.startVerse;
        const currentEnd = updates.endVerse !== undefined ? updates.endVerse : currentRef.endVerse;
        if (currentEnd === undefined || currentEnd === '' || isNaN(Number(currentEnd))) {
          updates.endVerse = newStart;
        } else if (parseInt(currentEnd) < parseInt(newStart)) {
          updates.endVerse = newStart;
        }
      }
      // Update book and reset dependent fields
      if (updates.selectedBook !== undefined) {
        const chapters = getChaptersForBook(updates.selectedBook);
        newRefs[index] = {
          ...currentRef,
          ...updates,
          selectedChapter: '',
          startVerse: '',
          endVerse: '',
          availableChapters: chapters,
          availableVerses: [],
        };
      } 
      // Update chapter and reset verses
      else if (updates.selectedChapter !== undefined) {
        const verses = Array.from(
          { length: getVerseCountForBookAndChapter(currentRef.selectedBook, updates.selectedChapter) },
          (_, i) => (i + 1).toString()
        );
        newRefs[index] = {
          ...currentRef,
          ...updates,
          startVerse: '',
          endVerse: '',
          availableVerses: verses,
        };
      } 
      // Other updates (e.g., startVerse, endVerse)
      else {
        newRefs[index] = { ...currentRef, ...updates };
      }

      return newRefs;
    });
  };

  // On entering Review/Approve, load all unapproved questions by default
  useEffect(() => {
    if (activeButton === 'review' && isLoggedIn) {
      (async () => {
        try {
          // Use performant endpoint for unapproved questions
          const unapproved = await fetchUnapprovedQuestions();
          setFilteredQuestions(unapproved);
        } catch (error) {
          setShowError(true);
          setErrorMessage(error.message);
          setFilteredQuestions([]);
        }
      })();
    }
    if (activeButton === 'edit') {
      setFilteredQuestions([]);
    }
  }, [activeButton, isLoggedIn]);

  // API-based filter for Edit/Delete, client-side filter for Review/Approve
  const applyApiFilters = useCallback(async () => {
    try {
      const ref = scriptureRefs[0];
      if (activeButton === 'review') {
        // Always filter on unapproved questions only
        const unapproved = await fetchUnapprovedQuestions();
        let filtered = unapproved;
        if (ref.selectedBook) {
          filtered = filtered.filter(q => q.book === ref.selectedBook);
        }
        if (ref.selectedChapter) {
          filtered = filtered.filter(q => String(q.chapter) === String(ref.selectedChapter));
        }
        if (ref.startVerse && ref.endVerse && !isNaN(Number(ref.startVerse)) && !isNaN(Number(ref.endVerse))) {
          filtered = filtered.filter(q =>
            parseInt(q.verseStart) <= Number(ref.endVerse) &&
            parseInt(q.verseEnd || q.verseStart) >= Number(ref.startVerse)
          );
        } else {
          if (ref.startVerse && !isNaN(Number(ref.startVerse))) {
            filtered = filtered.filter(q => parseInt(q.verseStart) >= Number(ref.startVerse));
          }
          if (ref.endVerse && !isNaN(Number(ref.endVerse))) {
            filtered = filtered.filter(q => parseInt(q.verseEnd || q.verseStart) <= Number(ref.endVerse));
          }
        }
        if (selectedThemes.length !== themes.length) {
          filtered = filtered.filter(q => selectedThemes.includes(q.theme));
        }
        setFilteredQuestions(filtered);
        return;
      }
      // Edit/Delete: use API
      let startVerseNum = ref.startVerse && !isNaN(Number(ref.startVerse)) ? Number(ref.startVerse) : undefined;
      let endVerseNum = ref.endVerse && !isNaN(Number(ref.endVerse)) ? Number(ref.endVerse) : undefined;
      if (startVerseNum !== undefined && (endVerseNum === undefined || endVerseNum === null)) {
        endVerseNum = startVerseNum;
      }
      const filter = {};
      if (ref.selectedBook) filter.book = ref.selectedBook;
      if (ref.selectedChapter) filter.chapter = ref.selectedChapter;
      if (startVerseNum !== undefined) filter.startVerse = startVerseNum;
      if (endVerseNum !== undefined) filter.endVerse = endVerseNum;
      if (selectedThemes.length !== themes.length) filter.themeArr = selectedThemes;

      // Add isApproved based on hideUnapproved state
      if (hideUnapproved) {
        filter.isApproved = true;
      }
      // If hideUnapproved is false, isApproved is omitted from filter,
      // so backend returns both approved and unapproved matching other criteria.

      const results = await searchQuestions(filter);
      setFilteredQuestions(results);
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message);
      setFilteredQuestions([]);
    }
  }, [scriptureRefs, selectedThemes, activeButton]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedQuestions.length === 0) return;

    try {
      const questionIds = selectedQuestions.map(index => filteredQuestions[index]._id);
      const response = await fetch('/api/delete-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIds }),
      });

      if (!response.ok) throw new Error('Failed to delete questions');

      setShowSuccess(true);
      setSelectedQuestions([]);
      await applyApiFilters();
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message);
    }
  }, [selectedQuestions, filteredQuestions, applyApiFilters]);

  const handleQuestionUpdate = useCallback(async (questionId, updatedData) => {
    try {
      const response = await fetch('/api/update-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, updatedData }),
      });

      if (!response.ok) throw new Error('Failed to update question');

      setShowSuccess(true);
      await applyApiFilters();
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message);
    }
  }, [applyApiFilters]);

  // Update downloadRef when book or chapter changes
  const updateDownloadRef = (updates) => {
    setDownloadRef(prev => {
      const newRef = { ...prev, ...updates };

      // Handle book change
      if (updates.selectedBook !== undefined) {
        newRef.availableChapters = getChaptersForBook(updates.selectedBook);
        newRef.selectedChapter = '';
        newRef.startVerse = '';
        newRef.endVerse = '';
        newRef.availableVerses = [];
      }

      // Handle chapter change
      if (updates.selectedChapter !== undefined) {
        newRef.availableVerses = Array.from(
          { length: getVerseCountForBookAndChapter(prev.selectedBook, updates.selectedChapter) },
          (_, i) => (i + 1).toString()
        );
        newRef.startVerse = '';
        newRef.endVerse = '';
      }

      return newRef;
    });
  };

  // Function to download filtered questions as CSV with dynamic headers
  const downloadFilteredCSV = async () => {
    try {
      const results = await searchQuestions({
        book: downloadRef.selectedBook || '',
        chapter: downloadRef.selectedChapter || '',
        startVerse: downloadRef.startVerse || '',
        endVerse: downloadRef.endVerse || '',
        themeArr: [],
      });

      if (results.length === 0) {
        setShowError(true);
        setErrorMessage('No questions match the selected filters.');
        return;
      }

      const filteredResults = results.map(item => {
        const filtered = {};
        Object.keys(item).forEach(key => {
          if (!excludeFields.includes(key)) {
            filtered[key] = item[key];
          }
        });
        return filtered;
      });

      // const headers = Object.keys(filteredResults[0] || {}); // Handled by Papa.unparse
      // const csvContent = [
      //   headers,
      //   ...filteredResults.map(q => headers.map(header => q[header] || ''))
      // ].map(row => row.join(',')).join('\n');
      const csvContent = Papa.unparse(filteredResults, { header: true });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'filtered_questions.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message);
    }
  };

  // Function to download all questions as CSV with dynamic headers
  const downloadAllCSV = async () => {
    try {
      const results = await fetchAllQuestions();
      
      if (!results?.length) {
        setShowError(true);
        setErrorMessage('No questions available to download');
        return;
      }

      const filteredResults = results.map(item => {
        const filtered = {};
        Object.keys(item).forEach(key => {
          if (!excludeFields.includes(key)) {
            filtered[key] = item[key];
          }
        });
        return filtered;
      });

      // const headers = Object.keys(filteredResults[0] || {}); // Handled by Papa.unparse
      // const csvContent = [
      //   headers,
      //   ...filteredResults.map(item => headers.map(field => `"${String(item[field] || '').replace(/"/g, '""')}"`).join(','))
      // ].join('\r\n');
      const csvContent = Papa.unparse(filteredResults, { header: true });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `questions_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message || 'Download failed');
      console.error('Download error:', error);
    }
  };

  // Approve selected questions in Review/Approve mode
  const handleApproveSelected = useCallback(async () => {
    if (selectedQuestions.length === 0) return;
    try {
      // Get the IDs of selected unapproved questions
      const questionIds = selectedQuestions.map(index => filteredQuestions[index]._id);
      await approveQuestions(questionIds);
      setShowSuccess(true);
      setSelectedQuestions([]);
      // Reload unapproved questions
      const unapproved = await fetchUnapprovedQuestions();
      setFilteredQuestions(unapproved);
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message);
    }
  }, [selectedQuestions, filteredQuestions]);

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) {
      setShowError(true);
      setErrorMessage('Please select a CSV file to upload');
      return;
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setShowError(true);
      setErrorMessage('File must be a CSV file');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const csvContent = event.target.result;
          
          // Send raw CSV to server for processing
          const url = import.meta.env.MODE === 'production'
            ? '/.netlify/functions/bulk-upload'
            : '/api/bulk-upload';
            
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csvText: csvContent })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to upload questions');
          }
          
          const results = await response.json();
          setUploadResults(results);
          
          if (results.successful > 0) {
            setShowSuccess(true);
          }
          
          if (results.failed > 0) {
            setShowError(true);
            setErrorMessage(`${results.failed} question(s) failed to upload. Check results for details.`);
          }
          
          // Reset file input
          fileInputRef.current.value = null;
        } catch (error) {
          setShowError(true);
          setErrorMessage(error.message);
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.onerror = () => {
        setShowError(true);
        setErrorMessage('Error reading file');
        setIsUploading(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message);
      setIsUploading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 6 }, pb: { xs: 2, md: 6 }, px: { xs: 0, md: 4 } }}>
      <Paper 
        elevation={2}
        sx={{ 
          p: { xs: 2, sm: 4, md: 6 },
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: `1.5px solid ${theme.palette.divider}`,
          width: '100%',
          maxWidth: 'none',
          mx: 'auto',
        }}
      >
        {!isLoggedIn ? (
          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 480, mx: 'auto', width: '100%' }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
              size="large"
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              size="large"
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ py: 2, fontSize: '1.1rem' }}>
              Login
            </Button>
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', fontWeight: 700, letterSpacing: 1 }}>
              Admin Mode
            </Typography>
            <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ mb: 5, width: '100%' }}>
              <Grid item xs={12} sm={4} md={3}>
                <Button 
                  variant={activeButton === 'edit' ? 'contained' : 'outlined'} 
                  onClick={() => handleButtonClick('edit')}
                  fullWidth
                  size="large"
                  sx={{ py: 2, fontWeight: 600 }}
                >
                  Edit/Delete
                </Button>
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <Button 
                  variant={activeButton === 'review' ? 'contained' : 'outlined'} 
                  onClick={() => handleButtonClick('review')}
                  fullWidth
                  size="large"
                  sx={{ py: 2, fontWeight: 600 }}
                >
                  Review/Approve
                </Button>
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <Button 
                  variant={activeButton === 'download' ? 'contained' : 'outlined'} 
                  onClick={() => handleButtonClick('download')}
                  fullWidth
                  size="large"
                  sx={{ py: 2, fontWeight: 600 }}
                >
                  Download
                </Button>
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <Button 
                  variant={activeButton === 'upload' ? 'contained' : 'outlined'} 
                  onClick={() => handleButtonClick('upload')}
                  fullWidth
                  size="large"
                  sx={{ py: 2, fontWeight: 600 }}
                >
                  Bulk Upload
                </Button>
              </Grid>
            </Grid>

            {activeButton === 'edit' && (
              <Box sx={{ mb: 5, width: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Filter for Editing/Deleting Questions
                </Typography>
                <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
                  <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                      <ScriptureCombobox
                        label="Book"
                        value={scriptureRefs[0].selectedBook}
                        onChange={(book) => updateScriptureRef(0, { selectedBook: book })}
                        options={getBibleBooks()}
                        placeholder="Select a book"
                        sx={{ width: '100%' }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                      <ScriptureCombobox
                        label="Chapter"
                        value={scriptureRefs[0].selectedChapter}
                        onChange={(chapter) => updateScriptureRef(0, { selectedChapter: chapter })}
                        options={scriptureRefs[0].availableChapters}
                        disabled={!scriptureRefs[0].selectedBook}
                        placeholder={scriptureRefs[0].selectedBook ? "Select chapter" : "Select book first"}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                      <ScriptureCombobox
                        label="Start Verse"
                        value={scriptureRefs[0].startVerse}
                        onChange={(verse) => updateScriptureRef(0, { startVerse: verse })}
                        options={scriptureRefs[0].availableVerses}
                        disabled={!scriptureRefs[0].selectedChapter}
                        placeholder={scriptureRefs[0].selectedChapter ? "Select start verse" : "Select chapter first"}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                      <ScriptureCombobox
                        label="End Verse"
                        value={scriptureRefs[0].endVerse}
                        onChange={(verse) => updateScriptureRef(0, { endVerse: verse })}
                        options={scriptureRefs[0].availableVerses}
                        disabled={!scriptureRefs[0].selectedChapter}
                        placeholder={scriptureRefs[0].selectedChapter ? "Select end verse" : "Select chapter first"}
                        isEndVerse
                        startVerseValue={scriptureRefs[0].startVerse}
                      />
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 2 }}>
                  <TextField
                    select
                    label="Themes"
                    value={selectedThemes}
                    onChange={(e) => setSelectedThemes(e.target.value)}
                    SelectProps={{
                      multiple: true,
                      renderValue: (selected) => selected.length === themes.length ? "All" : selected.join(", "),
                    }}
                    sx={{ width: { xs: '100%', sm: 260 }, fontSize: '1.1rem' }}
                  >
                    {themes.map((theme) => (
                      <MenuItem key={theme} value={theme}>
                        <Checkbox checked={selectedThemes.includes(theme)} />
                        <ListItemText primary={theme} />
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  <Button
                    variant="contained"
                    onClick={applyApiFilters}
                    sx={{ py: 1.5, fontSize: '1.1rem', width: { xs: '100%', sm: 200 } }}
                    size="large"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant={hideUnapproved ? 'contained' : 'outlined'}
                    color="secondary"
                    size="small"
                    sx={{ ml: { xs: 0, sm: 2 }, fontWeight: 500, minWidth: 120, width: { xs: '100%', sm: 'auto' } }}
                    onClick={() => setHideUnapproved(v => !v)}
                  >
                    {hideUnapproved ? 'Show Unapproved' : 'Hide Unapproved'}
                  </Button>
                </Box>
                <Box sx={{ width: '100%', mt: 2 }}>
                  <QuestionTable
                    questions={filteredQuestions}
                    selectedQuestions={selectedQuestions}
                    onQuestionSelect={handleQuestionSelect}
                    showActions={activeButton === 'edit'}
                    onQuestionUpdate={handleQuestionUpdate}
                    hideUnapproved={hideUnapproved}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', mt: 4 }}>
                  <Button 
                    variant="contained" 
                    color="error" 
                    sx={{ py: 1.5, fontSize: '1.1rem', width: { xs: '100%', sm: 260 } }}
                    disabled={selectedQuestions.length === 0}
                    onClick={handleDeleteSelected}
                    size="large"
                  >
                    Delete Selected
                  </Button>
                </Box>
              </Box>
            )}

            {activeButton === 'review' && (
              <Box sx={{ mb: 5, width: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Filter for Reviewing/Approving Questions
                </Typography>
                <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
                  <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                      <ScriptureCombobox
                        label="Book"
                        value={scriptureRefs[0].selectedBook}
                        onChange={(book) => updateScriptureRef(0, { selectedBook: book })}
                        options={getBibleBooks()}
                        placeholder="Select a book"
                        sx={{ width: '100%' }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                      <ScriptureCombobox
                        label="Chapter"
                        value={scriptureRefs[0].selectedChapter}
                        onChange={(chapter) => updateScriptureRef(0, { selectedChapter: chapter })}
                        options={scriptureRefs[0].availableChapters}
                        disabled={!scriptureRefs[0].selectedBook}
                        placeholder={scriptureRefs[0].selectedBook ? "Select chapter" : "Select book first"}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                      <ScriptureCombobox
                        label="Start Verse"
                        value={scriptureRefs[0].startVerse}
                        onChange={(verse) => updateScriptureRef(0, { startVerse: verse })}
                        options={scriptureRefs[0].availableVerses}
                        disabled={!scriptureRefs[0].selectedChapter}
                        placeholder={scriptureRefs[0].selectedChapter ? "Select start verse" : "Select chapter first"}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                      <ScriptureCombobox
                        label="End Verse"
                        value={scriptureRefs[0].endVerse}
                        onChange={(verse) => updateScriptureRef(0, { endVerse: verse })}
                        options={scriptureRefs[0].availableVerses}
                        disabled={!scriptureRefs[0].selectedChapter}
                        placeholder={scriptureRefs[0].selectedChapter ? "Select end verse" : "Select chapter first"}
                        isEndVerse
                        startVerseValue={scriptureRefs[0].startVerse}
                      />
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 2 }}>
                  <TextField
                    select
                    label="Themes"
                    value={selectedThemes}
                    onChange={(e) => setSelectedThemes(e.target.value)}
                    SelectProps={{
                      multiple: true,
                      renderValue: (selected) => selected.length === themes.length ? "All" : selected.join(", "),
                    }}
                    sx={{ width: { xs: '100%', sm: 260 }, fontSize: '1.1rem' }}
                  >
                    {themes.map((theme) => (
                      <MenuItem key={theme} value={theme}>
                        <Checkbox checked={selectedThemes.includes(theme)} />
                        <ListItemText primary={theme} />
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  <Button
                    variant="contained"
                    onClick={applyApiFilters}
                    sx={{ py: 1.5, fontSize: '1.1rem', width: { xs: '100%', sm: 200 } }}
                    size="large"
                  >
                    Apply Filters
                  </Button>
                </Box>
                <Box sx={{ width: '100%', mt: 2 }}>
                  <QuestionTable
                    questions={filteredQuestions}
                    selectedQuestions={selectedQuestions}
                    onQuestionSelect={handleQuestionSelect}
                    showActions={activeButton === 'review'}
                    onQuestionUpdate={handleQuestionUpdate}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', mt: 4 }}>
                  <Button 
                    variant="contained" 
                    color="success" 
                    sx={{ py: 1.5, fontSize: '1.1rem', width: { xs: '100%', sm: 260 } }}
                    disabled={selectedQuestions.length === 0}
                    onClick={handleApproveSelected}
                    size="large"
                  >
                    Approve Selected
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    sx={{ py: 1.5, fontSize: '1.1rem', width: { xs: '100%', sm: 260 } }}
                    disabled={selectedQuestions.length === 0}
                    onClick={handleDeleteSelected}
                    size="large"
                  >
                    Delete Selected
                  </Button>
                </Box>
              </Box>
            )}

            {activeButton === 'download' && (
              <Box sx={{ mb: 5, width: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Download Options
                </Typography>
                <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
                  <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                      <ScriptureCombobox
                        label="Book"
                        value={downloadRef.selectedBook}
                        onChange={(book) => updateDownloadRef({ selectedBook: book })}
                        options={getBibleBooks()}
                        placeholder="Select a book"
                        sx={{ width: '100%' }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                      <ScriptureCombobox
                        label="Chapter"
                        value={downloadRef.selectedChapter}
                        onChange={(chapter) => updateDownloadRef({ selectedChapter: chapter })}
                        options={downloadRef.availableChapters}
                        disabled={!downloadRef.selectedBook}
                        placeholder={downloadRef.selectedBook ? "Select chapter" : "Select book first"}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                      <ScriptureCombobox
                        label="Start Verse"
                        value={downloadRef.startVerse}
                        onChange={(verse) => updateDownloadRef({ startVerse: verse })}
                        options={downloadRef.availableVerses}
                        disabled={!downloadRef.selectedChapter}
                        placeholder={downloadRef.selectedChapter ? "Select start verse" : "Select chapter first"}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                      <ScriptureCombobox
                        label="End Verse"
                        value={downloadRef.endVerse}
                        onChange={(verse) => updateDownloadRef({ endVerse: verse })}
                        options={downloadRef.availableVerses}
                        disabled={!downloadRef.selectedChapter}
                        placeholder={downloadRef.selectedChapter ? "Select end verse" : "Select chapter first"}
                        isEndVerse
                        startVerseValue={downloadRef.startVerse}
                      />
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  <Button
                    variant="contained"
                    onClick={downloadFilteredCSV}
                    sx={{ py: 1.5, fontSize: '1.1rem', width: { xs: '100%', sm: 260 } }}
                    disabled={!downloadRef.selectedBook}
                    size="large"
                  >
                    Download Filtered Questions
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={downloadAllCSV}
                    sx={{ py: 1.5, fontSize: '1.1rem', width: { xs: '100%', sm: 260 } }}
                    size="large"
                  >
                    Download All Questions
                  </Button>
                </Box>
              </Box>
            )}

            {activeButton === 'upload' && (
              <Box sx={{ mb: 5, width: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Bulk Upload Questions
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, mb: 4 }}>
                  <Typography variant="body1" sx={{ textAlign: 'center', maxWidth: 760 }}>
                    Upload a CSV file with questions. The file must:
                    <ul style={{ textAlign: 'left', margin: '10px 0' }}>
                      <li>Have headers: <code>theme</code>, <code>question</code>, <code>book</code>, <code>chapter</code>, <code>verseStart</code>, <code>verseEnd</code> (optional), <code>isApproved</code> (optional)</li>
                      <li>Use valid themes: {themes.join(', ')}</li>
                      <li>Include only valid Bible books, chapters, and verse numbers</li>
                      <li>Use quotation marks for values containing commas</li>
                    </ul>
                    Download the template below for a properly formatted example.
                  </Typography>
                  
                  <Button 
                    variant="contained"
                    color="secondary"
                    href="/questions-template.csv"
                    download
                    sx={{ py: 1.5, fontSize: '1.1rem', width: { xs: '100%', sm: 260 } }}
                    size="large"
                  >
                    Download Template
                  </Button>
                </Box>
                
                <Box component="form" onSubmit={handleBulkUpload} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Box sx={{ width: '100%', maxWidth: 600 }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      id="csv-upload"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="csv-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        fullWidth
                        size="large"
                        sx={{ py: 1.5, mb: 2 }}
                      >
                        Select CSV File
                      </Button>
                    </label>
                  </Box>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isUploading}
                    sx={{ py: 1.5, fontSize: '1.1rem', width: { xs: '100%', sm: 260 } }}
                    size="large"
                  >
                    {isUploading ? <CircularProgress size={24} color="inherit" /> : 'Upload Questions'}
                  </Button>

                  {uploadResults && (
                    <Paper elevation={1} sx={{ p: 3, width: '100%', maxWidth: 600, mt: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Upload Results
                      </Typography>
                      <Typography variant="body1">
                        Total questions: {uploadResults.totalQuestions}
                      </Typography>
                      <Typography variant="body1" color="success.main" sx={{ fontWeight: 500 }}>
                        Successfully uploaded: {uploadResults.successful}
                      </Typography>
                      <Typography variant="body1" color="error.main" sx={{ fontWeight: 500 }}>
                        Failed to upload: {uploadResults.failed}
                      </Typography>
                      
                      {uploadResults.errors.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Errors:
                          </Typography>
                          <Box sx={{ maxHeight: 300, overflowY: 'auto', mt: 1, border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
                            {uploadResults.errors.map((error, index) => (
                              <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < uploadResults.errors.length - 1 ? '1px solid #eee' : 'none' }}>
                                <Typography variant="body2" fontWeight="medium" gutterBottom>
                                  {error.question}
                                </Typography>
                                <Typography variant="body2" color="error.main">
                                  <strong>Error:</strong> {error.error}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                          <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                            Tip: Make sure your CSV has the correct headers (theme, question, book, chapter, verseStart, verseEnd) 
                            and that values match the expected formats. For themes, use one of: {themes.join(', ')}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  )}
                </Box>
              </Box>
            )}

            <Button variant="outlined" onClick={() => handleLogout('manual')} fullWidth size="large" sx={{ mt: 4, py: 2, fontWeight: 600 }}>
              Logout
            </Button>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={closeError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={closeError} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={logoutSuccess}
        autoHideDuration={6000}
        onClose={() => setLogoutSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success">Logged out successfully</Alert>
      </Snackbar>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success">Operation successful</Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminForm;
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
} from '@mui/material';
import QuestionTable from './QuestionTable';
import { searchQuestions, fetchAllQuestions } from '../data/dataService';
import ScriptureCombobox from './ScriptureCombobox';
import { getBibleBooks, getChaptersForBook, getVerseCountForBookAndChapter } from '../utils/bibleData';
import themes from '../data/themes.json';

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

  const handleQuestionSelect = (index, isSelected) => {
    setSelectedQuestions(prev => 
      isSelected ? [...prev, index] : prev.filter(i => i !== index)
    );
  };

  const updateScriptureRef = (index, updates) => {
    setScriptureRefs(prev => {
      const newRefs = [...prev];
      const currentRef = newRefs[index];

      // Handle verse validation
      if (updates.startVerse !== undefined && currentRef.endVerse) {
        if (parseInt(updates.startVerse) > parseInt(currentRef.endVerse)) {
          updates.endVerse = updates.startVerse;
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

  // Memoize applyFilters to avoid dependency issues
  const applyFilters = useCallback(async () => {
    try {
      const ref = scriptureRefs[0]; // Use the first reference
      const results = await searchQuestions({
        book: ref.selectedBook,
        chapter: ref.selectedChapter,
        startVerse: ref.startVerse,
        endVerse: ref.endVerse,
        themeArr: selectedThemes.length === themes.length ? [] : selectedThemes,
      });
      setFilteredQuestions(results);
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message);
      setFilteredQuestions([]); // Clear results on error
    }
  }, [scriptureRefs, selectedThemes]);

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
      await applyFilters();
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message);
    }
  }, [selectedQuestions, filteredQuestions, applyFilters]);

  const handleQuestionUpdate = useCallback(async (questionId, updatedData) => {
    try {
      const response = await fetch('/api/update-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, updatedData }),
      });

      if (!response.ok) throw new Error('Failed to update question');

      setShowSuccess(true);
      await applyFilters();
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message);
    }
  }, [applyFilters]);

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

      const headers = Object.keys(filteredResults[0] || {});
      const csvContent = [
        headers,
        ...filteredResults.map(q => headers.map(header => q[header] || ''))
      ].map(row => row.join(',')).join('\n');

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

      const headers = Object.keys(filteredResults[0] || {});
      const csvContent = [
        headers,
        ...filteredResults.map(item => headers.map(field => `"${String(item[field] || '').replace(/"/g, '""')}"`).join(','))
      ].join('\r\n');

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

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3, textAlign: 'center' }}>
          Admin Login
        </Typography>

        {!isLoggedIn ? (
          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Login
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
              Admin Mode
            </Typography>
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
              <Grid item>
                <Button 
                  variant={activeButton === 'edit' ? 'contained' : 'outlined'} 
                  onClick={() => handleButtonClick('edit')}
                >
                  Edit/Delete
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant={activeButton === 'review' ? 'contained' : 'outlined'} 
                  onClick={() => handleButtonClick('review')}
                >
                  Review/Approve
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant={activeButton === 'download' ? 'contained' : 'outlined'} 
                  onClick={() => handleButtonClick('download')}
                >
                  Download
                </Button>
              </Grid>
            </Grid>

            {activeButton === 'edit' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Filter for Editing/Deleting Questions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <ScriptureCombobox
                      label="Book"
                      value={scriptureRefs[0].selectedBook}
                      onChange={(book) => updateScriptureRef(0, { selectedBook: book })}
                      options={getBibleBooks()}
                      placeholder="Select a book"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <ScriptureCombobox
                      label="Chapter"
                      value={scriptureRefs[0].selectedChapter}
                      onChange={(chapter) => updateScriptureRef(0, { selectedChapter: chapter })}
                      options={scriptureRefs[0].availableChapters}
                      disabled={!scriptureRefs[0].selectedBook}
                      placeholder={scriptureRefs[0].selectedBook ? "Select chapter" : "Select book first"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <ScriptureCombobox
                      label="Start Verse"
                      value={scriptureRefs[0].startVerse}
                      onChange={(verse) => updateScriptureRef(0, { startVerse: verse })}
                      options={scriptureRefs[0].availableVerses}
                      disabled={!scriptureRefs[0].selectedChapter}
                      placeholder={scriptureRefs[0].selectedChapter ? "Select start verse" : "Select chapter first"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
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
                  </Grid>
                </Grid>
                <TextField
                  select
                  fullWidth
                  label="Themes"
                  value={selectedThemes}
                  onChange={(e) => setSelectedThemes(e.target.value)}
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected) => selected.length === themes.length ? "All" : selected.join(", "),
                  }}
                  sx={{ mt: 2 }}
                >
                  {themes.map((theme) => (
                    <MenuItem key={theme} value={theme}>
                      <Checkbox checked={selectedThemes.includes(theme)} />
                      <ListItemText primary={theme} />
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  onClick={applyFilters}
                  sx={{ mt: 2 }}
                >
                  Apply Filters
                </Button>
                <QuestionTable
                  questions={filteredQuestions}
                  selectedQuestions={selectedQuestions}
                  onQuestionSelect={handleQuestionSelect}
                  showActions={activeButton === 'edit'}
                  onQuestionUpdate={handleQuestionUpdate}
                />
                <Button 
                  variant="contained" 
                  color="error" 
                  sx={{ mt: 2 }}
                  onClick={handleDeleteSelected}
                  disabled={selectedQuestions.length === 0}
                >
                  Delete Selected
                </Button>
              </Box>
            )}

            {activeButton === 'review' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Filter for Reviewing/Approving Questions
                </Typography>
                <TextField
                  label="Search by Status"
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <QuestionTable
                  questions={filteredQuestions}
                  selectedQuestions={selectedQuestions}
                  onQuestionSelect={handleQuestionSelect}
                  showActions
                />
                <Button variant="contained" color="success" sx={{ mt: 2 }}>
                  Approve Selected
                </Button>
              </Box>
            )}

            {activeButton === 'download' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Download Options
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <ScriptureCombobox
                      label="Book"
                      value={downloadRef.selectedBook}
                      onChange={(book) => updateDownloadRef({ selectedBook: book })}
                      options={getBibleBooks()}
                      placeholder="Select a book"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <ScriptureCombobox
                      label="Chapter"
                      value={downloadRef.selectedChapter}
                      onChange={(chapter) => updateDownloadRef({ selectedChapter: chapter })}
                      options={downloadRef.availableChapters}
                      disabled={!downloadRef.selectedBook}
                      placeholder={downloadRef.selectedBook ? "Select chapter" : "Select book first"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <ScriptureCombobox
                      label="Start Verse"
                      value={downloadRef.startVerse}
                      onChange={(verse) => updateDownloadRef({ startVerse: verse })}
                      options={downloadRef.availableVerses}
                      disabled={!downloadRef.selectedChapter}
                      placeholder={downloadRef.selectedChapter ? "Select start verse" : "Select chapter first"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
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
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  onClick={downloadFilteredCSV}
                  sx={{ mt: 2 }}
                  disabled={!downloadRef.selectedBook}
                >
                  Download Filtered Questions
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={downloadAllCSV}
                  sx={{ mt: 2, ml: 2 }}
                >
                  Download All Questions
                </Button>
              </Box>
            )}

            <Button variant="outlined" onClick={() => handleLogout('manual')} fullWidth>
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
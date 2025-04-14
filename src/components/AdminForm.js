import React, { useState } from 'react';
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
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
  ListItemText,
  MenuItem,
} from '@mui/material';
import QuestionTable from './QuestionTable';
import { searchQuestions } from '../data/dataService';
import ScriptureCombobox from './ScriptureCombobox';
import { getBibleBooks, getChaptersForBook, getVerseCountForBookAndChapter } from '../utils/bibleData';
import themes from '../data/themes.json';

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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      setIsLoggedIn(true);
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setActiveButton(null);
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

  const applyFilters = async () => {
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
                  showActions
                />
                <Button variant="contained" color="error" sx={{ mt: 2 }}>
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
                <Button variant="contained" color="primary" fullWidth sx={{ mb: 2 }}>
                  Download All Questions
                </Button>
                <Button variant="contained" color="secondary" fullWidth>
                  Download Selected Questions
                </Button>
              </Box>
            )}

            <Button variant="outlined" onClick={handleLogout} fullWidth>
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
    </Container>
  );
};

export default AdminForm;
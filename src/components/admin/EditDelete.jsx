import React, { useState, useEffect, useCallback, useRef } from 'react';
import ScriptureCombobox from '../ScriptureCombobox';
import { getBibleBooks, getChaptersForBook, getVersesForChapter, getSortedQuestions } from '../../utils/bibleData';
import QuestionTable from '../QuestionTable';
import themes from '../../data/themes.json';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Checkbox,
  ListItemText,
  MenuItem
} from '@mui/material';
import { useToast } from '../ToastMessage/Toast';
import { searchQuestions } from '../../services/dataService';

const EditDelete = () => {
  const [hideUnapproved, setHideUnapproved] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState(themes);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const showToast = useToast();

  const [scriptureRefs, setScriptureRefs] = useState([{
    id: 1,
    selectedBook: '',
    selectedChapter: '',
    verseStart: '',
    verseEnd: '',
    availableChapters: [],
    availableVerses: [],
  }]);

  const handleQuestionSelect = (indices, isSelected) => {
    setSelectedQuestions(prev => {
      if (!Array.isArray(indices)) indices = [indices];
      if (indices.length === filteredQuestions.length) {
        return prev.length === filteredQuestions.length ? [] : indices;
      }
      if (indices.length === 0) {
        return prev.length === filteredQuestions.length ? [] :
          Array.from({ length: filteredQuestions.length }, (_, i) => i);
      }
      return isSelected
        ? [...new Set([...prev, ...indices])]
        : prev.filter(i => !indices.includes(i));
    });
  };

  const updateScriptureRef = (index, updates) => {
    setScriptureRefs(prev => {
      const newRefs = [...prev];
      const currentRef = newRefs[index];
      if (updates.verseStart !== undefined) {
        const newStart = updates.verseStart;
        const currentEnd = updates.verseEnd !== undefined ? updates.verseEnd : currentRef.verseEnd;
        if (currentEnd === undefined || currentEnd === '' || isNaN(Number(currentEnd))) {
          updates.verseEnd = newStart;
        } else if (parseInt(currentEnd) < parseInt(newStart)) {
          updates.verseEnd = newStart;
        }
      }
      if (updates.selectedBook !== undefined) {
        const chapters = getChaptersForBook(updates.selectedBook);
        newRefs[index] = {
          ...currentRef,
          ...updates,
          selectedChapter: '',
          verseStart: '',
          verseEnd: '',
          availableChapters: chapters,
          availableVerses: [],
        };
      }
      else if (updates.selectedChapter !== undefined) {
        const verses = Array.from(
          { length: getVersesForChapter(currentRef.selectedBook, updates.selectedChapter) },
          (_, i) => (i + 1).toString()
        );
        newRefs[index] = {
          ...currentRef,
          ...updates,
          verseStart: '',
          verseEnd: '',
          availableVerses: verses,
        };
      }
      else {
        newRefs[index] = { ...currentRef, ...updates };
      }

      return newRefs;
    });
  };

  const applyApiFilters = useCallback(async () => {
    try {
      const ref = scriptureRefs[0];
      const filter = {};
      if (ref.selectedBook) filter.book = ref.selectedBook;
      filter.chapter = ref.selectedChapter || null;
      filter.verseStart = ref.verseStart || null;
      filter.verseEnd = ref.verseEnd || null;
      if (selectedThemes.length !== themes.length) filter.themeArr = selectedThemes;
      if (hideUnapproved) {
        filter.isApproved = true;
      }
      const results = await searchQuestions(filter);
      setFilteredQuestions(results);
    } catch (error) {
      showToast(error.message, 'error');
      setFilteredQuestions([]);
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
      setSelectedQuestions([]);
      await applyApiFilters();
      showToast('Questions deleted successfully', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }, [selectedQuestions, filteredQuestions]);

  const handleQuestionUpdate = useCallback(async (questionId, updatedData) => {
    try {
      const response = await fetch('/api/update-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, updatedData }),
      });

      if (!response.ok) throw new Error('Failed to update question');

      showToast('Questions updated successfully', 'success');
      await applyApiFilters();
    } catch (error) {
      showToast(error.message, 'error');
    }
  }, []);




  return (
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
              value={scriptureRefs[0].verseStart}
              onChange={(verse) => updateScriptureRef(0, { verseStart: verse })}
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
              value={scriptureRefs[0].verseEnd}
              onChange={(verse) => updateScriptureRef(0, { verseEnd: verse })}
              options={scriptureRefs[0].availableVerses}
              disabled={!scriptureRefs[0].selectedChapter}
              placeholder={scriptureRefs[0].selectedChapter ? "Select end verse" : "Select chapter first"}
              isEndVerse
              startVerseValue={scriptureRefs[0].verseStart}
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
          showActions={true}
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
  )
};

export default EditDelete;
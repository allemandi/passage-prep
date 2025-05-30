import React, { useState, useCallback } from 'react';
import ScriptureCombobox from '../../ScriptureCombobox';
import { getBibleBooks, getChaptersForBook, getVersesForChapter } from '../../../utils/bibleData';
import QuestionTable from '../../QuestionTable';
import themes from '../../../data/themes.json';
import { useToast } from '../../ToastMessage/Toast';
import { searchQuestions, clearSearchCache } from '../../../services/dataService';

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
      setSelectedQuestions([]);
    } catch (error) {
      showToast(error.message, 'error');
      setFilteredQuestions([]);
    }
  }, [scriptureRefs, selectedThemes, hideUnapproved]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedQuestions.length === 0) return;

    try {
      const questionIds = selectedQuestions.map(index => filteredQuestions[index]._id);
      setSelectedQuestions([]);
      const response = await fetch('/api/delete-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIds }),
      });

      if (!response.ok) throw new Error('Failed to delete questions');
      setFilteredQuestions(prev => prev.filter(q => !questionIds.includes(q._id)));
      showToast('Questions deleted successfully', 'success');
      clearSearchCache();
    } catch (error) {
      showToast(error.message, 'error');
      applyApiFilters();
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
      setFilteredQuestions(prev =>
        prev.map(q => q._id === questionId ? { ...q, ...updatedData } : q)
      );
      showToast('Question updated successfully', 'success');
      clearSearchCache();
    } catch (error) {
      showToast(error.message, 'error');
      applyApiFilters();
    }
  }, [applyApiFilters]);

  return (
    <div className="mb-12 w-full">
      <h2 className="text-xl font-semibold mb-6 text-center">
        Filter for Editing/Deleting Questions
      </h2>

      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <div className="w-full sm:w-64">
          <ScriptureCombobox
            label="Book"
            value={scriptureRefs[0].selectedBook}
            onChange={(book) => updateScriptureRef(0, { selectedBook: book })}
            options={getBibleBooks()}
            placeholder="Select a book"
          />
        </div>
        <div className="w-full sm:w-64">
          <ScriptureCombobox
            label="Chapter"
            value={scriptureRefs[0].selectedChapter}
            onChange={(chapter) => updateScriptureRef(0, { selectedChapter: chapter })}
            options={scriptureRefs[0].availableChapters}
            disabled={!scriptureRefs[0].selectedBook}
            placeholder={scriptureRefs[0].selectedBook ? "Select chapter" : "Select book first"}
          />
        </div>
        <div className="w-full sm:w-64">
          <ScriptureCombobox
            label="Start Verse"
            value={scriptureRefs[0].verseStart}
            onChange={(verse) => updateScriptureRef(0, { verseStart: verse })}
            options={scriptureRefs[0].availableVerses}
            disabled={!scriptureRefs[0].selectedChapter}
            placeholder={scriptureRefs[0].selectedChapter ? "Select start verse" : "Select chapter first"}
          />
        </div>
        <div className="w-full sm:w-64">
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
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <select
          multiple
          value={selectedThemes}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
            setSelectedThemes(selected);
          }}
          className="w-full sm:w-64 border rounded px-3 py-2"
        >
          {themes.map(theme => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
        <button
          className="bg-blue-600 text-white px-5 py-2 rounded text-lg font-medium hover:bg-blue-700 w-full sm:w-52"
          onClick={applyApiFilters}
        >
          Apply Filters
        </button>
        <button
          className={`border px-5 py-2 rounded text-lg font-medium w-full sm:w-52 ${
            hideUnapproved ? 'bg-gray-800 text-white' : 'bg-white text-gray-800 border-gray-300'
          }`}
          onClick={() => setHideUnapproved(v => !v)}
        >
          {hideUnapproved ? 'Show Unapproved' : 'Hide Unapproved'}
        </button>
      </div>

      <div className="mt-6 w-full">
        <QuestionTable
          questions={filteredQuestions}
          selectedQuestions={selectedQuestions}
          onQuestionSelect={handleQuestionSelect}
          showActions={true}
          onQuestionUpdate={handleQuestionUpdate}
          hideUnapproved={hideUnapproved}
        />
      </div>

      <div className="flex justify-center mt-6">
        <button
          className="bg-red-600 text-white px-6 py-3 rounded text-lg font-semibold w-full sm:w-64 disabled:opacity-50"
          disabled={selectedQuestions.length === 0}
          onClick={handleDeleteSelected}
        >
          Delete Selected ({selectedQuestions.length})
        </button>
      </div>
    </div>
  );
};

export default EditDelete;
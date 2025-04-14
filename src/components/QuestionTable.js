import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TextField,
  IconButton,
  Box,
  Button,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material';
import { Save, Cancel, Edit } from '@mui/icons-material';
import bibleCounts from '../data/bible-counts.json'; // Adjust the path as necessary
import { getBibleBooks, getChaptersForBook, getVerseCountForBookAndChapter } from '../utils/bibleData';
import themes from '../data/themes.json';

const QuestionTable = ({ 
  questions, 
  selectedQuestions, 
  onQuestionSelect,
  showActions,
  onQuestionUpdate 
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [availableBooks] = useState(getBibleBooks());
  const [availableChapters, setAvailableChapters] = useState([]);
  const [availableVerses, setAvailableVerses] = useState([]);

  useEffect(() => {
    if (editData.book) {
      const chapters = getChaptersForBook(editData.book);
      setAvailableChapters(chapters);
    } else {
      setAvailableChapters([]);
    }
  }, [editData.book]);

  useEffect(() => {
    if (editData.book && editData.chapter) {
      const verseCount = getVerseCountForBookAndChapter(editData.book, editData.chapter);
      const verses = Array.from({ length: verseCount }, (_, i) => (i + 1).toString());
      setAvailableVerses(verses);
    } else {
      setAvailableVerses([]);
    }
  }, [editData.book, editData.chapter]);

  const handleEdit = (question) => {
    setEditingId(question._id);
    setEditData({
      book: question.book,
      chapter: question.chapter,
      verseStart: question.verseStart,
      verseEnd: question.verseEnd,
      theme: question.theme,
      question: question.question
    });
  };

  const handleSave = async () => {
    // Validate required fields
    if (!editData.book || !editData.chapter || !editData.verseStart || !editData.theme || !editData.question) {
      return;
    }

    // Validate verse range
    if (parseInt(editData.verseStart) > parseInt(editData.verseEnd || editData.verseStart)) {
      return;
    }

    setIsSaving(true);
    try {
      await onQuestionUpdate(editingId, {
        book: editData.book,
        chapter: editData.chapter,
        verseStart: editData.verseStart,
        verseEnd: editData.verseEnd || editData.verseStart,
        theme: editData.theme,
        question: editData.question
      });
      setEditingId(null);
    } catch (error) {
      console.error('Update failed:', error);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  // Sort questions by book index and then by chapter
  const sortedQuestions = [...questions].sort((a, b) => {
    const bookAIndex = bibleCounts[a.book] || Infinity;
    const bookBIndex = bibleCounts[b.book] || Infinity;
    return bookAIndex === bookBIndex 
      ? (parseInt(a.chapter) || 0) - (parseInt(b.chapter) || 0)
      : bookAIndex - bookBIndex;
  });

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {showActions && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedQuestions.length > 0 && 
                      selectedQuestions.length < questions.length
                    }
                    checked={
                      questions.length > 0 && 
                      selectedQuestions.length === questions.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Select all
                        const allIndices = questions.map((_, index) => index);
                        onQuestionSelect(allIndices, true);
                      } else {
                        // Deselect all
                        onQuestionSelect([], false);
                      }
                    }}
                  />
                </TableCell>
              )}
              <TableCell>Bible Passage</TableCell>
              <TableCell>Theme</TableCell>
              <TableCell>Question</TableCell>
              {showActions && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedQuestions.map((question, index) => (
              <TableRow key={question._id || index}>
                {showActions && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedQuestions.includes(index)}
                      onChange={(e) => onQuestionSelect([index], e.target.checked)}
                    />
                  </TableCell>
                )}
                <TableCell>
                  {`${question.book} ${question.chapter}:${question.verseStart}-${question.verseEnd}`}
                </TableCell>
                <TableCell>{question.theme}</TableCell>
                <TableCell>{question.question}</TableCell>
                {showActions && (
                  <TableCell>
                    <IconButton onClick={() => handleEdit(question)}>
                      <Edit />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Modal */}
      <Dialog open={!!editingId} onClose={handleCancel} maxWidth="xl" fullWidth>
        <DialogTitle>Edit Question</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {/* Book and Chapter */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Autocomplete
                value={editData.book}
                onChange={(_, newValue) => setEditData({
                  ...editData,
                  book: newValue,
                  chapter: '',
                  verseStart: '',
                  verseEnd: ''
                })}
                options={availableBooks}
                sx={{ width: 300 }}  // Wider for book names
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Book"
                    required
                  />
                )}
              />
              <Autocomplete
                value={editData.chapter}
                onChange={(_, newValue) => setEditData({
                  ...editData,
                  chapter: newValue,
                  verseStart: '',
                  verseEnd: ''
                })}
                options={availableChapters}
                disabled={!editData.book}
                sx={{ width: 120 }}  // Narrower for chapters
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chapter"
                    required
                  />
                )}
              />
            </Box>

            {/* Start and End Verse */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Autocomplete
                value={editData.verseStart}
                onChange={(_, newValue) => {
                  const newData = { ...editData, verseStart: newValue };
                  if (newValue && editData.verseEnd && parseInt(newValue) > parseInt(editData.verseEnd)) {
                    newData.verseEnd = newValue;
                  }
                  setEditData(newData);
                }}
                options={availableVerses}
                disabled={!editData.chapter}
                sx={{ width: 120 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Start Verse"
                    required
                  />
                )}
              />
              <Autocomplete
                value={editData.verseEnd}
                onChange={(_, newValue) => setEditData({
                  ...editData,
                  verseEnd: newValue
                })}
                options={availableVerses.filter(v => 
                  !editData.verseStart || parseInt(v) >= parseInt(editData.verseStart)
                )}
                disabled={!editData.verseStart}
                sx={{ width: 120 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="End Verse"
                    required
                  />
                )}
              />
            </Box>

            {/* Theme and Question (full-width) */}
            <Autocomplete
              value={editData.theme}
              onChange={(_, newValue) => setEditData({
                ...editData,
                theme: newValue
              })}
              options={themes}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Theme"
                  required
                />
              )}
            />
            <TextField
              value={editData.question}
              onChange={(e) => setEditData({...editData, question: e.target.value})}
              label="Question"
              required
              fullWidth
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" disabled={isSaving}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuestionTable;

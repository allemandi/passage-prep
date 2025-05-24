import React from 'react';
import { useState, useEffect } from 'react';
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
    DialogActions
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { getBibleBooks, getChaptersForBook, getVersesForChapter, getSortedQuestions } from '../utils/bibleData';
import themes from '../data/themes.json';

const QuestionTable = ({
    questions,
    selectedQuestions,
    onQuestionSelect,
    showActions,
    onQuestionUpdate,
    hideUnapproved = false,
    hideEditActions = false
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
            const verseCount = getVersesForChapter(editData.book, editData.chapter);
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
        if (!editData.book || !editData.chapter || !editData.verseStart || !editData.theme || !editData.question) {
            return;
        }
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


    const parseNumber = (value) => {

        if (typeof value === 'number') return value;
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? 0 : parsed;
    };

    const filtered = hideUnapproved ? questions.filter(q => q.isApproved !== false) : questions;
    const questionsWithIndices = filtered.map((question, index) => ({
        ...question,
        originalIndex: questions.indexOf(question)
    }));
    const sortedQuestionsWithIndices = getSortedQuestions(questionsWithIndices);


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
                                            selectedQuestions.length < filtered.length
                                        }
                                        checked={
                                            filtered.length > 0 &&
                                            selectedQuestions.length === filtered.length
                                        }
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                // Select all - use original indices from sorted questions
                                                const allOriginalIndices = sortedQuestionsWithIndices.map(q => q.originalIndex);
                                                onQuestionSelect(allOriginalIndices, true);
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
                            {showActions && !hideEditActions && <TableCell>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedQuestionsWithIndices.map((question, index) => {

                            const reference = `${question.book} ${question.chapter}:${question.verseStart}${question.verseEnd && question.verseEnd !== question.verseStart
                                ? `-${question.verseEnd}`
                                : ''
                                }`;

                            return (
                                <TableRow key={question._id || index}>
                                    {showActions && (
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedQuestions.includes(question.originalIndex)}
                                                onChange={(e) => onQuestionSelect([question.originalIndex], e.target.checked)}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell>{reference}</TableCell>
                                    <TableCell>{question.theme}</TableCell>
                                    <TableCell>{question.question}</TableCell>
                                    {showActions && !hideEditActions && (
                                        <TableCell>
                                            <IconButton onClick={() => handleEdit(question)}>
                                                <Edit />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>


            <Dialog open={!!editingId} onClose={handleCancel} maxWidth="xl" fullWidth>
                <DialogTitle>Edit Question</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>

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
                                sx={{ width: 300 }}
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
                                sx={{ width: 120 }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Chapter"
                                        required
                                    />
                                )}
                            />
                        </Box>
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
                            onChange={(e) => setEditData({ ...editData, question: e.target.value })}
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

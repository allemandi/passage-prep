import React, { useState, useCallback, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Grid,
    Checkbox,
    ListItemText,
    MenuItem,
    Alert,
    Snackbar,
    FormControl, // Added
    InputLabel,  // Added
    Select,      // Added
    OutlinedInput // Added
} from '@mui/material';
import QuestionTable from '../QuestionTable';
import { searchQuestions } from '../../services/dataService';
import ScriptureCombobox from '../ScriptureCombobox';
import { getBibleBooks, getChaptersForBook, getVersesForChapter } from '../../utils/bibleData';
import themesData from '../../data/themes.json'; // Renamed to avoid conflict

// Define ITEM_HEIGHT and ITEM_PADDING_TOP for the Select component - Copied from AdminForm for themes
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const EditDelete = () => {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [scriptureRefs, setScriptureRefs] = useState([{
        id: 1,
        selectedBook: '',
        selectedChapter: '',
        verseStart: '',
        verseEnd: '',
        availableChapters: [],
        availableVerses: [],
    }]);
    const [currentSelectedThemes, setCurrentSelectedThemes] = useState(themesData); // Changed from selectedThemes to avoid conflict if prop comes from Admin
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [hideUnapproved, setHideUnapproved] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setFilteredQuestions([]);
    }, []);

    const handleQuestionSelect = (indices, isSelected) => {
        setSelectedQuestions(prev => {
            if (!Array.isArray(indices)) indices = [indices];
            if (indices.length === filteredQuestions.length) { // Select/Deselect All based on current content
                return prev.length === filteredQuestions.length ? [] : filteredQuestions.map((_,idx) => idx);
            }
             // For individual or group selections not matching "all"
            let newSelected = new Set(prev);
            if (isSelected) {
                indices.forEach(idx => newSelected.add(idx));
            } else {
                indices.forEach(idx => newSelected.delete(idx));
            }
            return Array.from(newSelected);
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
            } else if (updates.selectedChapter !== undefined) {
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
            } else {
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
            if (currentSelectedThemes.length !== themesData.length) filter.themeArr = currentSelectedThemes;

            if (hideUnapproved) {
                filter.isApproved = true;
            }
            const results = await searchQuestions(filter);
            setFilteredQuestions(results);
            setSelectedQuestions([]); // Clear selection after new filter
            if (results.length === 0) {
                setShowSuccess(true); // Or a specific info message
                setErrorMessage("No questions found matching your criteria."); // Using errorMessage for info too
            }
        } catch (error) {
            setErrorMessage(error.message || "Failed to fetch questions.");
            setShowError(true);
            setFilteredQuestions([]);
            setSelectedQuestions([]);
        }
    }, [scriptureRefs, currentSelectedThemes, hideUnapproved]);

    const handleDeleteSelected = useCallback(async () => {
        if (selectedQuestions.length === 0) {
            setErrorMessage("No questions selected for deletion.");
            setShowError(true);
            return;
        }
        try {
            const questionIds = selectedQuestions.map(index => filteredQuestions[index]._id);
            const response = await fetch('/api/delete-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ questionIds }),
            });
            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to delete questions');
            }
            setErrorMessage('Selected questions deleted successfully.'); // Use errorMessage for success too
            setShowSuccess(true);
            setSelectedQuestions([]);
            await applyApiFilters(); // Refresh list
        } catch (error) {
            setErrorMessage(error.message || "Failed to delete questions.");
            setShowError(true);
        }
    }, [selectedQuestions, filteredQuestions, applyApiFilters]);

    const handleQuestionUpdate = useCallback(async (questionId, updatedData) => {
        try {
            const response = await fetch('/api/update-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ questionId, updatedData }),
            });
             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to update question');
            }
            setErrorMessage('Question updated successfully.'); // Use errorMessage for success too
            setShowSuccess(true);
            await applyApiFilters(); // Refresh list
        } catch (error) {
            setErrorMessage(error.message || "Failed to update question.");
            setShowError(true);
        }
    }, [applyApiFilters]);
    
    const closeErrorSnackbar = () => setShowError(false);
    const closeSuccessSnackbar = () => setShowSuccess(false);

    return (
        <Box sx={{ mb: 5, width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Filter for Editing/Deleting Questions
            </Typography>
            <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
                {scriptureRefs.map((ref, index) => ( // Assuming only one ref for now, but mapping is fine
                    <React.Fragment key={ref.id}>
                        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                                <ScriptureCombobox
                                    label="Book"
                                    value={ref.selectedBook}
                                    onChange={(book) => updateScriptureRef(index, { selectedBook: book })}
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
                                    value={ref.selectedChapter}
                                    onChange={(chapter) => updateScriptureRef(index, { selectedChapter: chapter })}
                                    options={ref.availableChapters}
                                    disabled={!ref.selectedBook}
                                    placeholder={ref.selectedBook ? "Select chapter" : "Select book first"}
                                    sx={{ width: '100%' }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                                <ScriptureCombobox
                                    label="Start Verse"
                                    value={ref.verseStart}
                                    onChange={(verse) => updateScriptureRef(index, { verseStart: verse })}
                                    options={ref.availableVerses}
                                    disabled={!ref.selectedChapter}
                                    placeholder={ref.selectedChapter ? "Select start verse" : "Select chapter first"}
                                    sx={{ width: '100%' }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                                <ScriptureCombobox
                                    label="End Verse"
                                    value={ref.verseEnd}
                                    onChange={(verse) => updateScriptureRef(index, { verseEnd: verse })}
                                    options={ref.availableVerses}
                                    disabled={!ref.selectedChapter}
                                    placeholder={ref.selectedChapter ? "Select end verse" : "Select chapter first"}
                                    isEndVerse
                                    startVerseValue={ref.verseStart}
                                    sx={{ width: '100%' }}
                                />
                            </Box>
                        </Grid>
                    </React.Fragment>
                ))}
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 2 }}>
                 <FormControl sx={{ m: 1, width: { xs: '100%', sm: 260 } }}>
                    <InputLabel id="theme-multiple-checkbox-label">Themes</InputLabel>
                    <Select
                        labelId="theme-multiple-checkbox-label"
                        id="theme-multiple-checkbox"
                        multiple
                        value={currentSelectedThemes}
                        onChange={(event) => setCurrentSelectedThemes(event.target.value)}
                        input={<OutlinedInput label="Themes" />}
                        renderValue={(selected) => selected.length === themesData.length ? "All" : selected.join(', ')}
                        MenuProps={MenuProps}
                    >
                        {themesData.map((themeName) => (
                            <MenuItem key={themeName} value={themeName}>
                                <Checkbox checked={currentSelectedThemes.indexOf(themeName) > -1} />
                                <ListItemText primary={themeName} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
                    size="small" // This was small in AdminForm, can adjust if needed
                    sx={{ ml: { xs: 0, sm: 2 }, fontWeight: 500, minWidth: 120, width: { xs: '100%', sm: 'auto' } }}
                    onClick={() => setHideUnapproved(v => !v)}
                >
                    {hideUnapproved ? 'Show All (Inc. Unapproved)' : 'Hide Unapproved'}
                </Button>
            </Box>
            <Box sx={{ width: '100%', mt: 2, overflowX: 'auto' }}> {/* Added overflowX for table responsiveness */}
                <QuestionTable
                    questions={filteredQuestions}
                    selectedQuestions={selectedQuestions}
                    onSelectQuestion={handleQuestionSelect} // Changed prop name from onQuestionSelect
                    onUpdateQuestion={handleQuestionUpdate}
                    isAdmin={true} // Assuming true since this is an admin function
                    showActions={true} // Always true in EditDelete
                    hideUnapproved={hideUnapproved} // Pass this state
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
                    Delete Selected ({selectedQuestions.length})
                </Button>
            </Box>

            {/* Snackbar for errors */}
            <Snackbar
                open={showError}
                autoHideDuration={6000}
                onClose={closeErrorSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={closeErrorSnackbar} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
            {/* Snackbar for success */}
            <Snackbar
                open={showSuccess}
                autoHideDuration={6000}
                onClose={closeSuccessSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                {/* Using Alert with error severity for info messages too, for simplicity. Can be changed to info. */}
                <Alert onClose={closeSuccessSnackbar} severity={errorMessage.includes("No questions found") ? "info" : "success"} sx={{ width: '100%' }}>
                    {errorMessage} 
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default EditDelete;

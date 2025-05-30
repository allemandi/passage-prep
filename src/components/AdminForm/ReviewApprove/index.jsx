import React, { useState, useEffect, useCallback } from 'react';
import { Check, Trash2, RefreshCcw, Filter } from 'lucide-react';
import QuestionTable from '../../QuestionTable';
import { fetchUnapprovedQuestions, approveQuestions } from '../../../services/dataService';
import ScriptureCombobox from '../../ScriptureCombobox';
import { getBibleBooks, getChaptersForBook, getVersesForChapter } from '../../../utils/bibleData';
import { useToast } from '../../ToastMessage/Toast';
import ThemesMultiSelect, { defaultThemes } from '../../ThemesMultiSelect';

const ReviewApprove = () => {
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
    const [selectedThemes, setSelectedThemes] = useState(defaultThemes);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [allUnapprovedQuestions, setAllUnapprovedQuestions] = useState([]);
    const showToast = useToast();

    const fetchUnapprovedData = useCallback(async () => {
        try {
            const unapproved = await fetchUnapprovedQuestions();
            setAllUnapprovedQuestions(unapproved);
            setFilteredQuestions(unapproved);
            setSelectedQuestions([]);
        } catch (error) {
            showToast(error.message, 'error');
            setFilteredQuestions([]);
            setAllUnapprovedQuestions([]);
        }
    }, [showToast]);

    useEffect(() => {
        fetchUnapprovedData();
    }, [fetchUnapprovedData]);

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
            let filtered = [...allUnapprovedQuestions];

            if (ref.selectedBook) {
                filtered = filtered.filter(q => q.book === ref.selectedBook);
            }
            if (ref.selectedChapter) {
                filtered = filtered.filter(q => String(q.chapter) === String(ref.selectedChapter));
            }
            if (ref.verseStart && ref.verseEnd && !isNaN(Number(ref.verseStart)) && !isNaN(Number(ref.verseEnd))) {
                filtered = filtered.filter(q =>
                    parseInt(q.verseStart) <= Number(ref.verseEnd) &&
                    parseInt(q.verseEnd || q.verseStart) >= Number(ref.verseStart)
                );
            } else {
                if (ref.verseStart && !isNaN(Number(ref.verseStart))) {
                    filtered = filtered.filter(q => parseInt(q.verseStart) >= Number(ref.verseStart));
                }
                if (ref.verseEnd && !isNaN(Number(ref.verseEnd))) {
                    filtered = filtered.filter(q => parseInt(q.verseEnd || q.verseStart) <= Number(ref.verseEnd));
                }
            }
            if (selectedThemes.length !== defaultThemes.length) {
                filtered = filtered.filter(q => selectedThemes.includes(q.theme));
            }

            setFilteredQuestions(filtered);
            setSelectedQuestions([]);
        } catch (error) {
            showToast(error.message, 'error');
            setFilteredQuestions([]);
        }
    }, [scriptureRefs, selectedThemes, allUnapprovedQuestions, showToast]);

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
            setAllUnapprovedQuestions(prev => prev.filter(q => !questionIds.includes(q._id)));
            showToast('Questions deleted successfully', 'success');
            setTimeout(() => fetchUnapprovedData(), 500);
        } catch (error) {
            showToast(error.message, 'error');
            fetchUnapprovedData();
        }
    }, [selectedQuestions, filteredQuestions, fetchUnapprovedData, showToast]);

    const handleQuestionUpdate = useCallback(async (questionId, updatedData) => {
        try {
            const response = await fetch('/api/update-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId, updatedData }),
            });

            if (!response.ok) throw new Error('Failed to update question');
            const updateQuestion = (questions) =>
                questions.map(q => q._id === questionId ? { ...q, ...updatedData } : q);

            setFilteredQuestions(updateQuestion);
            setAllUnapprovedQuestions(updateQuestion);

            showToast('Question updated successfully', 'success');
            setTimeout(() => fetchUnapprovedData(), 500);
        } catch (error) {
            showToast(error.message, 'error');
            fetchUnapprovedData();
        }
    }, [fetchUnapprovedData, showToast]);

    const handleApproveSelected = useCallback(async () => {
        if (selectedQuestions.length === 0) return;

        try {
            const questionIds = selectedQuestions.map(index => filteredQuestions[index]._id);
            setSelectedQuestions([]);

            await approveQuestions(questionIds);
            setFilteredQuestions(prev => prev.filter(q => !questionIds.includes(q._id)));
            setAllUnapprovedQuestions(prev => prev.filter(q => !questionIds.includes(q._id)));

            showToast('Questions approved successfully', 'success');
            setTimeout(() => fetchUnapprovedData(), 500);
        } catch (error) {
            showToast(error.message, 'error');
            fetchUnapprovedData();
        }
    }, [selectedQuestions, filteredQuestions, fetchUnapprovedData, showToast]);

    return (
        <div className="w-full mb-10">
            <h2 className="text-xl font-semibold mb-6 text-center">Filter for Reviewing/Approving Questions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 justify-center">
                <ScriptureCombobox
                    label="Book"
                    value={scriptureRefs[0].selectedBook}
                    onChange={(book) => updateScriptureRef(0, { selectedBook: book })}
                    options={getBibleBooks()}
                    placeholder="Select a book"
                />
                <ScriptureCombobox
                    label="Chapter"
                    value={scriptureRefs[0].selectedChapter}
                    onChange={(chapter) => updateScriptureRef(0, { selectedChapter: chapter })}
                    options={scriptureRefs[0].availableChapters}
                    disabled={!scriptureRefs[0].selectedBook}
                    placeholder="Select chapter"
                />
                <ScriptureCombobox
                    label="Start Verse"
                    value={scriptureRefs[0].verseStart}
                    onChange={(verse) => updateScriptureRef(0, { verseStart: verse })}
                    options={scriptureRefs[0].availableVerses}
                    disabled={!scriptureRefs[0].selectedChapter}
                    placeholder="Start verse"
                />
                <ScriptureCombobox
                    label="End Verse"
                    value={scriptureRefs[0].verseEnd}
                    onChange={(verse) => updateScriptureRef(0, { verseEnd: verse })}
                    options={scriptureRefs[0].availableVerses}
                    disabled={!scriptureRefs[0].selectedChapter}
                    placeholder="End verse"
                    isEndVerse
                    startVerseValue={scriptureRefs[0].verseStart}
                />
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center mt-4 gap-4">
                <ThemesMultiSelect
                    value={selectedThemes}
                    onChange={setSelectedThemes}
                />

                <button
                    onClick={applyApiFilters}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    <Filter className="w-5 h-5" /> Apply Filters
                </button>
                
            </div>

            <div className="mt-6">
                <QuestionTable
                    questions={filteredQuestions}
                    selectedQuestions={selectedQuestions}
                    onQuestionSelect={handleQuestionSelect}
                    showActions={true}
                    onQuestionUpdate={handleQuestionUpdate}
                />
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <button
                    onClick={handleApproveSelected}
                    disabled={selectedQuestions.length === 0}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded disabled:opacity-50"
                >
                    <Check className="w-5 h-5" /> Approve Selected ({selectedQuestions.length})
                </button>
                <button
                    onClick={handleDeleteSelected}
                    disabled={selectedQuestions.length === 0}
                    className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded disabled:opacity-50"
                >
                    <Trash2 className="w-5 h-5" /> Delete Selected ({selectedQuestions.length})
                </button>
            </div>
        </div>
    );
};

export default ReviewApprove;
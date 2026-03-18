import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Trash2 } from 'lucide-react';
import QuestionTable from '../../QuestionTable';
import { fetchUnapprovedQuestions, approveQuestions } from '../../../services/dataService';
import { useToast } from '../../ToastMessage/Toast';
import { defaultThemes } from '../../ui/ThemeSelect';
import Button from '../../ui/Button';
import AdminFilterBar from '../AdminFilterBar';
import useQuestionSelection from '../../../hooks/useQuestionSelection';

const ReviewApprove = () => {
    const [allUnapprovedQuestions, setAllUnapprovedQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const { selectedIds, toggleSelection, resetSelection } = useQuestionSelection();
    const showToast = useToast();

    // Store current filter values to re-apply after actions
    const currentFilters = useRef({ book: '', chapter: '', verseStart: '', verseEnd: '', themes: defaultThemes });

    const fetchUnapprovedData = useCallback(async () => {
        try {
            const unapproved = await fetchUnapprovedQuestions();
            setAllUnapprovedQuestions(unapproved);

            // Re-apply current filters to the newly fetched data
            applyApiFilters(currentFilters.current, unapproved);
        } catch (error) {
            showToast(error.message, 'error');
            setFilteredQuestions([]);
            setAllUnapprovedQuestions([]);
        }
    }, [showToast]);

    useEffect(() => {
        // Initial fetch
        const initialFetch = async () => {
            try {
                const unapproved = await fetchUnapprovedQuestions();
                setAllUnapprovedQuestions(unapproved);
                setFilteredQuestions(unapproved); // Initially show all
            } catch (error) {
                showToast(error.message, 'error');
            }
        };
        initialFetch();
    }, [showToast]);

    const applyApiFilters = useCallback(({ book, chapter, verseStart, verseEnd, themes }, sourceData = allUnapprovedQuestions) => {
        currentFilters.current = { book, chapter, verseStart, verseEnd, themes };
        let filtered = [...sourceData];

        if (book) {
            filtered = filtered.filter(q => q.book === book);
        }
        if (chapter) {
            filtered = filtered.filter(q => String(q.chapter) === String(chapter));
        }
        if (verseStart && verseEnd) {
            filtered = filtered.filter(q =>
                parseInt(q.verseStart) <= Number(verseEnd) &&
                parseInt(q.verseEnd || q.verseStart) >= Number(verseStart)
            );
        } else {
            if (verseStart) {
                filtered = filtered.filter(q => parseInt(q.verseStart) >= Number(verseStart));
            }
            if (verseEnd) {
                filtered = filtered.filter(q => parseInt(q.verseEnd || q.verseStart) <= Number(verseEnd));
            }
        }
        if (themes.length !== defaultThemes.length) {
            filtered = filtered.filter(q => themes.includes(q.theme));
        }

        setFilteredQuestions(filtered);
        resetSelection();
    }, [allUnapprovedQuestions, resetSelection]);

    const handleDeleteSelected = useCallback(async () => {
        if (selectedIds.length === 0) return;

        try {
            const response = await fetch('/api/delete-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionIds: selectedIds }),
            });

            if (!response.ok) throw new Error('Failed to delete questions');

            showToast('Questions deleted successfully', 'success');
            await fetchUnapprovedData();
        } catch (error) {
            showToast(error.message, 'error');
            fetchUnapprovedData();
        }
    }, [selectedIds, fetchUnapprovedData, showToast]);

    const handleQuestionUpdate = useCallback(async (questionId, updatedData) => {
        try {
            const response = await fetch('/api/update-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId, updatedData }),
            });

            if (!response.ok) throw new Error('Failed to update question');

            showToast('Question updated successfully', 'success');
            await fetchUnapprovedData();
        } catch (error) {
            showToast(error.message, 'error');
            fetchUnapprovedData();
        }
    }, [fetchUnapprovedData, showToast]);

    const handleApproveSelected = useCallback(async () => {
        if (selectedIds.length === 0) return;

        try {
            await approveQuestions(selectedIds);
            showToast('Questions approved successfully', 'success');
            await fetchUnapprovedData();
        } catch (error) {
            showToast(error.message, 'error');
            fetchUnapprovedData();
        }
    }, [selectedIds, fetchUnapprovedData, showToast]);

    return (
        <div className="w-full mb-10">
            <AdminFilterBar
                title="Filter for Reviewing/Approving Questions"
                onApply={applyApiFilters}
            />

            <div className="mt-6">
                <QuestionTable
                    questions={filteredQuestions}
                    selectedIds={selectedIds}
                    onSelectionChange={toggleSelection}
                    showActions={true}
                    onQuestionUpdate={handleQuestionUpdate}
                />
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12">
                <Button
                    onClick={handleApproveSelected}
                    disabled={selectedIds.length === 0}
                    className="w-full sm:w-auto min-w-[240px]"
                >
                    <Check className="w-5 h-5" /> Approve Selected ({selectedIds.length})
                </Button>
                <Button
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.length === 0}
                    variant="outline"
                    className="w-full sm:w-auto min-w-[240px] border-2 border-secondary-400 text-secondary-600 hover:bg-secondary-50 dark:text-secondary-400 dark:hover:bg-secondary-900/20"
                >
                    <Trash2 className="w-5 h-5" /> Delete Selected ({selectedIds.length})
                </Button>
            </div>
        </div>
    );
};

export default ReviewApprove;

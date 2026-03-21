import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Trash2, Loader2 } from 'lucide-react';
import QuestionTable from '../../QuestionTable';
import { fetchUnapprovedQuestions, approveQuestions, deleteQuestions, updateQuestion } from '../../../services/dataService';
import { useToast } from '../../ToastMessage/Toast';
import { defaultThemes } from '../../ui/ThemeSelect';
import Button from '../../ui/Button';
import AdminFilterBar from '../AdminFilterBar';
import useQuestionSelection from '../../../hooks/useQuestionSelection';

const ReviewApprove = () => {
    const [allUnapprovedQuestions, setAllUnapprovedQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { selectedIds, toggleSelection, resetSelection } = useQuestionSelection();
    const showToast = useToast();

    // Store current filter values to re-apply after actions
    const currentFilters = useRef({ book: '', chapter: '', verseStart: '', verseEnd: '', themes: defaultThemes });

    const fetchUnapprovedData = useCallback(async (isInitial = false) => {
        if (isInitial) setIsFetching(true);
        try {
            const unapproved = await fetchUnapprovedQuestions();
            setAllUnapprovedQuestions(unapproved);

            // Re-apply current filters to the newly fetched data
            applyApiFilters(currentFilters.current, unapproved);
        } catch (error) {
            showToast(error.message, 'error');
            setFilteredQuestions([]);
            setAllUnapprovedQuestions([]);
        } finally {
            if (isInitial) setIsFetching(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchUnapprovedData(true);
    }, [fetchUnapprovedData]);

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

        setIsProcessing(true);
        try {
            await deleteQuestions(selectedIds);
            showToast('Questions deleted successfully', 'success');
            await fetchUnapprovedData();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsProcessing(false);
        }
    }, [selectedIds, fetchUnapprovedData, showToast]);

    const handleQuestionUpdate = useCallback(async (questionId, updatedData) => {
        try {
            await updateQuestion(questionId, updatedData);
            showToast('Question updated successfully', 'success');
            await fetchUnapprovedData();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }, [fetchUnapprovedData, showToast]);

    const handleApproveSelected = useCallback(async () => {
        if (selectedIds.length === 0) return;

        setIsProcessing(true);
        try {
            await approveQuestions(selectedIds);
            showToast('Questions approved successfully', 'success');
            await fetchUnapprovedData();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsProcessing(false);
        }
    }, [selectedIds, fetchUnapprovedData, showToast]);

    return (
        <div className="w-full mb-10">
            <AdminFilterBar
                title="Filter for Reviewing/Approving Questions"
                onApply={applyApiFilters}
            />

            <div className="mt-6 relative min-h-[200px]">
                {isFetching ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-app-bg/50 z-10 rounded-lg">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                    </div>
                ) : (
                    <QuestionTable
                        questions={filteredQuestions}
                        selectedIds={selectedIds}
                        onSelectionChange={toggleSelection}
                        showActions={true}
                        onQuestionUpdate={handleQuestionUpdate}
                    />
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12">
                <Button
                    onClick={handleApproveSelected}
                    disabled={selectedIds.length === 0 || isProcessing}
                    isLoading={isProcessing}
                    className="w-full sm:w-auto min-w-[240px]"
                >
                    <Check className="w-5 h-5" /> Approve Selected ({selectedIds.length})
                </Button>
                <Button
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.length === 0 || isProcessing}
                    isLoading={isProcessing}
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

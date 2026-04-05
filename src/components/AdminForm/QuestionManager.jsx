import { useState, useCallback, useRef, useEffect } from 'react';
import QuestionTable from '../QuestionTable';
import { useToast } from '../ToastMessage/Toast';
import {
    searchQuestions,
    clearSearchCache,
    deleteQuestions,
    updateQuestion,
    approveQuestions,
} from '../../services/dataService';
import { defaultThemes } from '../ui/ThemeSelect';
import Button from '../ui/Button';
import { Trash2, Check, Eye, EyeOff } from 'lucide-react';
import AdminFilterBar from './AdminFilterBar';
import LoadingOverlay from '../ui/LoadingOverlay';
import useQuestionSelection from '../../hooks/useQuestionSelection';

/**
 * Unified component for managing questions (both review and edit modes).
 *
 * @param {string} title - Title for the filter bar
 * @param {boolean} showApproveAction - Whether to show the "Approve" button
 * @param {boolean} initialHideUnapproved - Default state for the "Hide Unapproved" toggle
 */
const QuestionManager = ({
    title,
    showApproveAction = false,
    initialHideUnapproved = false
}) => {
    const [hideUnapproved, setHideUnapproved] = useState(initialHideUnapproved);
    const [questions, setQuestions] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { selectedIds, toggleSelection, resetSelection } = useQuestionSelection();
    const showToast = useToast();

    // Store current filter values to re-apply after actions
    const currentFilters = useRef({ book: '', chapter: '', verseStart: '', verseEnd: '', themes: defaultThemes });

    const fetchFilteredData = useCallback(async (filters = currentFilters.current) => {
        currentFilters.current = filters;
        setIsFetching(true);
        try {
            const apiFilter = {
                book: filters.book || undefined,
                chapter: filters.chapter || null,
                verseStart: filters.verseStart || null,
                verseEnd: filters.verseEnd || null,
                themeArr: filters.themes.length !== defaultThemes.length ? filters.themes : undefined,
                isApproved: hideUnapproved ? true : (showApproveAction ? false : undefined),
            };

            const results = await searchQuestions(apiFilter);
            setQuestions(results);
            resetSelection();
        } catch (error) {
            showToast(error.message, 'error');
            setQuestions([]);
        } finally {
            setIsFetching(false);
        }
    }, [hideUnapproved, showApproveAction, showToast, resetSelection]);

    // Re-fetch when hideUnapproved changes
    useEffect(() => {
        fetchFilteredData();
    }, [fetchFilteredData]);

    const handleApplyFilters = (filters) => {
        fetchFilteredData(filters);
    };

    const handleDeleteSelected = useCallback(async () => {
        if (selectedIds.length === 0) return;

        setIsProcessing(true);
        try {
            await deleteQuestions(selectedIds);
            showToast(`${selectedIds.length} question(s) deleted successfully`, 'success');
            clearSearchCache();
            await fetchFilteredData();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsProcessing(false);
        }
    }, [selectedIds, fetchFilteredData, showToast]);

    const handleApproveSelected = useCallback(async () => {
        if (selectedIds.length === 0) return;

        setIsProcessing(true);
        try {
            await approveQuestions(selectedIds);
            showToast(`${selectedIds.length} question(s) approved successfully`, 'success');
            clearSearchCache();
            await fetchFilteredData();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsProcessing(false);
        }
    }, [selectedIds, fetchFilteredData, showToast]);

    const handleQuestionUpdate = useCallback(async (questionId, updatedData) => {
        try {
            await updateQuestion(questionId, updatedData);
            showToast('Question updated successfully', 'success');
            clearSearchCache();
            await fetchFilteredData();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }, [fetchFilteredData, showToast]);

    return (
        <div className="mb-10 w-full animate-in fade-in duration-500">
            <AdminFilterBar
                title={title}
                onApply={handleApplyFilters}
            >
                {!showApproveAction && (
                    <Button
                        type="button"
                        variant={hideUnapproved ? 'secondary' : 'outline'}
                        onClick={() => setHideUnapproved(v => !v)}
                        className="w-full sm:w-auto min-w-[200px]"
                        title={hideUnapproved ? 'Include unapproved questions' : 'Exclude unapproved questions'}
                    >
                        {hideUnapproved ? <Eye size={18} /> : <EyeOff size={18} />}
                        {hideUnapproved ? 'Show Unapproved' : 'Hide Unapproved'}
                    </Button>
                )}
            </AdminFilterBar>

            <div className="mt-6 w-full">
                <LoadingOverlay isLoading={isFetching}>
                    <QuestionTable
                        questions={questions}
                        selectedIds={selectedIds}
                        onSelectionChange={toggleSelection}
                        showActions={true}
                        onQuestionUpdate={handleQuestionUpdate}
                        hideUnapproved={hideUnapproved}
                    />
                </LoadingOverlay>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12">
                {showApproveAction && (
                    <Button
                        onClick={handleApproveSelected}
                        disabled={selectedIds.length === 0 || isProcessing}
                        isLoading={isProcessing}
                        className="w-full sm:w-auto min-w-[240px]"
                    >
                        <Check className="w-5 h-5" /> Approve Selected ({selectedIds.length})
                    </Button>
                )}

                <Button
                    variant="outline"
                    disabled={selectedIds.length === 0 || isProcessing}
                    isLoading={isProcessing}
                    onClick={handleDeleteSelected}
                    className="w-full sm:w-auto min-w-[240px] border-2 border-secondary-400 text-secondary-600 hover:bg-secondary-100 dark:text-secondary-400 dark:hover:bg-secondary-900/20"
                >
                    <Trash2 className="w-5 h-5" /> Delete Selected ({selectedIds.length})
                </Button>
            </div>
        </div>
    );
};

export default QuestionManager;

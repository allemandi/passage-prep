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
import { Trash2, Check, Eye, EyeOff, RotateCcw } from 'lucide-react';
import AdminFilterBar from './AdminFilterBar';
import LoadingOverlay from '../ui/LoadingOverlay';
import useQuestionSelection from '../../hooks/useQuestionSelection';
import clsx from 'clsx';

/**
 * Unified component for managing questions (both review and edit modes).
 *
 * @param {string} title - Title for the filter bar
 * @param {boolean} showApproveAction - Whether to show the "Approve" button
 * @param {boolean} initialShowUnapproved - Default state for the "Show Unapproved" toggle
 */
const QuestionManager = ({
    title,
    showApproveAction = false,
    initialShowUnapproved = false
}) => {
    const [showUnapproved, setShowUnapproved] = useState(initialShowUnapproved);
    const [questions, setQuestions] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { selectedIds, toggleSelection, resetSelection } = useQuestionSelection();
    const showToast = useToast();

    // Store current filter values to re-apply after actions
    const currentFilters = useRef({ book: '', chapter: '', verseStart: '', verseEnd: '', themes: defaultThemes });

    const fetchFilteredData = useCallback(async (filters, isManualRefresh = false) => {
        if (filters !== undefined) {
            currentFilters.current = filters;
        }
        const activeFilters = currentFilters.current;

        if (isManualRefresh) {
            clearSearchCache();
        }

        setIsFetching(true);
        try {
            const themes = activeFilters?.themes || [];

            // Logic for isApproved:
            // 1. In Review Mode (showApproveAction = true):
            //    - isApproved: false (Always show pending only)
            // 2. In Edit Mode (showApproveAction = false):
            //    - If showUnapproved is true -> isApproved: undefined (Show All)
            //    - If showUnapproved is false -> isApproved: true (Show Approved Only)

            const isApprovedParam = showApproveAction
                ? false
                : (showUnapproved ? undefined : true);

            const apiFilter = {
                book: activeFilters?.book || undefined,
                chapter: activeFilters?.chapter || null,
                verseStart: activeFilters?.verseStart || null,
                verseEnd: activeFilters?.verseEnd || null,
                themeArr: (themes.length === defaultThemes.length || themes.length === 0) ? undefined : themes,
                isApproved: isApprovedParam,
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
    }, [showUnapproved, showApproveAction, showToast, resetSelection]);

    // Re-fetch when showUnapproved changes
    useEffect(() => {
        fetchFilteredData();
    }, [fetchFilteredData]);

    // Auto-refresh when the component is focused/visible or when tab changes (handled by parent typically, but we can detect visibility)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchFilteredData();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => fetchFilteredData(undefined, true)}
                        className="w-full sm:w-auto"
                        title="Refresh list"
                        disabled={isFetching}
                    >
                        <RotateCcw
                            size={18}
                            className={clsx(isFetching && "animate-spin text-primary-500")}
                        />
                        {isFetching ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    {!showApproveAction && (
                        <Button
                            type="button"
                            variant={showUnapproved ? 'secondary' : 'outline'}
                            onClick={() => setShowUnapproved(v => !v)}
                            className={clsx(
                                "w-full sm:w-auto min-w-[200px] transition-all duration-300",
                                showUnapproved && "ring-2 ring-secondary-500/50 border-secondary-500 shadow-md shadow-secondary-500/10"
                            )}
                            title={showUnapproved ? 'Hide unapproved questions from results' : 'Include unapproved questions in results'}
                        >
                            {showUnapproved ? <EyeOff size={18} /> : <Eye size={18} />}
                            {showUnapproved ? 'Hide Unapproved' : 'Show Unapproved'}
                        </Button>
                    )}
                </div>
            </AdminFilterBar>

            <div className="mt-6 w-full">
                <LoadingOverlay isLoading={isFetching}>
                    <QuestionTable
                        questions={questions}
                        selectedIds={selectedIds}
                        onSelectionChange={toggleSelection}
                        showActions={true}
                        onQuestionUpdate={handleQuestionUpdate}
                        showUnapproved={showUnapproved}
                        isReviewMode={showApproveAction}
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

import { useState, useCallback, useRef, useEffect, Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
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
import { Trash2, Check, RotateCcw, Clock, Database, AlertTriangle, X } from 'lucide-react';
import AdminFilterBar from './AdminFilterBar';
import LoadingOverlay from '../ui/LoadingOverlay';
import Checkbox from '../ui/Checkbox';
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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

            const apiFilter = {
                ...activeFilters,
                chapter: activeFilters?.chapter || null,
                verseStart: activeFilters?.verseStart || null,
                verseEnd: activeFilters?.verseEnd || null,
                themeArr: (themes.length === defaultThemes.length || themes.length === 0) ? undefined : themes,
                isApproved: showApproveAction ? false : (showUnapproved ? undefined : true),
            };
            delete apiFilter.themes;

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

    const confirmDeleteSelected = useCallback(async () => {
        if (selectedIds.length === 0) return;

        setIsProcessing(true);
        try {
            await deleteQuestions(selectedIds);
            showToast(`${selectedIds.length} question(s) deleted successfully`, 'success');
            clearSearchCache();
            setIsDeleteModalOpen(false);
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
            {/* Mode Banner */}
            <div className="mb-6 p-4 rounded-xl border border-app-border bg-app-surface shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                    <span className={clsx(
                        "p-2 rounded-lg text-white font-bold text-xs flex items-center justify-center",
                        showApproveAction ? "bg-amber-500 dark:bg-amber-600" : "bg-primary-600 dark:bg-primary-500"
                    )}>
                        {showApproveAction ? <Clock size={18} /> : <Database size={18} />}
                    </span>
                    <div>
                        <h2 className="text-base font-bold text-app-text">
                            {showApproveAction ? 'Pending Community Questions Review' : 'Question Database Management'}
                        </h2>
                        <p className="text-xs text-app-text-muted">
                            {showApproveAction
                                ? 'Review user-submitted questions and approve them into the shared collection.'
                                : 'Filter, edit, or remove questions currently in the study database.'}
                        </p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => fetchFilteredData(undefined, true)}
                    className="text-xs font-semibold px-3 py-1.5 min-h-[36px]"
                    title="Refresh list"
                    disabled={isFetching}
                >
                    <RotateCcw
                        size={14}
                        className={clsx(isFetching && "animate-spin text-primary-500")}
                    />
                    {isFetching ? 'Refreshing...' : 'Refresh Data'}
                </Button>
            </div>

            <AdminFilterBar
                title={title}
                onApply={handleApplyFilters}
            >
                {!showApproveAction && (
                    <Checkbox
                        id="show-unapproved-admin"
                        label="Include Unapproved Questions"
                        checked={showUnapproved}
                        onChange={setShowUnapproved}
                        className="min-w-[180px]"
                    />
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
                        isReviewMode={showApproveAction}
                    />
                </LoadingOverlay>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6 mt-8">
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
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="w-full sm:w-auto min-w-[240px] border-2 border-secondary-400 text-secondary-600 hover:bg-secondary-100 dark:text-secondary-400 dark:hover:bg-secondary-900/20"
                >
                    <Trash2 className="w-5 h-5" /> Delete Selected ({selectedIds.length})
                </Button>
            </div>

            {/* Permanent Deletion Confirmation Modal */}
            <Transition show={isDeleteModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsDeleteModalOpen(false)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-app-surface border-2 border-app-border p-0 text-left align-middle shadow-2xl transition-all">
                                    <div className="p-6 border-b border-app-border flex justify-between items-center bg-rose-50/50 dark:bg-rose-950/20">
                                        <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                                            <AlertTriangle size={24} />
                                            <DialogTitle as="h3" className="text-xl font-bold">
                                                Confirm Deletion
                                            </DialogTitle>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsDeleteModalOpen(false)}
                                            className="text-app-text-muted hover:text-app-text p-1.5 rounded-full transition-colors"
                                            aria-label="Close modal"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-3">
                                        <p className="text-base font-bold text-app-text leading-snug">
                                            Are you sure you want to permanently delete {selectedIds.length} {selectedIds.length === 1 ? 'question' : 'questions'}?
                                        </p>
                                        <p className="text-sm text-app-text-muted leading-relaxed">
                                            This action will remove the selected questions from the shared database. This action cannot be undone.
                                        </p>
                                    </div>

                                    <div className="p-6 bg-app-bg/50 border-t border-app-border flex flex-col sm:flex-row justify-end gap-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setIsDeleteModalOpen(false)}
                                            disabled={isProcessing}
                                            className="w-full sm:w-auto"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={confirmDeleteSelected}
                                            isLoading={isProcessing}
                                            loadingText="Deleting..."
                                            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold"
                                        >
                                            <Trash2 size={18} />
                                            Permanently Delete
                                        </Button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default QuestionManager;

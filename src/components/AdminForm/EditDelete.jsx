import { useState, useCallback, useRef } from 'react';
import QuestionTable from '../QuestionTable';
import { useToast } from '../ToastMessage/Toast';
import { searchQuestions, clearSearchCache, deleteQuestions, updateQuestion } from '../../services/dataService';
import { defaultThemes } from '../ui/ThemeSelect';
import Button from '../ui/Button';
import { Trash2 } from 'lucide-react';
import AdminFilterBar from './AdminFilterBar';
import LoadingOverlay from '../ui/LoadingOverlay';
import useQuestionSelection from '../../hooks/useQuestionSelection';

const EditDelete = () => {
    const [hideUnapproved, setHideUnapproved] = useState(false);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { selectedIds, toggleSelection, resetSelection } = useQuestionSelection();
    const showToast = useToast();

    // Store current filter values to re-apply after actions
    const currentFilters = useRef({ book: '', chapter: '', verseStart: '', verseEnd: '', themes: defaultThemes });

    const applyApiFilters = useCallback(async (filters) => {
        currentFilters.current = filters;

        setIsFetching(true);
        try {
            const apiFilter = {
                book: filters.book || undefined,
                chapter: filters.chapter || null,
                verseStart: filters.verseStart || null,
                verseEnd: filters.verseEnd || null,
                themeArr: filters.themes.length !== defaultThemes.length ? filters.themes : undefined,
                isApproved: hideUnapproved ? true : undefined,
            };

            const results = await searchQuestions(apiFilter);
            setFilteredQuestions(results);
            resetSelection();
        } catch (error) {
            showToast(error.message, 'error');
            setFilteredQuestions([]);
        } finally {
            setIsFetching(false);
        }
    }, [hideUnapproved, showToast, resetSelection]);

    const refreshResults = useCallback(() => {
        applyApiFilters({ ...currentFilters.current });
    }, [applyApiFilters]);

    const handleDeleteSelected = useCallback(async () => {
        if (selectedIds.length === 0) return;

        setIsProcessing(true);
        try {
            await deleteQuestions(selectedIds);
            showToast('Questions deleted successfully', 'success');
            clearSearchCache();
            await refreshResults();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsProcessing(false);
        }
    }, [selectedIds, refreshResults, showToast]);

    const handleQuestionUpdate = useCallback(async (questionId, updatedData) => {
        try {
            await updateQuestion(questionId, updatedData);
            showToast('Question updated successfully', 'success');
            clearSearchCache();
            await refreshResults();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }, [refreshResults, showToast]);

    return (
        <div className="mb-10 w-full">
            <AdminFilterBar
                title="Filter for Editing/Deleting Questions"
                onApply={applyApiFilters}
            >
                <Button
                    variant={hideUnapproved ? 'secondary' : 'outline'}
                    onClick={() => setHideUnapproved(v => !v)}
                    className="w-full sm:w-auto min-w-[200px]"
                >
                    {hideUnapproved ? 'Show Unapproved' : 'Hide Unapproved'}
                </Button>
            </AdminFilterBar>

            <div className="mt-6 w-full">
                <LoadingOverlay isLoading={isFetching}>
                    <QuestionTable
                        questions={filteredQuestions}
                        selectedIds={selectedIds}
                        onSelectionChange={toggleSelection}
                        showActions={true}
                        onQuestionUpdate={handleQuestionUpdate}
                        hideUnapproved={hideUnapproved}
                    />
                </LoadingOverlay>
            </div>

            <div className="flex justify-center mt-12">
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

export default EditDelete;

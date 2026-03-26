import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Trash2 } from 'lucide-react';
import QuestionTable from '../QuestionTable';
import LoadingOverlay from '../ui/LoadingOverlay';
import { fetchUnapprovedQuestions, approveQuestions, deleteQuestions, updateQuestion } from '../../services/dataService';
import { useToast } from '../ToastMessage/Toast';
import { defaultThemes } from '../ui/ThemeSelect';
import { filterQuestions } from '../../utils/bibleData';
import Button from '../ui/Button';
import AdminFilterBar from './AdminFilterBar';
import useQuestionSelection from '../../hooks/useQuestionSelection';

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

    const applyApiFilters = useCallback((filters, sourceData = allUnapprovedQuestions) => {
        currentFilters.current = filters;
        const filtered = filterQuestions(sourceData, filters, defaultThemes);
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

            <div className="mt-6">
                <LoadingOverlay isLoading={isFetching}>
                    <QuestionTable
                        questions={filteredQuestions}
                        selectedIds={selectedIds}
                        onSelectionChange={toggleSelection}
                        showActions={true}
                        onQuestionUpdate={handleQuestionUpdate}
                    />
                </LoadingOverlay>
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

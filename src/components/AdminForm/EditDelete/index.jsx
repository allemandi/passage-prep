import { useState, useCallback, useRef } from 'react';
import QuestionTable from '../../QuestionTable';
import { useToast } from '../../ToastMessage/Toast';
import { searchQuestions, clearSearchCache } from '../../../services/dataService';
import { defaultThemes } from '../../ui/ThemeSelect';
import Button from '../../ui/Button';
import { Trash2 } from 'lucide-react';
import AdminFilterBar from '../AdminFilterBar';

const EditDelete = () => {
    const [hideUnapproved, setHideUnapproved] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const showToast = useToast();

    // Store current filter values to re-apply after actions
    const currentFilters = useRef({ book: '', chapter: '', verseStart: '', verseEnd: '', themes: defaultThemes });

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

    const applyApiFilters = useCallback(async ({ book, chapter, verseStart, verseEnd, themes }) => {
        currentFilters.current = { book, chapter, verseStart, verseEnd, themes };

        try {
            const filter = {};
            if (book) filter.book = book;
            filter.chapter = chapter || null;
            filter.verseStart = verseStart || null;
            filter.verseEnd = verseEnd || null;
            if (themes.length !== defaultThemes.length) {
                filter.themeArr = themes;
            }
            if (hideUnapproved) {
                filter.isApproved = true;
            }
            const results = await searchQuestions(filter);
            setFilteredQuestions(results);
            setSelectedQuestions([]);
        } catch (error) {
            showToast(error.message, 'error');
            setFilteredQuestions([]);
        }
    }, [hideUnapproved, showToast]);

    const refreshResults = useCallback(() => {
        applyApiFilters({ ...currentFilters.current });
    }, [applyApiFilters]);

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
            showToast('Questions deleted successfully', 'success');
            clearSearchCache();
        } catch (error) {
            showToast(error.message, 'error');
            refreshResults();
        }
    }, [selectedQuestions, filteredQuestions, refreshResults, showToast]);

    const handleQuestionUpdate = useCallback(async (questionId, updatedData) => {
        try {
            const response = await fetch('/api/update-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId, updatedData }),
            });
            if (!response.ok) throw new Error('Failed to update question');
            setFilteredQuestions(prev =>
                prev.map(q => q._id === questionId ? { ...q, ...updatedData } : q)
            );
            showToast('Question updated successfully', 'success');
            clearSearchCache();
        } catch (error) {
            showToast(error.message, 'error');
            refreshResults();
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
                <QuestionTable
                    questions={filteredQuestions}
                    selectedQuestions={selectedQuestions}
                    onQuestionSelect={handleQuestionSelect}
                    showActions={true}
                    onQuestionUpdate={handleQuestionUpdate}
                    hideUnapproved={hideUnapproved}
                />
            </div>

            <div className="flex justify-center mt-12">
                <Button
                    variant="outline"
                    disabled={selectedQuestions.length === 0}
                    onClick={handleDeleteSelected}
                    className="w-full sm:w-auto min-w-[240px] border-2 border-secondary-400 text-secondary-600 hover:bg-secondary-100 dark:text-secondary-400 dark:hover:bg-secondary-900/20"
                >
                    <Trash2 className="w-5 h-5" /> Delete Selected ({selectedQuestions.length})
                </Button>
            </div>
        </div>
    );
};

export default EditDelete;
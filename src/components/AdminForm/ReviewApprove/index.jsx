import { useState, useEffect, useCallback } from 'react';
import { Check, Trash2 } from 'lucide-react';
import QuestionTable from '../../QuestionTable';
import { fetchUnapprovedQuestions, approveQuestions } from '../../../services/dataService';
import { useToast } from '../../ToastMessage/Toast';
import { defaultThemes } from '../../ui/ThemeSelect';
import Button from '../../ui/Button';
import AdminFilterBar from '../AdminFilterBar';

const ReviewApprove = () => {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [allUnapprovedQuestions, setAllUnapprovedQuestions] = useState([]);
    const showToast = useToast();

    // Store current filter values to re-apply after actions
    const currentFilters = useRef({ book: '', chapter: '', verseStart: '', verseEnd: '', themes: defaultThemes });

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

    const applyApiFilters = useCallback(({ book, chapter, verseStart, verseEnd, themes }) => {
        currentFilters.current = { book, chapter, verseStart, verseEnd, themes };
        let filtered = [...allUnapprovedQuestions];

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
        setSelectedQuestions([]);
    }, [allUnapprovedQuestions]);

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
            setAllUnapprovedQuestions(prev => prev.filter(q => !questionIds.includes(q._id)));
            showToast('Questions deleted successfully', 'success');
            setTimeout(() => {
                fetchUnapprovedData();
                refreshResults();
            }, 500);
        } catch (error) {
            showToast(error.message, 'error');
            fetchUnapprovedData();
        }
    }, [selectedQuestions, filteredQuestions, fetchUnapprovedData, refreshResults, showToast]);

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
            setTimeout(() => {
                fetchUnapprovedData();
                refreshResults();
            }, 500);
        } catch (error) {
            showToast(error.message, 'error');
            fetchUnapprovedData();
        }
    }, [fetchUnapprovedData, refreshResults, showToast]);

    const handleApproveSelected = useCallback(async () => {
        if (selectedQuestions.length === 0) return;

        try {
            const questionIds = selectedQuestions.map(index => filteredQuestions[index]._id);
            setSelectedQuestions([]);

            await approveQuestions(questionIds);
            setFilteredQuestions(prev => prev.filter(q => !questionIds.includes(q._id)));
            setAllUnapprovedQuestions(prev => prev.filter(q => !questionIds.includes(q._id)));

            showToast('Questions approved successfully', 'success');
            setTimeout(() => {
                fetchUnapprovedData();
                refreshResults();
            }, 500);
        } catch (error) {
            showToast(error.message, 'error');
            fetchUnapprovedData();
        }
    }, [selectedQuestions, filteredQuestions, fetchUnapprovedData, refreshResults, showToast]);

    return (
        <div className="w-full mb-10">
            <AdminFilterBar
                title="Filter for Reviewing/Approving Questions"
                onApply={applyApiFilters}
            />

            <div className="mt-6">
                <QuestionTable
                    questions={filteredQuestions}
                    selectedQuestions={selectedQuestions}
                    onQuestionSelect={handleQuestionSelect}
                    showActions={true}
                    onQuestionUpdate={handleQuestionUpdate}
                />
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12">
                <Button
                    onClick={handleApproveSelected}
                    disabled={selectedQuestions.length === 0}
                    className="w-full sm:w-auto min-w-[240px]"
                >
                    <Check className="w-5 h-5" /> Approve Selected ({selectedQuestions.length})
                </Button>
                <Button
                    onClick={handleDeleteSelected}
                    disabled={selectedQuestions.length === 0}
                    variant="outline"
                    className="w-full sm:w-auto min-w-[240px] border-2 border-secondary-400 text-secondary-600 hover:bg-secondary-50 dark:text-secondary-400 dark:hover:bg-secondary-900/20"
                >
                    <Trash2 className="w-5 h-5" /> Delete Selected ({selectedQuestions.length})
                </Button>
            </div>
        </div>
    );
};

export default ReviewApprove;
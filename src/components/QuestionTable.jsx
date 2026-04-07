import React, { useState, useMemo } from 'react';
import { Search, MessageSquarePlus, CheckCircle2, Pen } from 'lucide-react';
import clsx from 'clsx';
import { getSortedQuestions, formatReference } from '../utils/bibleData';
import EditQuestionModal from './EditQuestionModal';
import Button from './ui/Button';

const EmptyState = ({ setTabValue, isReviewMode }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border-dashed border-4 border-app-border bg-app-bg/30 rounded-3xl">
        <div className="p-5 bg-secondary-50 dark:bg-secondary-900/20 rounded-full mb-8">
            {isReviewMode ? (
                <CheckCircle2 size={56} className="text-primary-400" />
            ) : (
                <Search size={56} className="text-secondary-400" />
            )}
        </div>
        <h3 className="text-2xl font-bold text-app-text mb-3">
            {isReviewMode ? 'All Caught Up!' : 'No questions found'}
        </h3>
        <p className="text-app-text-muted mb-10 max-w-md text-lg leading-relaxed">
            {isReviewMode
                ? 'There are currently no new questions waiting for review. Great job!'
                : "We couldn't find any questions matching your current filters. You can try adjusting your search or contribute a new question."
            }
        </p>
        {!isReviewMode && (
            <Button
                onClick={() => setTabValue?.(1)}
                variant="outline"
                className="flex items-center gap-3 px-8 py-3 text-lg font-bold"
            >
                <MessageSquarePlus size={24} />
                Contribute a Question
            </Button>
        )}
    </div>
);

const QuestionTable = ({
    questions = [],
    selectedIds = [],
    onSelectionChange,
    showActions,
    onQuestionUpdate,
    hideEditActions = false,
    isReviewMode = false,
    setTabValue
}) => {
    const [editingQuestion, setEditingQuestion] = useState(null);

    // Sort questions based on Bible order
    const sortedQuestions = useMemo(() => {
        return getSortedQuestions(questions);
    }, [questions]);

    // Check if all questions are selected
    const allSelected = useMemo(() => {
        return sortedQuestions.length > 0 &&
        sortedQuestions.every(q => selectedIds.includes(q._id));
    }, [sortedQuestions, selectedIds]);

    const someSelected = useMemo(() => {
        return sortedQuestions.some(q => selectedIds.includes(q._id)) &&
        !allSelected;
    }, [sortedQuestions, selectedIds, allSelected]);

    if (sortedQuestions.length === 0) {
        return <EmptyState isReviewMode={isReviewMode} setTabValue={setTabValue} />;
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 mb-2 px-1">
                <div className="text-sm font-medium text-app-text-muted" aria-live="polite">
                    {sortedQuestions.length} {sortedQuestions.length === 1 ? 'question' : 'questions'} found.
                    {selectedIds.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full text-xs font-bold">
                            {selectedIds.length} selected
                        </span>
                    )}
                </div>
                {selectedIds.length > 0 && (
                    <button
                        onClick={() => onSelectionChange(sortedQuestions.map(q => q._id), false)}
                        className="text-xs font-bold text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300 transition-colors"
                    >
                        Clear Selection
                    </button>
                )}
            </div>

            <div className="max-h-[400px] overflow-auto border-2 border-app-border rounded-xl bg-app-bg/30 shadow-inner">
                <table className="min-w-full table-auto border-collapse">
                    <thead className="sticky top-0 bg-app-surface border-b-2 border-app-border z-10">
                        <tr>
                            {showActions && (
                                <th scope="col" className="p-4 border-b border-app-border text-left">
                                    <input
                                        type="checkbox"
                                        aria-label="Select all questions"
                                        className="cursor-pointer accent-primary-500 w-4 h-4 rounded focus:ring-primary-500 focus:ring-offset-2"
                                        checked={allSelected}
                                        ref={(input) => {
                                            if (input) input.indeterminate = someSelected;
                                        }}
                                        onChange={(e) => {
                                            const ids = sortedQuestions.map(q => q._id);
                                            onSelectionChange(ids, e.target.checked);
                                        }}
                                    />
                                </th>
                            )}
                            <th scope="col" className="p-4 border-b border-app-border text-left text-app-text font-semibold text-sm">
                                Bible Passage
                            </th>
                            <th scope="col" className="p-4 border-b border-app-border text-left text-app-text font-semibold text-sm">
                                Theme
                            </th>
                            <th scope="col" className="p-4 border-b border-app-border text-left text-app-text font-semibold text-sm">
                                Question
                            </th>
                            {showActions && !hideEditActions && (
                                <th scope="col" className="p-4 border-b border-app-border text-left text-app-text font-semibold text-sm">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border bg-app-surface/40">
                        {sortedQuestions.map((question) => {
                            const isSelected = selectedIds.includes(question._id);
                            const reference = formatReference(
                                question.book,
                                question.chapter,
                                question.verseStart,
                                question.verseEnd
                            );

                            return (
                                <tr
                                    key={question._id}
                                    className={clsx(
                                        "transition-colors duration-150",
                                        isSelected
                                            ? "bg-primary-50/50 dark:bg-primary-900/20"
                                            : "hover:bg-primary-50/30 dark:hover:bg-primary-900/10"
                                    )}
                                >
                                    {showActions && (
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                aria-label={`Select question for ${reference}: ${question.question}`}
                                                className="cursor-pointer accent-primary-500 w-4 h-4 rounded focus:ring-primary-500 focus:ring-offset-2"
                                                checked={isSelected}
                                                onChange={(e) => onSelectionChange([question._id], e.target.checked)}
                                            />
                                        </td>
                                    )}
                                    <th scope="row" className="p-4 text-sm text-app-text whitespace-nowrap text-left font-semibold">{reference}</th>
                                    <td className="p-4 text-sm text-app-text font-medium text-primary-600 dark:text-primary-400">{question.theme}</td>
                                    <td className="p-4 text-sm text-app-text leading-relaxed">{question.question}</td>
                                    {showActions && !hideEditActions && (
                                        <td className="p-4">
                                            <button
                                                onClick={() => setEditingQuestion(question)}
                                                aria-label="Edit question"
                                                className="text-primary-500 hover:text-primary-700 transition-colors p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                                            >
                                                <Pen size={18} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>


            {editingQuestion && (
                <EditQuestionModal
                    isOpen={!!editingQuestion}
                    onClose={() => setEditingQuestion(null)}
                    question={editingQuestion}
                    onSave={onQuestionUpdate}
                />
            )}
        </>
    );
};

export default QuestionTable;

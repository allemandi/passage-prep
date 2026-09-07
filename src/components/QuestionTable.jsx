import React, { useState, useMemo } from 'react';
import { Search, MessageSquarePlus, CheckCircle2, Pen, RotateCcw, CheckSquare, Square } from 'lucide-react';
import clsx from 'clsx';
import { getSortedQuestions, formatReference } from '../utils/bibleData';
import EditQuestionModal from './EditQuestionModal';
import Button from './ui/Button';
import Checkbox from './ui/Checkbox';

const EmptyState = ({ setTabValue, isReviewMode }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border-dashed border-4 border-app-border bg-app-bg/40 rounded-3xl">
        <div className="p-6 bg-secondary-100 dark:bg-secondary-900/30 rounded-full mb-6 text-secondary-600 dark:text-secondary-300">
            {isReviewMode ? (
                <CheckCircle2 size={64} className="text-primary-600 dark:text-primary-400" />
            ) : (
                <Search size={64} className="text-secondary-500 dark:text-secondary-400" />
            )}
        </div>
        <h3 className="text-2xl font-bold text-app-text mb-3">
            {isReviewMode ? 'All Caught Up!' : 'No questions found'}
        </h3>
        <p className="text-app-text-muted mb-8 max-w-lg text-lg leading-relaxed font-medium">
            {isReviewMode
                ? 'There are currently no new questions waiting for review. Great job!'
                : "We couldn't find any questions matching your selected filters. Try choosing a different book or theme, or contribute a question yourself!"
            }
        </p>
        {!isReviewMode && (
            <Button
                onClick={() => setTabValue?.(1)}
                variant="outline"
                className="flex items-center gap-3 px-8 py-3.5 text-lg font-bold"
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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 px-1">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="text-base font-medium text-app-text-muted whitespace-nowrap" aria-live="polite">
                        Found <span className="font-bold text-app-text text-lg">{sortedQuestions.length}</span> {sortedQuestions.length === 1 ? 'question' : 'questions'}.
                        {selectedIds.length > 0 && (
                            <span className="ml-3 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 rounded-lg text-sm font-bold border border-primary-300 dark:border-primary-700">
                                {selectedIds.length} selected
                            </span>
                        )}
                    </div>

                    {showActions && sortedQuestions.length > 0 && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => onSelectionChange(sortedQuestions.map(q => q._id), true)}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-lg bg-primary-100 text-primary-800 hover:bg-primary-200 dark:bg-primary-900/40 dark:text-primary-200 dark:hover:bg-primary-900/60 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30 min-h-[40px]"
                                title="Select all questions"
                            >
                                <CheckSquare size={16} />
                                Select All
                            </button>
                            <button
                                type="button"
                                onClick={() => onSelectionChange(sortedQuestions.map(q => q._id), false)}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-lg bg-secondary-100 text-secondary-800 hover:bg-secondary-200 dark:bg-secondary-900/40 dark:text-secondary-200 dark:hover:bg-secondary-900/60 transition-all focus:outline-none focus:ring-2 focus:ring-secondary-500/30 min-h-[40px]"
                                title="Deselect all questions"
                            >
                                <Square size={16} />
                                Deselect All
                            </button>
                        </div>
                    )}
                </div>

                {selectedIds.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onSelectionChange(sortedQuestions.map(q => q._id), false)}
                        className="text-sm font-bold text-secondary-700 hover:text-white dark:text-secondary-300 hover:bg-secondary-600 px-3.5 py-2 rounded-lg border-2 border-secondary-300 dark:border-secondary-700 transition-all flex items-center gap-2 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-secondary-500/30"
                    >
                        <RotateCcw size={16} />
                        Clear Selection
                    </button>
                )}
            </div>

            <div className="max-h-[480px] overflow-auto border-2 border-app-border rounded-2xl bg-app-bg/50 shadow-inner">
                <table className="min-w-full table-auto border-collapse text-left">
                    <caption className="sr-only">Bible study questions matching your criteria</caption>
                    <thead className="sticky top-0 bg-app-surface border-b-2 border-app-border z-10">
                        <tr>
                            {showActions && (
                                <th scope="col" className="p-4 border-b border-app-border text-left w-14">
                                    <Checkbox
                                        id="select-all-checkbox"
                                        aria-label="Select all questions"
                                        checked={allSelected}
                                        ref={(input) => {
                                            if (input) input.indeterminate = someSelected;
                                        }}
                                        onChange={(checked) => {
                                            const ids = sortedQuestions.map(q => q._id);
                                            onSelectionChange(ids, checked);
                                        }}
                                    />
                                </th>
                            )}
                            <th scope="col" className="p-4 border-b border-app-border text-left text-app-text font-bold text-base min-w-[160px]">
                                Passage
                            </th>
                            <th scope="col" className="p-4 border-b border-app-border text-left text-app-text font-bold text-base min-w-[140px]">
                                Theme
                            </th>
                            <th scope="col" className="p-4 border-b border-app-border text-left text-app-text font-bold text-base">
                                Question
                            </th>
                            {showActions && !hideEditActions && (
                                <th scope="col" className="p-4 border-b border-app-border text-left text-app-text font-bold text-base w-20">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-app-border bg-app-surface">
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
                                    onClick={(e) => {
                                        // Don't toggle if clicking on a button or checkbox
                                        if (e.target.closest('button') || e.target.closest('input[type="checkbox"]')) return;
                                        onSelectionChange([question._id], !isSelected);
                                    }}
                                    className={clsx(
                                        "transition-colors duration-150 cursor-pointer select-none min-h-[56px]",
                                        isSelected
                                            ? "bg-primary-100/70 dark:bg-primary-900/40"
                                            : "hover:bg-primary-50/50 dark:hover:bg-primary-900/20"
                                    )}
                                >
                                    {showActions && (
                                        <td className="p-4">
                                            <Checkbox
                                                id={`select-${question._id}`}
                                                aria-label={`Select question for ${reference}: ${question.question}`}
                                                checked={isSelected}
                                                onChange={(checked) => onSelectionChange([question._id], checked)}
                                            />
                                        </td>
                                    )}
                                    <th scope="row" className="p-4 text-base text-app-text whitespace-nowrap text-left font-bold">
                                        <span className="px-2.5 py-1 bg-app-bg rounded-lg border border-app-border inline-block">
                                            {reference}
                                        </span>
                                    </th>
                                    <td className="p-4 text-base text-primary-700 dark:text-primary-300 font-bold whitespace-nowrap">
                                        {question.theme}
                                    </td>
                                    <td className="p-4 text-base text-app-text leading-relaxed font-medium">
                                        {question.question}
                                    </td>
                                    {showActions && !hideEditActions && (
                                        <td className="p-4">
                                            <button
                                                type="button"
                                                onClick={() => setEditingQuestion(question)}
                                                aria-label="Edit question"
                                                className="text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100 p-2.5 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                            >
                                                <Pen size={20} />
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

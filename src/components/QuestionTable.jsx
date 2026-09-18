import React, { useState, useMemo } from 'react';
import { Search, MessageSquarePlus, CheckCircle2, Pen, RotateCcw, CheckSquare, Square } from 'lucide-react';
import clsx from 'clsx';
import { getSortedQuestions, formatReference } from '../utils/bibleData';
import EditQuestionModal from './EditQuestionModal';
import Button from './ui/Button';
import Checkbox from './ui/Checkbox';

const EmptyState = ({ setTabValue, isReviewMode }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:py-16 sm:px-6 text-center border-dashed border-2 sm:border-4 border-app-border bg-app-bg/40 rounded-2xl sm:rounded-3xl">
        <div className="p-4 sm:p-6 bg-secondary-100 dark:bg-secondary-900/30 rounded-full mb-4 sm:mb-6 text-secondary-600 dark:text-secondary-300">
            {isReviewMode ? (
                <CheckCircle2 size={48} className="sm:w-16 sm:h-16 text-primary-600 dark:text-primary-400" />
            ) : (
                <Search size={48} className="sm:w-16 sm:h-16 text-secondary-500 dark:text-secondary-400" />
            )}
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-app-text mb-2 sm:mb-3">
            {isReviewMode ? 'All Caught Up!' : 'No questions found'}
        </h3>
        <p className="text-app-text-muted mb-6 sm:mb-8 max-w-lg text-sm sm:text-lg leading-relaxed font-medium">
            {isReviewMode
                ? 'There are currently no new questions waiting for review. Great job!'
                : "We couldn't find any questions matching your selected filters. Try choosing a different book or theme, or contribute a question yourself!"
            }
        </p>
        {!isReviewMode && (
            <Button
                onClick={() => setTabValue?.(1)}
                variant="outline"
                className="flex items-center gap-2.5 px-6 py-3 text-base sm:text-lg font-bold"
            >
                <MessageSquarePlus size={20} className="sm:w-6 sm:h-6" />
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
            {/* Top Toolbar / Action Header */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-3 px-1">
                <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 w-full sm:w-auto">
                    <div className="text-sm sm:text-base font-medium text-app-text-muted" aria-live="polite">
                        Found <span className="font-bold text-app-text">{sortedQuestions.length}</span> {sortedQuestions.length === 1 ? 'question' : 'questions'}.
                        {selectedIds.length > 0 && (
                            <span className="ml-2 px-2.5 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 rounded-md text-xs sm:text-sm font-bold border border-primary-300 dark:border-primary-700 inline-block">
                                {selectedIds.length} selected
                            </span>
                        )}
                    </div>

                    {showActions && sortedQuestions.length > 0 && (
                        <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                            <button
                                type="button"
                                onClick={() => onSelectionChange(sortedQuestions.map(q => q._id), true)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg bg-primary-100 text-primary-800 hover:bg-primary-200 dark:bg-primary-900/40 dark:text-primary-200 dark:hover:bg-primary-900/60 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30 min-h-[36px]"
                                title="Select all questions"
                            >
                                <CheckSquare size={15} />
                                <span>Select All</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onSelectionChange(sortedQuestions.map(q => q._id), false)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg bg-secondary-100 text-secondary-800 hover:bg-secondary-200 dark:bg-secondary-900/40 dark:text-secondary-200 dark:hover:bg-secondary-900/60 transition-all focus:outline-none focus:ring-2 focus:ring-secondary-500/30 min-h-[36px]"
                                title="Deselect all questions"
                            >
                                <Square size={15} />
                                <span>Deselect All</span>
                            </button>
                        </div>
                    )}
                </div>

                {selectedIds.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onSelectionChange(sortedQuestions.map(q => q._id), false)}
                        className="text-xs sm:text-sm font-bold text-secondary-700 hover:text-white dark:text-secondary-300 hover:bg-secondary-600 px-3 py-1.5 rounded-lg border border-secondary-300 dark:border-secondary-700 transition-all flex items-center justify-center gap-1.5 min-h-[36px] focus:outline-none focus:ring-2 focus:ring-secondary-500/30"
                    >
                        <RotateCcw size={15} />
                        Clear Selection
                    </button>
                )}
            </div>

            {/* Container for Cards (Mobile) / Table (Desktop) */}
            <div className="max-h-[480px] overflow-y-auto border border-app-border rounded-xl sm:rounded-2xl bg-app-bg/40 shadow-inner">
                {/* Mobile View: Compact Cards (< md breakpoint) */}
                <div className="block md:hidden divide-y divide-app-border bg-app-surface">
                    {sortedQuestions.map((question) => {
                        const isSelected = selectedIds.includes(question._id);
                        const reference = formatReference(
                            question.book,
                            question.chapter,
                            question.verseStart,
                            question.verseEnd
                        );

                        return (
                            <div
                                key={question._id}
                                onClick={(e) => {
                                    if (e.target.closest('button') || e.target.closest('input[type="checkbox"]')) return;
                                    onSelectionChange([question._id], !isSelected);
                                }}
                                className={clsx(
                                    "p-3.5 flex flex-col gap-2.5 transition-colors cursor-pointer select-none",
                                    isSelected
                                        ? "bg-primary-100/70 dark:bg-primary-900/40"
                                        : "hover:bg-primary-50/50 dark:hover:bg-primary-900/20"
                                )}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        {showActions && (
                                            <div className="flex-shrink-0">
                                                <Checkbox
                                                    id={`select-mob-${question._id}`}
                                                    aria-label={`Select question for ${reference}: ${question.question}`}
                                                    checked={isSelected}
                                                    onChange={(checked) => onSelectionChange([question._id], checked)}
                                                />
                                            </div>
                                        )}
                                        {reference && (
                                            <span className="px-2 py-0.5 bg-app-bg rounded-md border border-app-border font-bold text-xs sm:text-sm text-app-text truncate">
                                                {reference}
                                            </span>
                                        )}
                                        {question.theme && (
                                            <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 rounded-md font-semibold text-xs truncate">
                                                {question.theme}
                                            </span>
                                        )}
                                    </div>

                                    {showActions && !hideEditActions && (
                                        <button
                                            type="button"
                                            onClick={() => setEditingQuestion(question)}
                                            aria-label="Edit question"
                                            className="text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100 p-1.5 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg transition-colors flex-shrink-0"
                                        >
                                            <Pen size={16} />
                                        </button>
                                    )}
                                </div>

                                <p className="text-sm text-app-text leading-snug font-medium pl-0.5">
                                    {question.question}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Desktop / Tablet View: Classic Table (>= md breakpoint) */}
                <table className="hidden md:table min-w-full table-auto border-collapse text-left">
                    <caption className="sr-only">Bible study questions matching your criteria</caption>
                    <thead className="sticky top-0 bg-app-surface border-b border-app-border z-10">
                        <tr>
                            {showActions && (
                                <th scope="col" className="p-3 border-b border-app-border text-left w-12">
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
                            <th scope="col" className="p-3 border-b border-app-border text-left text-app-text font-bold text-sm min-w-[140px]">
                                Passage
                            </th>
                            <th scope="col" className="p-3 border-b border-app-border text-left text-app-text font-bold text-sm min-w-[130px]">
                                Theme
                            </th>
                            <th scope="col" className="p-3 border-b border-app-border text-left text-app-text font-bold text-sm">
                                Question
                            </th>
                            {showActions && !hideEditActions && (
                                <th scope="col" className="p-3 border-b border-app-border text-left text-app-text font-bold text-sm w-16">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border bg-app-surface">
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
                                        "transition-colors duration-150 cursor-pointer select-none",
                                        isSelected
                                            ? "bg-primary-100/70 dark:bg-primary-900/40"
                                            : "hover:bg-primary-50/50 dark:hover:bg-primary-900/20"
                                    )}
                                >
                                    {showActions && (
                                        <td className="p-3">
                                            <Checkbox
                                                id={`select-${question._id}`}
                                                aria-label={`Select question for ${reference}: ${question.question}`}
                                                checked={isSelected}
                                                onChange={(checked) => onSelectionChange([question._id], checked)}
                                            />
                                        </td>
                                    )}
                                    <th scope="row" className="p-3 text-sm text-app-text whitespace-nowrap text-left font-bold">
                                        <span className="px-2 py-0.5 bg-app-bg rounded-md border border-app-border inline-block">
                                            {reference}
                                        </span>
                                    </th>
                                    <td className="p-3 text-sm text-primary-700 dark:text-primary-300 font-bold whitespace-nowrap">
                                        {question.theme}
                                    </td>
                                    <td className="p-3 text-sm sm:text-base text-app-text leading-relaxed font-medium">
                                        {question.question}
                                    </td>
                                    {showActions && !hideEditActions && (
                                        <td className="p-3">
                                            <button
                                                type="button"
                                                onClick={() => setEditingQuestion(question)}
                                                aria-label="Edit question"
                                                className="text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100 p-2 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
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

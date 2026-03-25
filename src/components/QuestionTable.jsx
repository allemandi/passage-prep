import React, { useState, useMemo } from 'react';
import { Edit2 } from 'lucide-react';
import { getSortedQuestions } from '../utils/bibleData';
import EditQuestionModal from './EditQuestionModal';

const QuestionTable = ({
    questions = [],
    selectedIds = [],
    onSelectionChange,
    showActions,
    onQuestionUpdate,
    hideUnapproved = false,
    hideEditActions = false,
}) => {
    const [editingQuestion, setEditingQuestion] = useState(null);

    // Filter unapproved questions if necessary
    const filteredQuestions = useMemo(() => {
        return hideUnapproved ? questions.filter((q) => q.isApproved !== false) : questions;
    }, [questions, hideUnapproved]);

    // Sort questions based on Bible order
    const sortedQuestions = useMemo(() => {
        return getSortedQuestions(filteredQuestions);
    }, [filteredQuestions]);

    // Check if all filtered questions are selected
    const allSelected = useMemo(() => {
        return sortedQuestions.length > 0 &&
        sortedQuestions.every(q => selectedIds.includes(q._id));
    }, [sortedQuestions, selectedIds]);

    const someSelected = useMemo(() => {
        return sortedQuestions.some(q => selectedIds.includes(q._id)) &&
        !allSelected;
    }, [sortedQuestions, selectedIds, allSelected]);

    return (
        <>
            <div className="mt-4 max-h-[400px] overflow-auto border border-app-border rounded-lg bg-app-bg/50">
                <table className="min-w-full table-auto border-collapse">
                    <thead className="sticky top-0 bg-app-surface border-b border-app-border">
                        <tr>
                            {showActions && (
                                <th scope="col" className="p-3 border-b border-app-border text-left">
                                    <input
                                        type="checkbox"
                                        aria-label="Select all questions"
                                        className="cursor-pointer accent-primary-500 w-4 h-4"
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
                            <th scope="col" className="p-3 border-b border-app-border text-left text-app-text font-semibold text-sm">
                                Bible Passage
                            </th>
                            <th scope="col" className="p-3 border-b border-app-border text-left text-app-text font-semibold text-sm">
                                Theme
                            </th>
                            <th scope="col" className="p-3 border-b border-app-border text-left text-app-text font-semibold text-sm">
                                Question
                            </th>
                            {showActions && !hideEditActions && (
                                <th scope="col" className="p-3 border-b border-app-border text-left text-app-text font-semibold text-sm">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border bg-app-surface">
                        {sortedQuestions.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={showActions ? 5 : 3}
                                    className="p-8 text-center text-app-text-muted italic"
                                >
                                    No questions found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            sortedQuestions.map((question) => {
                            const reference = `${question.book} ${question.chapter}:${question.verseStart}${question.verseEnd && question.verseEnd !== question.verseStart
                                    ? `-${question.verseEnd}`
                                    : ''
                                }`;

                            return (
                                <tr
                                    key={question._id}
                                    className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors"
                                >
                                    {showActions && (
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                aria-label={`Select question for ${reference}: ${question.question}`}
                                                className="cursor-pointer accent-primary-500 w-4 h-4"
                                                checked={selectedIds.includes(question._id)}
                                                onChange={(e) => onSelectionChange([question._id], e.target.checked)}
                                            />
                                        </td>
                                    )}
                                    <th scope="row" className="p-3 text-sm text-app-text whitespace-nowrap text-left font-normal">{reference}</th>
                                    <td className="p-3 text-sm text-app-text">{question.theme}</td>
                                    <td className="p-3 text-sm text-app-text">{question.question}</td>
                                    {showActions && !hideEditActions && (
                                        <td className="p-3">
                                            <button
                                                onClick={() => setEditingQuestion(question)}
                                                aria-label="Edit question"
                                                className="text-primary-500 hover:text-primary-700 transition-colors p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    )}
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

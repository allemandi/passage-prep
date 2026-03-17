import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { getSortedQuestions } from '../utils/bibleData';
import EditQuestionModal from './EditQuestionModal';

const QuestionTable = ({
    questions,
    selectedQuestions,
    onQuestionSelect,
    showActions,
    onQuestionUpdate,
    hideUnapproved = false,
    hideEditActions = false,
}) => {
    const [editingQuestion, setEditingQuestion] = useState(null);

    const filtered = hideUnapproved ? questions.filter((q) => q.isApproved !== false) : questions;
    const questionsWithIndices = filtered.map((question) => ({
        ...question,
        originalIndex: questions.indexOf(question),
    }));
    const sortedQuestionsWithIndices = getSortedQuestions(questionsWithIndices);

    // Handle select all checkbox logic
    const allSelected =
        filtered.length > 0 && selectedQuestions.length === filtered.length;
    const someSelected = selectedQuestions.length > 0 && !allSelected;

    return (
        <>
            <div className="mt-4 max-h-[400px] overflow-auto border border-app-border rounded-lg bg-app-bg/50">
                <table className="min-w-full table-auto border-collapse">
                    <thead className="sticky top-0 bg-app-surface border-b border-app-border">
                        <tr>
                            {showActions && (
                                <th className="p-3 border-b border-app-border text-left">
                                    <input
                                        type="checkbox"
                                        className="cursor-pointer accent-primary-500 w-4 h-4"
                                        checked={allSelected}
                                        ref={(input) => {
                                            if (input) input.indeterminate = someSelected;
                                        }}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                const allOriginalIndices = sortedQuestionsWithIndices.map(
                                                    (q) => q.originalIndex
                                                );
                                                onQuestionSelect(allOriginalIndices, true);
                                            } else {
                                                onQuestionSelect([], false);
                                            }
                                        }}
                                    />
                                </th>
                            )}
                            <th className="p-3 border-b border-app-border text-left text-app-text font-semibold text-sm">
                                Bible Passage
                            </th>
                            <th className="p-3 border-b border-app-border text-left text-app-text font-semibold text-sm">
                                Theme
                            </th>
                            <th className="p-3 border-b border-app-border text-left text-app-text font-semibold text-sm">
                                Question
                            </th>
                            {showActions && !hideEditActions && (
                                <th className="p-3 border-b border-app-border text-left text-app-text font-semibold text-sm">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border bg-app-surface">
                        {sortedQuestionsWithIndices.map((question, index) => {
                            const reference = `${question.book} ${question.chapter}:${question.verseStart}${question.verseEnd && question.verseEnd !== question.verseStart
                                    ? `-${question.verseEnd}`
                                    : ''
                                }`;

                            return (
                                <tr
                                    key={question._id || index}
                                    className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors"
                                >
                                    {showActions && (
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                className="cursor-pointer accent-primary-500 w-4 h-4"
                                                checked={selectedQuestions.includes(question.originalIndex)}
                                                onChange={(e) => onQuestionSelect([question.originalIndex], e.target.checked)}
                                            />
                                        </td>
                                    )}
                                    <td className="p-3 text-sm text-app-text">{reference}</td>
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

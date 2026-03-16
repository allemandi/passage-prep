import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react'; // lucide icon
import themes from '../data/themes.json';
import Button from './ui/Button';
import {
    getBibleBooks,
    getChaptersForBook,
    getVersesForChapter,
    getSortedQuestions,
} from '../utils/bibleData';

const QuestionTable = ({
    questions,
    selectedQuestions,
    onQuestionSelect,
    showActions,
    onQuestionUpdate,
    hideUnapproved = false,
    hideEditActions = false,
}) => {
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [availableBooks] = useState(getBibleBooks());
    const [availableChapters, setAvailableChapters] = useState([]);
    const [availableVerses, setAvailableVerses] = useState([]);

    useEffect(() => {
        if (editData.book) {
            const chapters = getChaptersForBook(editData.book);
            setAvailableChapters(chapters);
        } else {
            setAvailableChapters([]);
        }
    }, [editData.book]);

    useEffect(() => {
        if (editData.book && editData.chapter) {
            const verseCount = getVersesForChapter(editData.book, editData.chapter);
            const verses = Array.from({ length: verseCount }, (_, i) => (i + 1).toString());
            setAvailableVerses(verses);
        } else {
            setAvailableVerses([]);
        }
    }, [editData.book, editData.chapter]);

    const handleEdit = (question) => {
        setEditingId(question._id);
        setEditData({
            book: question.book,
            chapter: question.chapter,
            verseStart: question.verseStart,
            verseEnd: question.verseEnd,
            theme: question.theme,
            question: question.question,
        });
    };

    const handleSave = async () => {
        if (
            !editData.book ||
            !editData.chapter ||
            !editData.verseStart ||
            !editData.theme ||
            !editData.question
        ) {
            return;
        }
        if (parseInt(editData.verseStart) > parseInt(editData.verseEnd || editData.verseStart)) {
            return;
        }
        setIsSaving(true);
        try {
            await onQuestionUpdate(editingId, {
                book: editData.book,
                chapter: editData.chapter,
                verseStart: editData.verseStart,
                verseEnd: editData.verseEnd || editData.verseStart,
                theme: editData.theme,
                question: editData.question,
            });
            setEditingId(null);
        } catch (error) {
            console.error('Update failed:', error);
        }
        setIsSaving(false);
    };

    const handleCancel = () => {
        setEditingId(null);
    };

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
                                        className="cursor-pointer"
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
                                                onClick={() => handleEdit(question)}
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


            {/* Edit Modal */}
            {editingId && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
                    aria-modal="true"
                    role="dialog"
                    aria-labelledby="edit-dialog-title"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) handleCancel();
                    }}
                >
                    <div
                        className="bg-app-surface border border-app-border shadow-xl rounded-xl max-w-4xl w-full p-8"
                    >
                        <h2 id="edit-dialog-title" className="text-2xl font-bold mb-6 text-app-text">
                            Edit Question
                        </h2>
                        <div className="flex flex-col gap-6">
                            {/* Book + Chapter */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <div className="w-full sm:w-72">
                                    <label className="block text-sm font-medium text-app-text mb-1.5">Book</label>
                                    <select
                                        className="w-full border-2 border-app-border rounded-lg px-3 py-2.5 bg-app-surface text-app-text focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/20 transition-all duration-200"
                                        value={editData.book || ''}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                book: e.target.value,
                                                chapter: '',
                                                verseStart: '',
                                                verseEnd: '',
                                            })
                                        }
                                        required
                                    >
                                    <option value="" disabled className="bg-app-surface text-app-text">
                                        Select Book
                                    </option>
                                        {availableBooks.map((book) => (
                                            <option key={book} value={book} className="bg-app-surface text-app-text">
                                                {book}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-full sm:w-28">
                                    <label className="block text-sm font-medium text-app-text mb-1.5">Chapter</label>
                                    <select
                                        className="w-full border-2 border-app-border rounded-lg px-3 py-2.5 bg-app-surface text-app-text focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/20 transition-all duration-200 disabled:opacity-50"
                                        value={editData.chapter || ''}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                chapter: e.target.value,
                                                verseStart: '',
                                                verseEnd: '',
                                            })
                                        }
                                        disabled={!editData.book}
                                        required
                                    >
                                        <option value="" disabled className="bg-app-surface text-app-text">
                                            Select
                                        </option>
                                        {availableChapters.map((ch) => (
                                            <option key={ch} value={ch} className="bg-app-surface text-app-text">
                                                {ch}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Verse start + end */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="w-full sm:w-28">
                                    <label className="block text-sm font-medium text-app-text mb-1.5">Start</label>
                                    <select
                                        className="w-full border-2 border-app-border rounded-lg px-3 py-2.5 bg-app-surface text-app-text focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/20 transition-all duration-200 disabled:opacity-50"
                                        value={editData.verseStart || ''}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            const newData = { ...editData, verseStart: newValue };
                                            if (
                                                newValue &&
                                                editData.verseEnd &&
                                                parseInt(newValue) > parseInt(editData.verseEnd)
                                            ) {
                                                newData.verseEnd = newValue;
                                            }
                                            setEditData(newData);
                                        }}
                                        disabled={!editData.chapter}
                                        required
                                    >
                                        <option value="" disabled className="bg-app-surface text-app-text">
                                            Verse
                                        </option>
                                        {availableVerses.map((v) => (
                                            <option key={v} value={v} className="bg-app-surface text-app-text">
                                                {v}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-full sm:w-28">
                                    <label className="block text-sm font-medium text-app-text mb-1.5">End</label>
                                    <select
                                        className="w-full border-2 border-app-border rounded-lg px-3 py-2.5 bg-app-surface text-app-text focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/20 transition-all duration-200 disabled:opacity-50"
                                        value={editData.verseEnd || ''}
                                        onChange={(e) => setEditData({ ...editData, verseEnd: e.target.value })}
                                        disabled={!editData.verseStart}
                                        required
                                    >
                                        <option value="" disabled className="bg-app-surface text-app-text">
                                            Verse
                                        </option>
                                    {availableVerses
                                        .filter((v) => !editData.verseStart || parseInt(v) >= parseInt(editData.verseStart))
                                        .map((v) => (
                                            <option key={v} value={v} className="bg-app-surface text-app-text">
                                                {v}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Theme */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-app-text mb-1.5">Theme</label>
                                <select
                                    className="w-full border-2 border-app-border rounded-lg px-3 py-2.5 bg-app-surface text-app-text focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/20 transition-all duration-200"
                                    value={editData.theme || ''}
                                    onChange={(e) => setEditData({ ...editData, theme: e.target.value })}
                                    required
                                >
                                    <option value="" disabled className="bg-app-surface text-app-text">
                                        Select Theme
                                    </option>
                                    {themes.map((theme) => (
                                        <option key={theme} value={theme} className="bg-app-surface text-app-text">
                                            {theme}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Question textarea */}
                            <div>
                                <label className="block text-sm font-medium text-app-text mb-1.5">Question</label>
                                <textarea
                                    className="w-full border-2 border-app-border rounded-lg px-3 py-2.5 bg-app-surface text-app-text focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/20 transition-all duration-200 resize-y"
                                    value={editData.question || ''}
                                    onChange={(e) => setEditData({ ...editData, question: e.target.value })}
                                    rows={4}
                                    placeholder="Enter your question"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-8">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                isLoading={isSaving}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default QuestionTable;

import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react'; // lucide icon
import themes from '../data/themes.json';
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
            <div className="mt-4 max-h-[400px] overflow-auto border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                <table className="min-w-full table-auto border-collapse">
                    <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800">
                        <tr>
                            {showActions && (
                                <th className="p-2 border-b border-gray-300 dark:border-gray-700 text-left">
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
                            <th className="p-2 border-b border-gray-300 dark:border-gray-700 text-left text-gray-900 dark:text-gray-100">
                                Bible Passage
                            </th>
                            <th className="p-2 border-b border-gray-300 dark:border-gray-700 text-left text-gray-900 dark:text-gray-100">
                                Theme
                            </th>
                            <th className="p-2 border-b border-gray-300 dark:border-gray-700 text-left text-gray-900 dark:text-gray-100">
                                Question
                            </th>
                            {showActions && !hideEditActions && (
                                <th className="p-2 border-b border-gray-300 dark:border-gray-700 text-left text-gray-900 dark:text-gray-100">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedQuestionsWithIndices.map((question, index) => {
                            const reference = `${question.book} ${question.chapter}:${question.verseStart}${question.verseEnd && question.verseEnd !== question.verseStart
                                    ? `-${question.verseEnd}`
                                    : ''
                                }`;

                            return (
                                <tr
                                    key={question._id || index}
                                    className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}
                                >
                                    {showActions && (
                                        <td className="p-2 border-b border-gray-300 dark:border-gray-700">
                                            <input
                                                type="checkbox"
                                                className="cursor-pointer"
                                                checked={selectedQuestions.includes(question.originalIndex)}
                                                onChange={(e) => onQuestionSelect([question.originalIndex], e.target.checked)}
                                            />
                                        </td>
                                    )}
                                    <td className="p-2 border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">{reference}</td>
                                    <td className="p-2 border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">{question.theme}</td>
                                    <td className="p-2 border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">{question.question}</td>
                                    {showActions && !hideEditActions && (
                                        <td className="p-2 border-b border-gray-300 dark:border-gray-700">
                                            <button
                                                onClick={() => handleEdit(question)}
                                                aria-label="Edit question"
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
                                            >
                                                <Edit2 size={20} />
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
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    aria-modal="true"
                    role="dialog"
                    aria-labelledby="edit-dialog-title"
                    onClick={handleCancel}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 id="edit-dialog-title" className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                            Edit Question
                        </h2>
                        <div className="flex flex-col gap-6">
                            {/* Book + Chapter */}
                            <div className="flex gap-4 items-start">
                                <select
                                    className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 w-72 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                                    <option value="" disabled>
                                        Select Book
                                    </option>
                                    {availableBooks.map((book) => (
                                        <option key={book} value={book}>
                                            {book}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 w-28 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                                    <option value="" disabled>
                                        Select Chapter
                                    </option>
                                    {availableChapters.map((ch) => (
                                        <option key={ch} value={ch}>
                                            {ch}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Verse start + end */}
                            <div className="flex gap-4">
                                <select
                                    className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 w-28 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                                    <option value="" disabled>
                                        Start Verse
                                    </option>
                                    {availableVerses.map((v) => (
                                        <option key={v} value={v}>
                                            {v}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 w-28 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    value={editData.verseEnd || ''}
                                    onChange={(e) => setEditData({ ...editData, verseEnd: e.target.value })}
                                    disabled={!editData.verseStart}
                                    required
                                >
                                    <option value="" disabled>
                                        End Verse
                                    </option>
                                    {availableVerses
                                        .filter((v) => !editData.verseStart || parseInt(v) >= parseInt(editData.verseStart))
                                        .map((v) => (
                                            <option key={v} value={v}>
                                                {v}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Theme */}
                            <select
                                className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                value={editData.theme || ''}
                                onChange={(e) => setEditData({ ...editData, theme: e.target.value })}
                                required
                            >
                                <option value="" disabled>
                                    Select Theme
                                </option>
                                {themes.map((theme) => (
                                    <option key={theme} value={theme}>
                                        {theme}
                                    </option>
                                ))}
                            </select>

                            {/* Question textarea */}
                            <textarea
                                className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 w-full resize-y bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                value={editData.question || ''}
                                onChange={(e) => setEditData({ ...editData, question: e.target.value })}
                                rows={4}
                                placeholder="Enter your question"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 rounded border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default QuestionTable;

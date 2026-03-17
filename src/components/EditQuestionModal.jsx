import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useBibleReference from '../hooks/useBibleReference';
import { getBibleBooks } from '../utils/bibleData';
import ScriptureCombobox from './ScriptureCombobox';
import ThemeSelect from './ui/ThemeSelect';
import Textarea from './ui/Textarea';
import Button from './ui/Button';

const EditQuestionModal = ({ isOpen, onClose, question, onSave }) => {
    const [questionText, setQuestionText] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const bibleReference = useBibleReference({
        book: question?.book || '',
        chapter: question?.chapter || '',
        verseStart: question?.verseStart || '',
        verseEnd: question?.verseEnd || '',
    });

    const {
        book, chapter, verseStart, verseEnd,
        availableChapters, totalChapters, availableVerses,
        updateReference
    } = bibleReference;

    useEffect(() => {
        if (question) {
            setQuestionText(question.question || '');
            setSelectedTheme(question.theme || '');
            updateReference({
                book: question.book || '',
                chapter: question.chapter || '',
                verseStart: question.verseStart || '',
                verseEnd: question.verseEnd || '',
            });
        }
    }, [question, updateReference]);

    if (!isOpen || !question) return null;

    const handleSave = async () => {
        if (!book || !chapter || !verseStart || !selectedTheme || !questionText) {
            return;
        }

        setIsSaving(true);
        try {
            await onSave(question._id, {
                book,
                chapter,
                verseStart,
                verseEnd: verseEnd || verseStart,
                theme: selectedTheme,
                question: questionText,
            });
            onClose();
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
            aria-modal="true"
            role="dialog"
            aria-labelledby="edit-dialog-title"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="bg-app-surface border border-app-border shadow-xl rounded-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-app-border">
                    <h2 id="edit-dialog-title" className="text-2xl font-bold text-app-text">
                        Edit Question
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-app-bg rounded-full transition-colors text-app-text-muted hover:text-app-text"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto space-y-8">
                    <section className="space-y-6">
                        <h3 className="text-sm font-bold text-app-text-muted uppercase tracking-wider">Bible Reference</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <ScriptureCombobox
                                id="edit-bookSelect"
                                label="Book"
                                value={book}
                                onChange={(val) => updateReference({ book: val })}
                                options={getBibleBooks()}
                                isRequired
                            />

                            <ScriptureCombobox
                                id="edit-chapterSelect"
                                label="Chapter"
                                value={chapter}
                                onChange={(val) => updateReference({ chapter: val })}
                                options={availableChapters}
                                placeholder={book ? `Select (1-${totalChapters})` : "Select book first"}
                                disabled={!book}
                                isRequired
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <ScriptureCombobox
                                    id="edit-verseStartSelect"
                                    label="Start Verse"
                                    value={verseStart}
                                    onChange={(val) => updateReference({ verseStart: val })}
                                    options={availableVerses}
                                    placeholder={chapter ? "Select" : "..."}
                                    disabled={!chapter}
                                    isRequired
                                />

                                <ScriptureCombobox
                                    id="edit-verseEndSelect"
                                    label="End Verse"
                                    value={verseEnd}
                                    onChange={(val) => updateReference({ verseEnd: val })}
                                    options={availableVerses}
                                    isEndVerse
                                    startVerseValue={verseStart}
                                    disabled={!chapter}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h3 className="text-sm font-bold text-app-text-muted uppercase tracking-wider">Theme & Question</h3>
                        <div className="space-y-6">
                            <ThemeSelect
                                label="Theme"
                                value={selectedTheme}
                                onChange={setSelectedTheme}
                                isRequired
                            />

                            <Textarea
                                id="edit-questionText"
                                label="Question"
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                placeholder="Enter your question"
                                isRequired
                                rows={4}
                            />
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-4 p-6 border-t border-app-border bg-app-bg/30">
                    <Button
                        variant="outline"
                        onClick={onClose}
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
    );
};

export default EditQuestionModal;

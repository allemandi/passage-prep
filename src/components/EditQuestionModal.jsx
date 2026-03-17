import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import useBibleReference from '../hooks/useBibleReference';
import { getBibleBooks } from '../utils/bibleData';
import ScriptureCombobox from './ScriptureCombobox';
import ThemeSelect from './ui/ThemeSelect';
import Textarea from './ui/Textarea';
import Button from './ui/Button';

const EditQuestionModal = ({ isOpen, onClose, question, onSave }) => {
    const [questionText, setQuestionText] = useState(question?.question || '');
    const [selectedTheme, setSelectedTheme] = useState(question?.theme || '');
    const [isSaving, setIsSaving] = useState(false);

    const bibleReference = useBibleReference({
        book: question?.book || '',
        chapter: String(question?.chapter || ''),
        verseStart: String(question?.verseStart || ''),
        verseEnd: String(question?.verseEnd || ''),
    });

    const {
        book, chapter, verseStart, verseEnd,
        availableChapters, totalChapters, availableVerses,
        updateReference
    } = bibleReference;

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
        <Transition show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-app-surface border border-app-border p-0 text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">
                                {/* Header */}
                                <div className="flex justify-between items-center p-6 border-b border-app-border">
                                    <DialogTitle as="h2" className="text-2xl font-bold text-app-text">
                                        Edit Question
                                    </DialogTitle>
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
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default EditQuestionModal;

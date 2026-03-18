import React, { useState } from 'react';
import {
    RegExpMatcher,
    englishDataset,
    englishRecommendedTransformers,
} from 'obscenity';
import { saveQuestion } from '../services/dataService';
import { useToast } from './ToastMessage/Toast';
import { getBibleBooks } from '../utils/bibleData';
import useBibleReference from '../hooks/useBibleReference';

import Button from './ui/Button';
import Card from './ui/Card';
import SectionHeader from './ui/SectionHeader';
import ThemeSelect from './ui/ThemeSelect';
import Textarea from './ui/Textarea';
import ScriptureCombobox from './ScriptureCombobox';

const ContributeForm = () => {
    const showToast = useToast();
    const [questionText, setQuestionText] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const bibleReference = useBibleReference();
    const {
        book, chapter, verseStart, verseEnd,
        availableChapters, totalChapters, availableVerses,
        updateReference,
    } = bibleReference;

    const matcher = new RegExpMatcher({
        ...englishDataset.build(),
        ...englishRecommendedTransformers,
    });

    const bibleBooks = getBibleBooks();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!book || !chapter || !verseStart || !selectedTheme || !questionText) {
            return showToast('Please complete all required fields.', 'error');
        }

        if (matcher.hasMatch(questionText)) {
            return showToast('Possible profanity detected. Please revise your question.', 'error');
        }

        if (questionText.length < 5) {
            return showToast('Question is too short.', 'error');
        }

        setIsSubmitting(true);

        try {
            const saved = await saveQuestion(
                selectedTheme,
                questionText,
                {
                    book,
                    chapter,
                    verseStart,
                    verseEnd: verseEnd || verseStart,
                }
            );
            if (saved) {
                resetForm();
                showToast('Your question has been submitted successfully!', 'success');
            }
        } catch (error) {
            console.error('Error submitting question:', error);
            showToast(error.message || 'Failed to submit your question. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };


    const resetForm = () => {
        setQuestionText('');
        // We now keep selectedTheme and bibleReference to improve UX for consecutive submissions
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} noValidate>
                <Card className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Column: Bible Reference */}
                    <div className="flex flex-col gap-8">
                        <SectionHeader>Bible Reference</SectionHeader>

                        <div className="space-y-6">
                            <ScriptureCombobox
                                id="bookSelect"
                                label="Book"
                                value={book}
                                onChange={(val) => updateReference({ book: val })}
                                options={bibleBooks}
                                placeholder="Select a book..."
                                isRequired
                            />

                            <ScriptureCombobox
                                id="chapterSelect"
                                label="Chapter"
                                value={chapter}
                                onChange={(val) => updateReference({ chapter: val })}
                                options={availableChapters}
                                placeholder={book ? `Select chapter (1-${totalChapters})` : "Select a book first"}
                                disabled={!book}
                                isRequired
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <ScriptureCombobox
                                    id="verseStartSelect"
                                    label="Start Verse"
                                    value={verseStart}
                                    onChange={(val) => updateReference({ verseStart: val })}
                                    options={availableVerses}
                                    placeholder={chapter ? "Select" : "..."}
                                    disabled={!chapter}
                                    isRequired
                                />

                                <ScriptureCombobox
                                    id="verseEndSelect"
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
                    </div>

                    {/* Right Column: Theme and Question */}
                    <div className="flex flex-col gap-8">
                        <div>
                            <SectionHeader>Theme & Question</SectionHeader>
                            <div className="space-y-6">
                                <ThemeSelect
                                    value={selectedTheme}
                                    onChange={setSelectedTheme}
                                    isRequired
                                    label="Theme"
                                />

                                <Textarea
                                    id="questionText"
                                    label="Question Details"
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    placeholder="Type your Bible study question here..."
                                    isRequired
                                    rows={6}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-2 flex justify-center pt-4">
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            size="lg"
                            className="w-full max-w-md"
                        >
                            Submit Question
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default ContributeForm;

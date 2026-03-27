import React, { useState } from 'react';
import {
    RegExpMatcher,
    englishDataset,
    englishRecommendedTransformers,
} from 'obscenity';
import { saveQuestion } from '../services/dataService';
import { useToast } from './ToastMessage/Toast';
import useBibleReference from '../hooks/useBibleReference';

import Button from './ui/Button';
import Card from './ui/Card';
import SectionHeader from './ui/SectionHeader';
import ThemeSelect from './ui/ThemeSelect';
import Textarea from './ui/Textarea';
import BibleReferenceSelector from './BibleReferenceSelector';
import LoadingOverlay from './ui/LoadingOverlay';

const ContributeForm = () => {
    const showToast = useToast();
    const [questionText, setQuestionText] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const bibleReference = useBibleReference();
    const { book, chapter, verseStart, verseEnd } = bibleReference;

    const matcher = new RegExpMatcher({
        ...englishDataset.build(),
        ...englishRecommendedTransformers,
    });

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
                <LoadingOverlay isLoading={isSubmitting}>
                <Card className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Column: Bible Reference */}
                    <fieldset className="flex flex-col gap-8">
                        <legend className="contents">
                            <SectionHeader>Bible Reference</SectionHeader>
                        </legend>

                        <div>
                            <BibleReferenceSelector
                                bibleReference={bibleReference}
                                labelPrefix="Contribute: "
                                required
                            />
                        </div>
                    </fieldset>

                    {/* Right Column: Theme and Question */}
                    <fieldset className="flex flex-col gap-8">
                        <legend className="contents">
                            <SectionHeader>Theme & Question</SectionHeader>
                        </legend>
                        <div>
                            <div className="space-y-6">
                                <ThemeSelect
                                    value={selectedTheme}
                                    onChange={setSelectedTheme}
                                    required
                                    label="Theme"
                                />

                                <Textarea
                                    id="questionText"
                                    label="Question Details"
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    placeholder="Type your Bible study question here..."
                                    required
                                    rows={6}
                                />
                            </div>
                        </div>
                    </fieldset>

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
                </LoadingOverlay>
            </form>
        </div>
    );
};

export default ContributeForm;

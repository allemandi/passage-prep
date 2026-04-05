import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
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
    const [lastSubmittedId, setLastSubmittedId] = useState(null);
    const [errors, setErrors] = useState({});

    const bibleReference = useBibleReference();
    const { book, chapter, verseStart, verseEnd } = bibleReference;

    // Clear field-specific errors when they change
    useEffect(() => {
        if (book && errors.book) setErrors(prev => ({ ...prev, book: null }));
    }, [book, errors.book]);

    useEffect(() => {
        if (chapter && errors.chapter) setErrors(prev => ({ ...prev, chapter: null }));
    }, [chapter, errors.chapter]);

    useEffect(() => {
        if (verseStart && errors.verseStart) setErrors(prev => ({ ...prev, verseStart: null }));
    }, [verseStart, errors.verseStart]);

    const matcher = new RegExpMatcher({
        ...englishDataset.build(),
        ...englishRecommendedTransformers,
    });

    const validate = () => {
        const newErrors = {};
        if (!book) newErrors.book = 'Book is required';
        if (!chapter) newErrors.chapter = 'Chapter is required';
        if (!verseStart) newErrors.verseStart = 'Start verse is required';
        if (!selectedTheme) newErrors.theme = 'Theme is required';
        if (!questionText.trim()) {
            newErrors.question = 'Question is required';
        } else if (questionText.length < 5) {
            newErrors.question = 'Question must be at least 5 characters';
        } else if (matcher.hasMatch(questionText)) {
            newErrors.question = 'Possible profanity detected. Please revise.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            showToast('Please correct the errors in the form.', 'error');
            return;
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
                setLastSubmittedId(Date.now());
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

    useEffect(() => {
        if (lastSubmittedId) {
            const timer = setTimeout(() => setLastSubmittedId(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [lastSubmittedId]);

    return (
        <div className="w-full">
            {lastSubmittedId && (
                <div
                    role="status"
                    aria-live="polite"
                    className="mb-6 p-4 rounded-xl bg-primary-100 dark:bg-primary-900/40 border-2 border-primary-300 dark:border-primary-700 text-primary-800 dark:text-primary-200 text-center font-bold animate-in fade-in slide-in-from-top-4"
                >
                    ✓ Question submitted successfully! Thank you for contributing.
                </div>
            )}
            <form onSubmit={handleSubmit} noValidate>
                <LoadingOverlay isLoading={isSubmitting}>
                <Card className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Column: Bible Reference */}
                    <fieldset className="flex flex-col gap-8">
                        <legend className="contents">
                            <SectionHeader>Bible Reference</SectionHeader>
                        </legend>

                        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                            <BibleReferenceSelector
                                bibleReference={bibleReference}
                                labelPrefix="Contribute: "
                                required
                                errors={errors}
                            />
                        </div>
                    </fieldset>

                    {/* Right Column: Theme and Question */}
                    <fieldset className="flex flex-col gap-8">
                        <legend className="contents">
                            <SectionHeader>Theme & Question</SectionHeader>
                        </legend>
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-6">
                                <ThemeSelect
                                    value={selectedTheme}
                                    onChange={(val) => {
                                        setSelectedTheme(val);
                                        if (errors.theme) setErrors(prev => ({ ...prev, theme: null }));
                                    }}
                                    required
                                    label="Theme"
                                    error={errors.theme}
                                />

                                <div className="space-y-1">
                                    <Textarea
                                        id="questionText"
                                        label="Question Details"
                                        value={questionText}
                                        onChange={(e) => {
                                            setQuestionText(e.target.value);
                                            if (errors.question) setErrors(prev => ({ ...prev, question: null }));
                                        }}
                                        placeholder="Type your Bible study question here..."
                                        required
                                        rows={6}
                                        error={errors.question}
                                        helperText="Explain the context or specific thought behind your question."
                                    />
                                    <div className="flex justify-between items-center px-1">
                                        <p className="text-[10px] text-app-text-muted italic">
                                            Minimum 5 characters required
                                        </p>
                                        <span
                                            aria-live="polite"
                                            className={clsx(
                                                "text-xs font-bold transition-colors duration-300",
                                                questionText.length >= 5 ? "text-primary-500" : "text-secondary-500"
                                            )}
                                        >
                                            {questionText.length} characters
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    {/* Submit Button */}
                    <div className="md:col-span-2 flex justify-center pt-4">
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            size="lg"
                            className="w-full max-w-md shadow-lg shadow-primary-500/10"
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

import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { saveQuestion } from '../services/dataService';
import { useToast } from './ToastMessage/Toast';
import { sanitizeInput } from '../utils/sanitization';
import { hasProfanity } from '../utils/validation';
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
    const [errors, setErrors] = useState({});
    const firstSelectRef = useRef(null);

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
        } else if (hasProfanity(questionText)) {
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
                sanitizeInput(questionText),
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

    const handleReset = () => {
        setQuestionText('');
        setSelectedTheme('');
        bibleReference.reset();
        setErrors({});
        showToast('Form cleared.', 'success');

        // Return focus to the first field
        setTimeout(() => {
            firstSelectRef.current?.focus();
        }, 0);
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} noValidate>
                <LoadingOverlay isLoading={isSubmitting}>
                <Card className="flex flex-col gap-6 sm:gap-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-app-border/80 pb-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600 text-white font-bold text-sm flex-shrink-0 shadow-2xs">
                            1
                        </span>
                        <SectionHeader className="!mb-0 !border-b-0 text-xl sm:text-2xl">
                            Contribute a Question
                        </SectionHeader>
                    </div>
                    <p className="text-base text-app-text-muted font-normal -mt-1">
                        Share a new Bible discussion question with the community. Select the scripture passage, choose a theme, and enter your question.
                    </p>

                    {/* Bible Reference */}
                    <fieldset className="p-4 sm:p-5 rounded-xl bg-secondary-50/60 dark:bg-stone-900/50 border border-app-border shadow-2xs flex flex-col gap-4">
                        <legend className="w-full mb-1 px-1">
                            <span className="text-sm font-bold tracking-wide uppercase text-primary-700 dark:text-primary-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary-500 inline-block" />
                                Scripture Passage
                            </span>
                        </legend>

                        <BibleReferenceSelector
                            bibleReference={bibleReference}
                            labelPrefix="Contribute: "
                            required
                            layout="grid"
                            errors={errors}
                            firstSelectRef={firstSelectRef}
                        />
                    </fieldset>

                    {/* Theme & Question Details */}
                    <fieldset className="p-4 sm:p-5 rounded-xl bg-secondary-50/60 dark:bg-stone-900/50 border border-app-border shadow-2xs flex flex-col gap-6">
                        <legend className="w-full mb-1 px-1">
                            <span className="text-sm font-bold tracking-wide uppercase text-primary-700 dark:text-primary-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary-500 inline-block" />
                                Details
                            </span>
                        </legend>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
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
                                    rows={4}
                                    error={errors.question}
                                    helperText="Explain the context or specific thought behind your question."
                                />
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-xs text-app-text-muted italic">
                                        Minimum 5 characters required
                                    </p>
                                    <span className={clsx(
                                        "text-xs font-bold transition-colors duration-300",
                                        questionText.length >= 5 ? "text-primary-600 dark:text-primary-400" : "text-secondary-600 dark:text-secondary-400"
                                    )}>
                                        {questionText.length} characters
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-app-border/80">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleReset}
                                className="w-full sm:w-auto text-app-text-muted hover:text-stone-900 dark:hover:text-stone-100 font-semibold"
                            >
                                <RotateCcw size={16} />
                                Reset Form
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isSubmitting}
                                className="w-full sm:min-w-[240px] text-base font-bold py-3"
                            >
                                Submit Question
                            </Button>
                        </div>
                    </fieldset>
                </Card>
                </LoadingOverlay>
            </form>
        </div>
    );
};

export default ContributeForm;

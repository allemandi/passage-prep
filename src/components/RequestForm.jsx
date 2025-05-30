import React, { useState } from 'react';
import { X } from 'lucide-react';

import {
    processForm,
    searchQuestions,
} from '../services/dataService';

import {
    getBibleBooks,
    getChaptersForBook,
    getChapterCountForBook,
    formatReference,
    getVersesForChapter,
} from '../utils/bibleData';

import QuestionTable from './QuestionTable';
import { rateLimiter, getUserIdentifier } from '../utils/rateLimit';
import { processInput } from '../utils/inputUtils';
import ScriptureCombobox from './ScriptureCombobox';
import { useToast } from './ToastMessage/Toast';
import ThemesMultiSelect, { defaultThemes } from './ThemesMultiSelect';


const initialRef = {
    scripture: '',
    selectedBook: '',
    selectedChapter: '',
    verseStart: '',
    verseEnd: '',
    availableChapters: [],
    totalChapters: 0,
    availableVerses: []
};

const RequestForm = ({ onStudyGenerated, isLoading }) => {
    const showToast = useToast();

    const [scriptureRefs, setScriptureRefs] = useState([{ id: 1, ...initialRef }, { id: 2, ...initialRef }]);
    const [selectedThemes, setSelectedThemes] = useState(defaultThemes);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [hideUnapproved, setHideUnapproved] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const bibleBooks = getBibleBooks();

    const addScriptureReference = () => {
        setScriptureRefs(prev => [...prev, { id: prev.length + 1, ...initialRef }]);
    };

    const updateScriptureRef = (index, updates) => {
        setScriptureRefs(prev => {
            const newRefs = [...prev];
            const current = newRefs[index];
            const next = { ...current, ...updates };

            // If book changed, reset chapter, verses and load chapters/verses info
            if (updates.selectedBook && updates.selectedBook !== current.selectedBook) {
                next.selectedChapter = '';
                next.verseStart = '';
                next.verseEnd = '';
                next.availableChapters = getChaptersForBook(updates.selectedBook);
                next.totalChapters = getChapterCountForBook(updates.selectedBook);
                next.availableVerses = [];
            }

            // If chapter changed, reset verses and load verses info
            if (updates.selectedChapter && updates.selectedChapter !== current.selectedChapter) {
                next.verseStart = '';
                next.verseEnd = '';
                const verseCount = getVersesForChapter(next.selectedBook, updates.selectedChapter);
                next.availableVerses = Array.from({ length: verseCount }, (_, i) => (i + 1).toString());
            }

            // Ensure verseEnd is never less than verseStart
            if (updates.verseStart !== undefined) {
                const start = updates.verseStart;
                let end = updates.verseEnd !== undefined ? updates.verseEnd : next.verseEnd;
                if (!end || Number(end) < Number(start)) {
                    end = start;
                }
                next.verseEnd = end;
            }

            // Update scripture formatted string
            next.scripture = formatReference(next.selectedBook, next.selectedChapter, next.verseStart, next.verseEnd);

            newRefs[index] = next;
            return newRefs;
        });
    };

    const handleSubmit = async e => {
        e?.preventDefault();
        if (!scriptureRefs.some(ref => ref.scripture.trim())) {
            showToast('Please select at least one scripture reference.', 'error');
            return;
        }

        try {
            await rateLimiter.consume(getUserIdentifier());
        } catch {
            showToast('Too many requests. Please slow down.', 'warning');
            return;
        }

        setIsSubmitting(true);

        try {
            const refArr = scriptureRefs
                .map(ref => processInput(ref.scripture, 'scripture reference').sanitizedValue)
                .filter(Boolean);
            const themeArr = selectedThemes.length === defaultThemes.length ? [] : selectedThemes;

            const studyBaseData = await processForm({ refArr, themeArr });

            const filteredQuestions = selectedQuestions.map(i => searchResults[i]).filter(Boolean);

            onStudyGenerated({ ...studyBaseData, filteredQuestions });
            showToast('Study generated successfully!', 'success');
        } catch (err) {
            showToast(err?.message || 'An error occurred while generating your study.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSearch = async () => {
        try {
            await rateLimiter.consume(getUserIdentifier());
        } catch {
            showToast('Too many requests. Please slow down.', 'warning');
            return;
        }

        if (!scriptureRefs.some(ref => ref.selectedBook)) {
            showToast('Please select a book in at least one reference.', 'error');
            return;
        }

        try {
            const themeArr = selectedThemes.length === defaultThemes.length ? [] : selectedThemes;
            const combinedResults = (
                await Promise.all(
                    scriptureRefs
                        .filter(ref => ref.selectedBook)
                        .map(ref =>
                            searchQuestions({
                                book: ref.selectedBook,
                                chapter: ref.selectedChapter || null,
                                verseStart: ref.verseStart || null,
                                verseEnd: ref.verseEnd || null,
                                themeArr,
                            })
                        )
                )
            ).flat();

            setSearchResults(combinedResults);
            setShowSearchResults(true);

            showToast(combinedResults.length ? 'Search completed successfully.' : 'No questions found for your search.', combinedResults.length ? 'success' : 'info');
        } catch (err) {
            showToast(err?.message || 'Search failed.', 'error');
        }
    };

    const handleQuestionSelect = (indices, isSelected) => {
        setSelectedQuestions(prev => {
            if (indices.length === searchResults.length) {
                return prev.length === searchResults.length ? [] : indices;
            }
            if (indices.length === 0) {
                return prev.length === searchResults.length ? [] : Array.from({ length: searchResults.length }, (_, i) => i);
            }
            return isSelected ? Array.from(new Set([...prev, ...indices])) : prev.filter(i => !indices.includes(i));
        });
    };

    return (
        <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-16">
            <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-6">

                {/* Bible References */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 pb-1 mb-8">
                        Bible References
                    </h2>
                    <div className="flex flex-wrap gap-y-12 gap-x-12 justify-start">
                        {scriptureRefs.map((ref, i) => (
                            <div key={ref.id} className="relative w-full md:w-[260px] flex flex-col gap-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 block md:hidden">Reference {i + 1}</p>
                                {i > 0 && (
                                    <button
                                        aria-label={`Remove reference ${i + 1}`}
                                        onClick={() => setScriptureRefs(prev => prev.filter((_, idx) => idx !== i))}
                                        className="absolute -top-4 -right-4 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow focus:outline-none focus:ring-2 focus:ring-red-400"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                                <ScriptureCombobox
                                    id={`bookSelect-${i}`}
                                    label="Book"
                                    value={ref.selectedBook}
                                    onChange={book => updateScriptureRef(i, { selectedBook: book })}
                                    options={bibleBooks}
                                    placeholder="Select a book..."
                                    isRequired={i === 0}
                                    className="w-full"
                                />
                                <ScriptureCombobox
                                    id={`chapterSelect-${i}`}
                                    label="Chapter"
                                    value={ref.selectedChapter}
                                    onChange={chapter => updateScriptureRef(i, { selectedChapter: chapter })}
                                    options={ref.availableChapters}
                                    placeholder={ref.selectedBook ? `Select chapter (1-${ref.totalChapters})` : 'Select a book first'}
                                    disabled={!ref.selectedBook}
                                    className="w-full"
                                />
                                <ScriptureCombobox
                                    id={`verseStartSelect-${i}`}
                                    label="Start Verse"
                                    value={ref.verseStart}
                                    onChange={verse => updateScriptureRef(i, { verseStart: verse })}
                                    options={ref.availableVerses}
                                    placeholder={ref.selectedChapter ? 'Select start verse' : 'Select a chapter first'}
                                    disabled={!ref.selectedChapter}
                                    className="w-full"
                                />
                                <ScriptureCombobox
                                    id={`verseEndSelect-${i}`}
                                    label="End Verse"
                                    value={ref.verseEnd}
                                    onChange={verse => updateScriptureRef(i, { verseEnd: verse })}
                                    options={ref.availableVerses}
                                    isEndVerse
                                    startVerseValue={ref.verseStart}
                                    disabled={!ref.selectedChapter}
                                    className="w-full"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-start mt-8">
                        <button
                            onClick={addScriptureReference}
                            className="flex items-center gap-2 px-4 py-2 border border-primary-600 text-primary-600 rounded hover:bg-primary-50 dark:hover:bg-primary-900 transition font-semibold"
                        >
                            + Add Another Reference
                        </button>
                    </div>
                </section>

                {/* Themes and Actions */}
                <section className="flex flex-wrap gap-6">
                    <ThemesMultiSelect
                        value={selectedThemes}
                        onChange={setSelectedThemes}
                    />
                    <div className="max-w-[260px] w-full flex flex-col justify-end space-y-2">
                        <button
                            onClick={handleSearch}
                            disabled={isLoading || isSubmitting}
                            className="w-full min-w-[120px] py-2 px-4 font-semibold text-white bg-primary-600 rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Search
                        </button>

                        <button
                            onClick={() => setHideUnapproved(h => !h)}
                            className={`w-full min-w-[120px] py-2 font-semibold rounded ${hideUnapproved
                                ? 'bg-secondary-600 text-white hover:bg-secondary-700'
                                : 'border border-secondary-600 text-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                                } transition`}
                        >
                            {hideUnapproved ? 'Show Unapproved' : 'Hide Unapproved'}
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || isSubmitting}
                            className="w-full min-w-[120px] py-2 px-4 font-semibold border border-primary-600 text-primary-600 rounded hover:bg-primary-50 dark:hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Generate Study
                        </button>
                    </div>
                </section>

                {/* Search Results */}
                {showSearchResults && (
                    <section className="mt-10">
                        <QuestionTable
                            questions={searchResults}
                            selectedQuestions={selectedQuestions}
                            onQuestionSelect={handleQuestionSelect}
                            showActions
                            hideUnapproved={hideUnapproved}
                            hideEditActions
                        />
                    </section>
                )}
            </div>
        </div>
    );
};

export default RequestForm;

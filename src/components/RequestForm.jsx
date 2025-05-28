import React, { useState } from 'react';

import { X, Check, ChevronDown } from 'lucide-react';
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
import themes from '../data/themes.json';
import ScriptureCombobox from './ScriptureCombobox';

const RequestForm = ({ onStudyGenerated, isLoading }) => {
    const [scriptureRefs, setScriptureRefs] = useState([
        {
            id: 1,
            scripture: '',
            selectedBook: '',
            selectedChapter: '',
            verseStart: '',
            verseEnd: '',
            availableChapters: [],
            totalChapters: 0,
            availableVerses: []
        },
        {
            id: 2,
            scripture: '',
            selectedBook: '',
            selectedChapter: '',
            verseStart: '',
            verseEnd: '',
            availableChapters: [],
            totalChapters: 0,
            availableVerses: []
        }
    ]);

    const [selectedThemes, setSelectedThemes] = useState(themes); // Default to all themes selected
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSearchSuccess, setShowSearchSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [noQuestionsFound, setNoQuestionsFound] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [hideUnapproved, setHideUnapproved] = useState(false);

    // Bible books from the JSON data
    const bibleBooks = getBibleBooks();

    // Helper to check if all themes are selected
    const allThemesSelected = selectedThemes.length === themes.length;

    const addScriptureReference = () => {
        setScriptureRefs(prev => [...prev, {
            id: prev.length + 1,
            scripture: '',
            selectedBook: '',
            selectedChapter: '',
            verseStart: '',
            verseEnd: '',
            availableChapters: [],
            totalChapters: 0,
            availableVerses: []
        }]);
    };

    const updateScriptureRef = (index, updates) => {
        setScriptureRefs(prev => {
            const newRefs = [...prev];
            const currentRef = newRefs[index];
            let processedUpdates = { ...updates };

            // Handle verse validation before any other updates
            if (processedUpdates.verseStart !== undefined) {
                const newStart = processedUpdates.verseStart;
                const currentEnd = processedUpdates.verseEnd !== undefined ? processedUpdates.verseEnd : currentRef.verseEnd;
                if (currentEnd === undefined || currentEnd === '' || isNaN(Number(currentEnd))) {
                    processedUpdates.verseEnd = newStart;
                } else if (parseInt(currentEnd) < parseInt(newStart)) {
                    processedUpdates.verseEnd = newStart;
                }
            }

            if (processedUpdates.selectedBook !== undefined && processedUpdates.selectedBook !== currentRef.selectedBook) {
                const chapters = getChaptersForBook(processedUpdates.selectedBook);
                const chapterCount = getChapterCountForBook(processedUpdates.selectedBook);
                newRefs[index] = {
                    ...currentRef,
                    ...processedUpdates,
                    selectedChapter: '',
                    verseStart: '',
                    verseEnd: '',
                    availableChapters: chapters,
                    totalChapters: chapterCount,
                    availableVerses: [],
                    scripture: formatReference(processedUpdates.selectedBook, '')
                };
            }
            else if (processedUpdates.selectedChapter !== undefined) {
                const verseCount = getVersesForChapter(currentRef.selectedBook, processedUpdates.selectedChapter);
                const verses = Array.from({ length: verseCount }, (_, i) => (i + 1).toString());
                newRefs[index] = {
                    ...currentRef,
                    ...processedUpdates, // Ensure this spread is present
                    verseStart: '',      // Explicitly reset
                    verseEnd: '',        // Explicitly reset
                    availableVerses: verses,
                    // scripture field will be updated by the final step
                };
            } else {
                newRefs[index] = { ...currentRef, ...processedUpdates };
            }

            // Unconditionally set the scripture string based on the final values in newRefs[index]
            newRefs[index].scripture = formatReference(
                newRefs[index].selectedBook,
                newRefs[index].selectedChapter,
                newRefs[index].verseStart,
                newRefs[index].verseEnd
            );

            return newRefs;
        });
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Rate limiting
        const userIdentifier = getUserIdentifier();
        try {
            await rateLimiter.consume(userIdentifier);
        } catch (rejRes) {
            setShowError(true);
            setErrorMessage('Too many requests. Please slow down.');
            return;
        }

        setIsSubmitting(true);
        setShowSuccess(false);
        setShowError(false);
        setNoQuestionsFound(false);

        // Gather all scripture references and themes
        const refArr = scriptureRefs.map(ref => {
            const { sanitizedValue: sanitizedScripture } = processInput(ref.scripture, 'scripture reference');
            return sanitizedScripture;
        }).filter(Boolean);

        const themeArr = selectedThemes.length === themes.length ? [] : selectedThemes; // Empty array means all themes

        // Check if at least one scripture reference is selected
        if (!refArr.length) {
            setShowError(true);
            setErrorMessage('Please select at least one scripture reference.');
            setIsSubmitting(false);
            return;
        }

        const formData = {
            refArr,
            themeArr,
        };

        try {
            const studyBaseData = await processForm(formData);

            const searchResultsCopy = [...searchResults];
            const filteredQuestions = selectedQuestions.map(index => {
                if (index >= 0 && index < searchResultsCopy.length) {
                    const question = searchResultsCopy[index];
                    return question;
                } else {
                    console.warn(`Index ${index} is out of bounds for searchResults array.`);
                    return null;
                }
            }).filter(Boolean);

            onStudyGenerated({
                ...studyBaseData,
                filteredQuestions: filteredQuestions
            });
            setShowSuccess(true);
        } catch (error) {
            console.error("Error in study generation:", error);
            setShowError(true);

            if (error.message) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('An error occurred while generating your study. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSearch = async () => {
        const userIdentifier = getUserIdentifier();
        try {
            await rateLimiter.consume(userIdentifier);
        } catch (rejRes) {
            setShowError(true);
            setErrorMessage('Too many requests. Please slow down.');
            return;
        }

        try {
            const hasValidRef = scriptureRefs.some(ref => ref.selectedBook);
            if (!hasValidRef) {
                setShowError(true);
                setErrorMessage('Please select a book in at least one reference');
                return;
            }

            const searchPromises = scriptureRefs
                .filter(ref => ref.selectedBook)
                .map(ref => {
                    const searchData = {
                        book: ref.selectedBook,
                        chapter: ref.selectedChapter || null,
                        verseStart: ref.verseStart || null,
                        verseEnd: ref.verseEnd || null,
                        themeArr: selectedThemes.length === themes.length ? [] : selectedThemes
                    };
                    return searchQuestions(searchData);
                });

            const results = await Promise.all(searchPromises);
            const combinedResults = results.flat();
            const combinedResultsCopy = [...combinedResults];

            setSearchResults(combinedResultsCopy);
            setShowSearchResults(true);

            if (combinedResults.length === 0) {
                setNoQuestionsFound(true);
            } else {
                setShowSearchSuccess(true);
            }
        } catch (error) {
            setShowError(true);
            setErrorMessage(error.message || 'Search failed');
        }
    };

    const handleQuestionSelect = (indices, isSelected) => {
        setSelectedQuestions(prev => {
            if (indices.length === searchResults.length) {
                return prev.length === searchResults.length ? [] : indices;
            }
            if (indices.length === 0) {
                return prev.length === searchResults.length ? [] :
                    Array.from({ length: searchResults.length }, (_, i) => i);
            }
            return isSelected
                ? [...new Set([...prev, ...indices])]
                : prev.filter(i => !indices.includes(i));
        });
    };

    const closeAlert = (alertType) => {
        if (alertType === 'success') setShowSuccess(false);
        if (alertType === 'searchSuccess') setShowSearchSuccess(false);
        if (alertType === 'error') setShowError(false);
        if (alertType === 'noQuestions') setNoQuestionsFound(false);
    };

    return (
        <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-16">
            <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-6">
                {/* Bible References Section */}
             <section className="mb-12">
  <h2 className="text-xl font-semibold text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 pb-1 mb-8">
    Bible References
  </h2>

  <div className="flex flex-wrap gap-y-12 gap-x-12 justify-start">
    {scriptureRefs.map((ref, index) => (
      <div
        key={ref.id}
        className="relative w-full md:w-[260px] flex flex-col gap-4"
      >
        {/* Mobile label */}
        <p className="text-sm text-gray-500 dark:text-gray-400 block md:hidden">
          Reference {index + 1}
        </p>

        {/* Remove button */}
        {index > 0 && (
          <button
            aria-label={`Remove reference ${index + 1}`}
            onClick={() =>
              setScriptureRefs((prev) => prev.filter((_, i) => i !== index))
            }
            className="absolute -top-4 -right-4 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <X size={16} />
          </button>
        )}

        <ScriptureCombobox
          id={`bookSelect-${index}`}
          label="Book"
          value={ref.selectedBook}
          onChange={(book) => updateScriptureRef(index, { selectedBook: book })}
          options={bibleBooks}
          placeholder="Select a book..."
          isRequired={index === 0}
          className="w-full"
        />

        <ScriptureCombobox
          id={`chapterSelect-${index}`}
          label="Chapter"
          value={ref.selectedChapter}
          onChange={(chapter) => updateScriptureRef(index, { selectedChapter: chapter })}
          options={ref.availableChapters}
          placeholder={
            ref.selectedBook ? `Select chapter (1-${ref.totalChapters})` : 'Select a book first'
          }
          disabled={!ref.selectedBook}
          className="w-full"
        />

        <ScriptureCombobox
          id={`verseStartSelect-${index}`}
          label="Start Verse"
          value={ref.verseStart}
          onChange={(verse) => updateScriptureRef(index, { verseStart: verse })}
          options={ref.availableVerses}
          placeholder={
            ref.selectedChapter ? 'Select start verse' : 'Select a chapter first'
          }
          disabled={!ref.selectedChapter}
          className="w-full"
        />

        <ScriptureCombobox
          id={`verseEndSelect-${index}`}
          label="End Verse"
          value={ref.verseEnd}
          onChange={(verse) => updateScriptureRef(index, { verseEnd: verse })}
          options={ref.availableVerses}
          isEndVerse
          startVerseValue={ref.verseStart}
          disabled={!ref.selectedChapter}
          className="w-full"
        />
      </div>
    ))}
  </div>

  {/* Add Another Reference Button */}
  <div className="flex justify-start mt-8">
    <button
      onClick={addScriptureReference}
      className="flex items-center gap-2 px-4 py-2 border border-primary-600 text-primary-600 rounded hover:bg-primary-50 dark:hover:bg-primary-900 transition font-semibold"
    >
      + Add Another Reference
    </button>
  </div>
</section>
<section>
<div className="max-w-[260px] w-full flex flex-col justify-end">
  <h3 className="text-xl font-semibold text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 pb-1 mb-6">
    Themes
  </h3>

  {/* Multi-select field */}
  <div className="relative">
    <select
      multiple
      value={selectedThemes}
      onChange={(e) =>
        setSelectedThemes(
          Array.from(e.target.selectedOptions, (option) => option.value)
        )
      }
      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 h-[160px] focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400"
    >
      {themes.map((theme) => (
        <option
          key={theme}
          value={theme}
          className="relative py-1 pl-2 pr-8 flex items-center"
        >
          {theme}
        </option>
      ))}
    </select>
  </div>

  {/* Render selected summary */}
  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
    {selectedThemes.length === themes.length
      ? 'All'
      : selectedThemes.join(', ')}
  </p>
</div>
                    {/* Search Button */}
                    <div className="max-w-[260px] w-full flex flex-col justify-end">
                        <button
                            onClick={handleSearch}
                            disabled={isLoading || isSubmitting}
                            className="w-full min-w-[120px] py-2 px-4 font-semibold text-white bg-primary-600 rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Search
                        </button>
                    </div>

                    {/* Toggle & Generate Buttons */}
                    <div className="max-w-[260px] w-full flex flex-col justify-end space-y-2">
                        <button
                            onClick={() => setHideUnapproved((v) => !v)}
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
                            showActions={true}
                            hideUnapproved={hideUnapproved}
                            hideEditActions={true}
                        />
                    </section>
                )}
            </div>

            {/* Snackbars/Alerts */}
            {/* Common Alert container fixed bottom center with fade in/out */}
            {showSearchSuccess && (
                <AlertBanner
                    severity="success"
                    message="Questions found! Select the ones you'd like to include in your study."
                    onClose={() => closeAlert('searchSuccess')}
                />
            )}
            {showSuccess && (
                <AlertBanner
                    severity="success"
                    message="Success! Your Bible study has been generated."
                    onClose={() => closeAlert('success')}
                />
            )}
            {showError && (
                <AlertBanner
                    severity="error"
                    message={errorMessage}
                    onClose={() => closeAlert('error')}
                />
            )}
            {noQuestionsFound && (
                <AlertBanner
                    severity="warning"
                    message="No questions found that match your criteria. Try different themes or contribute more questions."
                    onClose={() => closeAlert('noQuestions')}
                />
            )}
        </div>
    );
};

// AlertBanner component for snackbars (you can move it to separate file if preferred)
const AlertBanner = ({ severity, message, onClose }) => {
    const severityColors = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        warning: 'bg-yellow-500 text-black',
    };
    return (
        <div
            role="alert"
            className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 rounded-xl px-6 py-3 shadow-lg z-50 ${severityColors[severity]}`}
        >
            <div className="flex items-center space-x-3">
                <span>{message}</span>
                <button
                    aria-label="Close alert"
                    onClick={onClose}
                    className="focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default RequestForm;


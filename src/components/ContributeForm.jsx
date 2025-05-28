import React, { useState, useCallback } from 'react';
import ScriptureCombobox from './ScriptureCombobox';
import { getBibleBooks, getChaptersForBook, getChapterCountForBook, getVersesForChapter } from '../utils/bibleData';
import {
    RegExpMatcher,
    englishDataset,
    englishRecommendedTransformers,
} from 'obscenity';
import { rateLimiter, getUserIdentifier } from '../utils/rateLimit';
import { processInput } from '../utils/inputUtils';
import { saveQuestion } from '../services/dataService';
import themes from '../data/themes.json';
import { CheckCircle, XCircle } from 'lucide-react';

const ContributeForm = () => {
    const [questionText, setQuestionText] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('');
    const [reference, setReference] = useState({
        book: '',
        chapter: '',
        verseStart: '',
        verseEnd: '',
    });

    const [selectedBook, setSelectedBook] = useState('');
    const [selectedChapter, setSelectedChapter] = useState('');
    const [startVerse, setStartVerse] = useState('');
    const [endVerse, setEndVerse] = useState('');
    const [availableChapters, setAvailableChapters] = useState([]);
    const [availableVerses, setAvailableVerses] = useState([]);
    const [totalChapters, setTotalChapters] = useState(0);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const matcher = new RegExpMatcher({
        ...englishDataset.build(),
        ...englishRecommendedTransformers,
    });

    const bibleBooks = getBibleBooks();

    const updateReference = useCallback((book, chapter, verseStart, verseEnd) => {
        setReference({
            book: book || '',
            chapter: chapter || '',
            verseStart: verseStart || '',
            verseEnd: verseEnd || verseStart || '',
        });
    }, []);

    React.useEffect(() => {
        if (selectedBook) {
            const chapters = getChaptersForBook(selectedBook);
            setAvailableChapters(chapters);

            const chapterCount = getChapterCountForBook(selectedBook);
            setTotalChapters(chapterCount);

            setSelectedChapter('');
            setStartVerse('');
            setEndVerse('');
            setAvailableVerses([]);
            updateReference(selectedBook, '', '', '');
        } else {
            setAvailableChapters([]);
            setSelectedChapter('');
            setStartVerse('');
            setEndVerse('');
            setAvailableVerses([]);
            setReference({
                book: '',
                chapter: '',
                verseStart: '',
                verseEnd: '',
            });
            setTotalChapters(0);
        }
    }, [selectedBook, updateReference]);

    React.useEffect(() => {
        if (selectedChapter) {
            const verseCount = getVersesForChapter(selectedBook, selectedChapter);
            const verses = Array.from({ length: verseCount }, (_, i) => (i + 1).toString());
            setAvailableVerses(verses);
            updateReference(selectedBook, selectedChapter, startVerse, endVerse);
        } else {
            setAvailableVerses([]);
            setStartVerse('');
            setEndVerse('');
            updateReference(selectedBook, '', '', '');
        }
    }, [selectedChapter, selectedBook, updateReference, startVerse, endVerse]);

    React.useEffect(() => {
        if (startVerse && endVerse && parseInt(endVerse) < parseInt(startVerse)) {
            setEndVerse(startVerse);
            updateReference(selectedBook, selectedChapter, startVerse, startVerse);
        }
    }, [startVerse, endVerse, selectedBook, selectedChapter, updateReference]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Rate limiting
        try {
            const userIdentifier = getUserIdentifier();
            await rateLimiter.consume(userIdentifier);
        } catch {
            return showErrorWithMessage('Too many requests. Please slow down.');
        }

        if (!reference.book || !reference.chapter || !reference.verseStart) {
            return showErrorWithMessage('Please complete all required fields.');
        }

        const [
            { error: bookError },
            { error: chapterError },
            { error: verseStartError },
            { error: verseEndError },
            { sanitizedValue: sanitizedQuestionText, error: questionError },
            { sanitizedValue: sanitizedTheme, error: themeError }
        ] = await Promise.all([
            processInput(reference.book, 'book'),
            processInput(reference.chapter, 'chapter'),
            processInput(reference.verseStart, 'start verse'),
            processInput(reference.verseEnd || reference.verseStart, 'end verse'),
            processInput(questionText, 'question'),
            processInput(selectedTheme, 'theme')
        ]);

        const error = bookError || chapterError || verseStartError || verseEndError || questionError || themeError;
        if (error) return showErrorWithMessage(error);

        if (matcher.hasMatch(sanitizedQuestionText)) {
            return showErrorWithMessage('Possible profanity detected. Please revise your question.');
        }

        if (sanitizedQuestionText.length < 5) {
            return showErrorWithMessage('Question is too short.');
        }

        setIsSubmitting(true);
        setShowError(false);

        try {
            const saved = await saveQuestion(
                sanitizedTheme,
                sanitizedQuestionText,
                {
                    book: reference.book,
                    chapter: reference.chapter,
                    verseStart: reference.verseStart,
                    verseEnd: reference.verseEnd || reference.verseStart,
                }
            );
            if (saved) {
                setShowSuccess(true);
                resetForm();
            }
        } catch (error) {
            console.error('Error submitting question:', error);
            showErrorWithMessage('Failed to submit your question. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const showErrorWithMessage = (message) => {
        setShowError(true);
        setErrorMessage(message);
    };

    const resetForm = () => {
        setQuestionText('');
        setSelectedTheme('');
        setSelectedBook('');
        setSelectedChapter('');
        setStartVerse('');
        setEndVerse('');
        setReference({
            book: '',
            chapter: '',
            verseStart: '',
            verseEnd: '',
        });
    };

    const closeAlert = (type) => {
        if (type === 'success') setShowSuccess(false);
        if (type === 'error') setShowError(false);
    };

    const handleEndVerseChange = (verse) => {
        setEndVerse(verse);
        updateReference(selectedBook, selectedChapter, startVerse, verse);
    };

    React.useEffect(() => {
  if (showSuccess) {
    const timer = setTimeout(() => {
      setShowSuccess(false);
    }, 4000);
    return () => clearTimeout(timer);
  }
}, [showSuccess]);

React.useEffect(() => {
  if (showError) {
    const timer = setTimeout(() => {
      setShowError(false);
    }, 4000);
    return () => clearTimeout(timer);
  }
}, [showError]);


    return (
        <div className="max-w-6xl mx-auto p-6">
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-8 shadow-md max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10"
                noValidate
            >
                {/* Left Column: Bible Reference */}
                <div className="flex flex-col items-center gap-6">
                    <h2 className="text-xl font-semibold text-blue-600 border-b-2 border-blue-600 w-full text-center pb-2 mb-6">
                        Bible Reference
                    </h2>

                    <div className="w-full max-w-xs">
                        <ScriptureCombobox
                            id="bookSelect"
                            label="Book"
                            value={selectedBook}
                            onChange={(book) => {
                                setSelectedBook(book);
                                updateReference(book, '', '', '');
                            }}
                            options={bibleBooks}
                            placeholder="Select a book..."
                            isRequired
                            className="w-full"
                        />
                    </div>

                    <div className="w-full max-w-xs">
                        <ScriptureCombobox
                            id="chapterSelect"
                            label="Chapter"
                            value={selectedChapter}
                            onChange={(chapter) => {
                                setSelectedChapter(chapter);
                                updateReference(selectedBook, chapter, '', '');
                            }}
                            options={availableChapters}
                            placeholder={selectedBook ? `Select chapter (1-${totalChapters})` : "Select a book first"}
                            disabled={!selectedBook}
                            isRequired
                            className="w-full"
                        />
                    </div>

                    <div className="w-full max-w-xs">
                        <ScriptureCombobox
                            id="verseStartSelect"
                            label="Start Verse"
                            value={startVerse}
                            onChange={(verse) => {
                                setStartVerse(verse);
                                updateReference(selectedBook, selectedChapter, verse, endVerse);
                            }}
                            options={availableVerses}
                            placeholder={selectedChapter ? "Select start verse" : "Select a chapter first"}
                            disabled={!selectedChapter}
                            isRequired
                            className="w-full"
                        />
                    </div>

                    <div className="w-full max-w-xs">
                        <ScriptureCombobox
                            id="verseEndSelect"
                            label="End Verse"
                            value={endVerse}
                            onChange={handleEndVerseChange}
                            options={availableVerses}
                            isEndVerse
                            startVerseValue={startVerse}
                            disabled={!selectedChapter}
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Right Column: Theme and Question */}
                <div className="flex flex-col justify-between gap-6">
                    <div className="w-full max-w-xs mx-auto">
                        <h2 className="text-xl font-semibold text-blue-600 border-b-2 border-blue-600 pb-2 mb-6 text-center">
                            Theme
                        </h2>
                        <select
                            id="themeSelect"
                            value={selectedTheme}
                            onChange={(e) => setSelectedTheme(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-md p-2 text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a theme</option>
                            {themes.map((theme, idx) => (
                                <option key={idx} value={theme}>{theme}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full max-w-xs mx-auto flex flex-col">
                        <h2 className="text-xl font-semibold text-blue-600 border-b-2 border-blue-600 pb-2 mb-6 text-center">
                            Question Details
                        </h2>
                        <textarea
                            id="questionText"
                            rows={4}
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="Type your Bible study question here..."
                            required
                            className="w-full border border-gray-300 rounded-md p-3 resize-none text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="col-span-full flex justify-center mt-8">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-14 py-3 rounded-lg font-semibold text-lg transition-shadow text-white
                            ${isSubmitting 
                                ? 'bg-blue-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center space-x-3">
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8H4z"
                                    />
                                </svg>
                                <span>Submitting...</span>
                            </div>
                        ) : (
                            'Submit Question'
                        )}
                    </button>
                </div>
            </form>

            {/* Alerts */}
         {showSuccess && (
  <div
    className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white rounded-lg px-6 py-3 flex items-center gap-3 shadow-lg animate-slideIn"
    role="alert"
  >
    <CheckCircle className="w-6 h-6" />
    <span>Your question has been submitted successfully! Thank you for contributing.</span>
    <button
      onClick={() => closeAlert('success')}
      className="ml-auto focus:outline-none"
      aria-label="Close"
    >
      <XCircle className="w-6 h-6 hover:text-green-300 transition" />
    </button>
  </div>
)}

{showError && (
  <div
    className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white rounded-lg px-6 py-3 flex items-center gap-3 shadow-lg animate-slideIn"
    role="alert"
  >
    <XCircle className="w-6 h-6" />
    <span>{errorMessage}</span>
    <button
      onClick={() => closeAlert('error')}
      className="ml-auto focus:outline-none"
      aria-label="Close"
    >
      <XCircle className="w-6 h-6 hover:text-red-300 transition" />
    </button>
  </div>
)}
        </div>
    );
};

export default ContributeForm;

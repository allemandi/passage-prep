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
import { useToast } from './ToastMessage/Toast';
import ThemesSingleSelect from './ThemesSingleSelect';

const ContributeForm = () => {
    const showToast = useToast();
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

        try {
            const userIdentifier = getUserIdentifier();
            await rateLimiter.consume(userIdentifier);
        } catch {
            return showToast('Too many requests. Please slow down.', 'error');
        }
        if (!reference.book || !reference.chapter || !reference.verseStart || !selectedTheme) {
            return showToast('Please complete all required fields.', 'error');
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
        if (error) return showToast(error, 'error');

        if (matcher.hasMatch(sanitizedQuestionText)) {
            return showToast('Possible profanity detected. Please revise your question.', 'error');
        }

        if (sanitizedQuestionText.length < 5) {
            return showToast('Question is too short.', 'error');
        }

        setIsSubmitting(true);

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
                resetForm();
                showToast('Your question has been submitted successfully!', 'success');
            }
        } catch (error) {
            console.error('Error submitting question:', error);
            showToast('Failed to submit your question. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
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

    const handleEndVerseChange = (verse) => {
        setEndVerse(verse);
        updateReference(selectedBook, selectedChapter, startVerse, verse);
    };



    return (
        <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-16">
            <form
                onSubmit={handleSubmit}
                noValidate
                className="
      bg-white/50 dark:bg-gray-900/60
      border border-gray-200 dark:border-gray-800
      rounded-xl shadow-sm backdrop-blur-md
      p-8
      max-w-5xl mx-auto
      grid grid-cols-1 md:grid-cols-2 gap-14
    "
            >
                {/* Left Column: Bible Reference */}
                <div className="flex flex-col items-center gap-8">
                    <h2
                        className="
          text-2xl font-semibold
          text-sky-700 dark:text-sky-400
          border-b-2 border-sky-700 dark:border-sky-400
          w-full text-center
          pb-2 mb-8
        "
                    >
                        Bible Reference
                    </h2>

                    <div className="w-full max-w-sm">
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

                    <div className="w-full max-w-sm">
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

                    <div className="w-full max-w-sm">
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

                    <div className="w-full max-w-sm">
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
                <div className="flex flex-col justify-between gap-10">
                    <div className="w-full max-w-sm mx-auto">
                        <h2
                            className="
            text-2xl font-semibold
            text-sky-700 dark:text-sky-400
            border-b-2 border-sky-700 dark:border-sky-400
            pb-2 mb-8
            text-center
          "
                        >
                            Theme
                        </h2>
                        <ThemesSingleSelect
                            value={selectedTheme}
                            onChange={(newTheme) => setSelectedTheme(newTheme)}
                            isRequired
                        />
                    </div>

                    <div className="w-full max-w-sm mx-auto flex flex-col">
                        <h2
                            className="
            text-2xl font-semibold
            text-sky-700 dark:text-sky-400
            border-b-2 border-sky-700 dark:border-sky-400
            pb-2 mb-6
            text-center
          "
                        >
                            Question
                        </h2>
                        <label
                            htmlFor="questionText"
                            className="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                            Question Details <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="questionText"
                            rows={4}
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="Type your Bible study question here..."
                            required
                            className="
  w-full
  border border-gray-300 dark:border-gray-700
  rounded-lg
  p-4
  resize-none
  bg-white dark:bg-gray-700
  text-gray-900 dark:text-gray-100
  focus:outline-none focus:ring-2 focus:ring-sky-500
  transition
"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="col-span-full flex justify-center mt-12">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`
          px-16 py-4 rounded-xl font-semibold text-lg
          text-white
          transition-shadow
          ${isSubmitting
                                ? 'bg-sky-400 cursor-not-allowed'
                                : 'bg-sky-700 hover:bg-sky-800 shadow-lg hover:shadow-xl'
                            }
        `}
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
        </div>
    )
};

export default ContributeForm;

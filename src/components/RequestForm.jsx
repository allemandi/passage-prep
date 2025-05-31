import { useState } from 'react';
import { X } from 'lucide-react';
import Tooltip from './Tooltip';

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
    const isGenerateDisabled = searchResults.length === 0 || selectedQuestions.length === 0;

    return (
        <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-16">
            <div
                className="
        bg-white/50 dark:bg-gray-900/60
        border border-gray-200 dark:border-gray-800
        rounded-xl shadow-sm backdrop-blur-md
        p-8
        flex flex-col gap-14
      "
            >
                <section>
                    <h2
                        className="
      text-2xl font-semibold
      text-sky-700 dark:text-sky-400
      border-b-2 border-sky-700 dark:border-sky-400
      pb-2 mb-8
      text-center
    "
                    >
                        Bible References
                    </h2>

                    <div
                        className="
      grid
      grid-cols-1 sm:grid-cols-2
      justify-center
      gap-x-12 gap-y-10
      max-w-[600px] mx-auto
      text-gray-900 dark:text-gray-300
    "
                    >
                        {scriptureRefs.map((ref, i) => (
                            <div
                                key={ref.id}
                                className="relative w-full flex flex-col gap-5"
                            >
                                <p className="text-sm text-gray-700 dark:text-gray-400 block md:hidden">
                                    Reference {i + 1}
                                </p>
                                {i > 0 && (
                                    <button
                                        aria-label={`Remove reference ${i + 1}`}
                                        onClick={() =>
                                            setScriptureRefs((prev) => prev.filter((_, idx) => idx !== i))
                                        }
                                        className="
              absolute -top-5 -right-5 p-2 rounded-full
              bg-red-600 hover:bg-red-700
              text-white shadow-md
              focus:outline-none focus:ring-2 focus:ring-red-400
              transition
            "
                                    >
                                        <X size={16} />
                                    </button>
                                )}

                                {/* Scripture ComboBoxes in original order, full width */}
                                <ScriptureCombobox
                                    id={`bookSelect-${i}`}
                                    label="Book"
                                    value={ref.selectedBook}
                                    onChange={(book) => updateScriptureRef(i, { selectedBook: book })}
                                    options={bibleBooks}
                                    placeholder="Select a book..."
                                    isRequired={i === 0}
                                    className="w-full"
                                />
                                <ScriptureCombobox
                                    id={`chapterSelect-${i}`}
                                    label="Chapter"
                                    value={ref.selectedChapter}
                                    onChange={(chapter) => updateScriptureRef(i, { selectedChapter: chapter })}
                                    options={ref.availableChapters}
                                    placeholder={
                                        ref.selectedBook
                                            ? `Select chapter (1-${ref.totalChapters})`
                                            : "Select a book first"
                                    }
                                    disabled={!ref.selectedBook}
                                    className="w-full"
                                />
                                <ScriptureCombobox
                                    id={`verseStartSelect-${i}`}
                                    label="Start Verse"
                                    value={ref.verseStart}
                                    onChange={(verse) => updateScriptureRef(i, { verseStart: verse })}
                                    options={ref.availableVerses}
                                    placeholder={ref.selectedChapter ? "Select start verse" : "Select a chapter first"}
                                    disabled={!ref.selectedChapter}
                                    className="w-full"
                                />
                                <ScriptureCombobox
                                    id={`verseEndSelect-${i}`}
                                    label="End Verse"
                                    value={ref.verseEnd}
                                    onChange={(verse) => updateScriptureRef(i, { verseEnd: verse })}
                                    options={ref.availableVerses}
                                    isEndVerse
                                    startVerseValue={ref.verseStart}
                                    disabled={!ref.selectedChapter}
                                    className="w-full"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-10">
                        <button
                            onClick={addScriptureReference}
                            className="
        inline-flex items-center gap-2
        px-5 py-3
        border border-sky-600 text-sky-600
        rounded-lg
        hover:bg-sky-100 dark:hover:bg-sky-700/30
        font-semibold
        transition
      "
                        >
                            + Add Another Reference
                        </button>
                    </div>
                </section>


                <section
                    className="
            grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center
            max-w-md mx-auto
          "
                >
                    {/* ThemesMultiSelect */}
                    <div className="w-full">
                        <ThemesMultiSelect value={selectedThemes} onChange={setSelectedThemes} />
                    </div>

                    {/* Hide Unapproved toggle */}
                    <div className="w-full">
                        <button
                            onClick={() => setHideUnapproved((h) => !h)}
                            className={`
                w-full py-3 font-semibold rounded-lg transition
                ${hideUnapproved
                                    ? 'bg-secondary-600 text-white hover:bg-secondary-700'
                                    : 'border border-secondary-600 text-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                                }
              `}
                        >
                            {hideUnapproved ? 'Show Unapproved' : 'Hide Unapproved'}
                        </button>
                    </div>

                    {/* Search button */}
                    <div className="w-full">
                        <button
                            onClick={handleSearch}
                            disabled={isLoading || isSubmitting}
                            className="
                w-full min-w-[140px] py-3 px-6 font-semibold
                text-white bg-sky-600 rounded-lg
                hover:bg-sky-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition
              "
                        >
                            Search
                        </button>
                    </div>

                    <div className="w-full relative">
                        {isGenerateDisabled ? (
                            <Tooltip content="Select at least one question from Search table">
                                <button
                                    disabled
                                    className="
          w-full min-w-[140px] py-3 px-6 font-semibold
          border border-sky-600 text-sky-600 rounded-lg
          bg-gray-100 dark:bg-gray-800
          cursor-not-allowed
          transition
        "
                                >
                                    Generate Study
                                </button>
                            </Tooltip>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || isSubmitting}
                                className="
        w-full min-w-[140px] py-3 px-6 font-semibold
        border border-sky-600 text-sky-600 rounded-lg
        hover:bg-sky-100 dark:hover:bg-sky-700/30
        disabled:opacity-50 disabled:cursor-not-allowed
        transition
      "
                            >
                                Generate Study
                            </button>
                        )}
                    </div>

                </section>
                {/* Search Results */}
                {showSearchResults && (
                    <section className="mt-12">
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


}

export default RequestForm;

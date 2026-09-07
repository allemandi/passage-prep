import { useState, useRef, useEffect } from 'react';
import { X, Plus, Search, BookOpen, RotateCcw, ArrowDown } from 'lucide-react';
import {
    processForm,
    searchQuestions,
} from '../services/dataService';
import { sanitizeInput } from '../utils/sanitization';
import { useToast } from './ToastMessage/Toast';
import useBibleReference from '../hooks/useBibleReference';
import useQuestionSelection from '../hooks/useQuestionSelection';

import Button from './ui/Button';
import Card from './ui/Card';
import SectionHeader from './ui/SectionHeader';
import ThemeSelect, { defaultThemes } from './ui/ThemeSelect';
import BibleReferenceSelector from './BibleReferenceSelector';
import Tooltip from './Tooltip';
import QuestionTable from './QuestionTable';
import LoadingOverlay from './ui/LoadingOverlay';
import Checkbox from './ui/Checkbox';

const ScriptureReferenceItem = ({ id, index, onRemove, referenceState, firstSelectRef }) => {
    return (
        <fieldset className="relative w-full flex flex-col gap-5 p-5 rounded-2xl bg-app-bg/60 border-2 border-app-border shadow-sm">
            <legend className="w-full mb-3 px-2">
                <span className="flex justify-between items-center w-full">
                    <span className="text-base font-bold text-primary-700 dark:text-primary-300 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary-500 inline-block" />
                        Passage {index + 1}
                    </span>
                    {index > 0 && (
                        <button
                            type="button"
                            aria-label={`Remove passage ${index + 1}`}
                            onClick={() => onRemove(id)}
                            className="p-2 rounded-xl bg-secondary-100 text-secondary-700 hover:bg-secondary-200 dark:bg-secondary-900/40 dark:text-secondary-300 dark:hover:bg-secondary-900/60 transition-all duration-200 min-h-[40px] flex items-center gap-1 text-sm font-bold"
                        >
                            <X size={18} />
                            <span>Remove</span>
                        </button>
                    )}
                </span>
            </legend>

            <BibleReferenceSelector
                bibleReference={referenceState}
                idPrefix={`ref-${id}-`}
                labelPrefix={`Passage ${index + 1}: `}
                required={index === 0}
                firstSelectRef={firstSelectRef}
            />
        </fieldset>
    );
};

// Wrapper component to manage multiple useBibleReference hooks
const MultiScriptureSelector = ({ references, onAdd, onRemove, newRefId }) => {
    const newRefBookSelectRef = useRef(null);

    useEffect(() => {
        if (newRefId !== null && newRefBookSelectRef.current) {
            newRefBookSelectRef.current.focus();
        }
    }, [newRefId]);

    return (
        <section className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b-2 border-app-border pb-3">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-600 text-white font-extrabold text-lg flex-shrink-0">
                    1
                </span>
                <SectionHeader className="!mb-0 !border-b-0">
                    Choose Bible Passages & Themes
                </SectionHeader>
            </div>
            <p className="text-base text-app-text-muted font-medium -mt-2">
                Select one or more Bible passages and optional topic themes to search for discussion questions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {references.map((ref, idx) => (
                    <ScriptureReferenceItem
                        key={ref.id}
                        id={ref.id}
                        index={idx}
                        onRemove={onRemove}
                        referenceState={ref.state}
                        firstSelectRef={ref.id === newRefId ? newRefBookSelectRef : null}
                    />
                ))}
            </div>
            <div className="flex justify-center">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onAdd}
                    className="w-full max-w-sm border-2 text-base font-bold py-3"
                >
                    <Plus size={20} />
                    Add Another Passage
                </Button>
            </div>
        </section>
    );
};

const RequestForm = ({ onStudyGenerated, isLoading, setTabValue }) => {
    const showToast = useToast();
    const resultsRef = useRef(null);
    const resultsHeaderRef = useRef(null);
    const searchButtonRef = useRef(null);

    // Custom state management for multiple references (up to 6)
    const [activeIndices, setActiveIndices] = useState([0, 1]);
    const [newRefId, setNewRefId] = useState(null);
    const refSlots = [
        useBibleReference(),
        useBibleReference(),
        useBibleReference(),
        useBibleReference(),
        useBibleReference(),
        useBibleReference(),
    ];

    const addReference = () => {
        if (activeIndices.length >= 6) {
            showToast('Maximum of 6 references allowed.', 'info');
            return;
        }
        const nextIndex = [0, 1, 2, 3, 4, 5].find(idx => !activeIndices.includes(idx));
        setActiveIndices(prev => [...prev, nextIndex].sort((a, b) => a - b));
        setNewRefId(nextIndex);
    };

    const removeReference = (idx) => {
        setActiveIndices(prev => prev.filter(i => i !== idx));
        refSlots[idx].reset();
        if (newRefId === idx) setNewRefId(null);
    };

    const activeRefs = activeIndices.map(idx => ({ id: idx, state: refSlots[idx] }));

    const [selectedThemes, setSelectedThemes] = useState(defaultThemes);
    const [includeReferences, setIncludeReferences] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const { selectedIds, toggleSelection, resetSelection } = useQuestionSelection();
    const [showUnapproved, setShowUnapproved] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    useEffect(() => {
        if (showSearchResults && resultsRef.current && typeof resultsRef.current.scrollIntoView === 'function') {
            resultsRef.current.scrollIntoView({ behavior: 'smooth' });
            // Focus the results header for screen readers
            resultsHeaderRef.current?.focus();
        }
    }, [showSearchResults]);

    const handleClearResults = () => {
        setSearchResults([]);
        setShowSearchResults(false);
        resetSelection();
        // Return focus to search button for accessibility
        setTimeout(() => {
            searchButtonRef.current?.focus();
        }, 0);
    };

    const handleClearForm = () => {
        setActiveIndices([0, 1]);
        refSlots.forEach(slot => slot.reset());
        setSelectedThemes(defaultThemes);
        setNewRefId(null);
        handleClearResults();
        showToast('Form cleared.', 'success');
    };

    const handleSubmit = async e => {
        e?.preventDefault();
        const validRefs = activeRefs.filter(ref => ref.state.formattedReference.trim());

        if (validRefs.length === 0) {
            showToast('Please select at least one scripture reference.', 'error');
            return;
        }

        if (selectedIds.length === 0) {
            showToast('Please select at least one question from the search results.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const refArr = validRefs.map(ref =>
                sanitizeInput(ref.state.formattedReference)
            ).filter(Boolean);

            const themeArr = selectedThemes.length === defaultThemes.length ? [] : selectedThemes;
            const studyBaseData = await processForm({ refArr, themeArr });
            const selectedQuestionsData = searchResults.filter(q => selectedIds.includes(q._id));

            onStudyGenerated({
                ...studyBaseData,
                filteredQuestions: selectedQuestionsData,
                includeReferences
            });
            showToast('Study generated successfully!', 'success');
        } catch (err) {
            showToast(err?.message || 'An error occurred while generating your study.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSearch = async () => {
        const refsWithBooks = activeRefs.filter(ref => ref.state.book);
        if (refsWithBooks.length === 0) {
            showToast('Please select a book in at least one reference.', 'error');
            return;
        }

        setIsSearching(true);
        try {
            const themeArr = selectedThemes.length === defaultThemes.length ? [] : selectedThemes;
            const apiResults = (
                await Promise.all(
                    refsWithBooks.map(ref =>
                        searchQuestions({
                            book: ref.state.book,
                            chapter: ref.state.chapter || null,
                            verseStart: ref.state.verseStart || null,
                            verseEnd: ref.state.verseEnd || null,
                            themeArr: themeArr.length === 0 ? undefined : themeArr,
                            isApproved: showUnapproved ? undefined : true,
                        })
                    )
                )
            ).flat();

            // Deduplicate by _id
            const uniqueResultsMap = new Map();
            apiResults.forEach(q => {
                if (q._id) uniqueResultsMap.set(q._id.toString(), q);
            });
            const deduplicatedResults = Array.from(uniqueResultsMap.values());

            setSearchResults(deduplicatedResults);
            setShowSearchResults(true);
            resetSelection();
            showToast(deduplicatedResults.length ? 'Search completed! Scroll down to select questions.' : 'No questions found for the selected criteria.', deduplicatedResults.length ? 'success' : 'info');
        } catch (err) {
            showToast(err?.message || 'Search failed.', 'error');
        } finally {
            setIsSearching(false);
        }
    };

    const isGenerateDisabled = searchResults.length === 0 || selectedIds.length === 0;

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <form onSubmit={handleFormSubmit} noValidate>
                <LoadingOverlay isLoading={isSearching && !showSearchResults} loadingText="Searching questions...">
                <Card className="flex flex-col gap-10">
                    {/* Step 1: Passages & Themes */}
                    <MultiScriptureSelector
                        references={activeRefs}
                        onAdd={addReference}
                        onRemove={removeReference}
                        newRefId={newRefId}
                    />

                    {/* Step 1 Filtering Options */}
                    <div className="p-6 rounded-2xl bg-app-bg/60 border-2 border-app-border shadow-sm flex flex-col gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <ThemeSelect
                                value={selectedThemes}
                                onChange={setSelectedThemes}
                                isMulti
                                label="Filter by Themes"
                            />

                            <div className="pt-2">
                                <Checkbox
                                    id="show-unapproved"
                                    label="Show Community Unapproved Questions"
                                    checked={showUnapproved}
                                    onChange={setShowUnapproved}
                                    helperText="Include newly submitted questions awaiting admin verification."
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t-2 border-app-border">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleClearForm}
                                className="w-full sm:w-auto text-app-text-muted hover:text-secondary-700 font-bold"
                                title="Reset Form"
                            >
                                <RotateCcw size={18} />
                                Reset Form
                            </Button>

                            <Button
                                ref={searchButtonRef}
                                type="submit"
                                isLoading={isLoading || isSearching}
                                loadingText="Searching questions..."
                                className="w-full sm:min-w-[240px] text-lg font-bold py-3.5"
                            >
                                <Search size={22} />
                                Search Questions
                            </Button>
                        </div>
                    </div>

                    {/* Step 2 & 3: Results & Generation */}
                    {showSearchResults && (
                        <section
                            ref={resultsRef}
                            className="mt-6 pt-8 border-t-4 border-primary-500/30 flex flex-col gap-10 animate-fade-in"
                            role="region"
                            aria-live="polite"
                        >
                            {/* Step 2 Header */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-600 text-white font-extrabold text-lg flex-shrink-0">
                                            2
                                        </span>
                                        <SectionHeader
                                            ref={resultsHeaderRef}
                                            tabIndex={-1}
                                            centered={false}
                                            className="focus:outline-none !mb-0 !pb-0 !border-b-0"
                                        >
                                            Search Results
                                        </SectionHeader>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleClearResults}
                                        className="text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-900/40 flex items-center gap-2 px-3.5 py-2 text-sm font-bold"
                                        title="Clear results"
                                    >
                                        <X size={18} />
                                        <span>Clear Results</span>
                                    </Button>
                                </div>
                                <p className="text-base text-app-text-muted font-medium">
                                    Click or check the boxes next to questions you wish to include in your finalized Bible study guide.
                                </p>
                            </div>

                            <LoadingOverlay isLoading={isSearching} loadingText="Updating questions...">
                                <QuestionTable
                                    questions={searchResults}
                                    selectedIds={selectedIds}
                                    onSelectionChange={toggleSelection}
                                    showActions
                                    showUnapproved={showUnapproved}
                                    hideEditActions
                                    setTabValue={setTabValue}
                                />
                            </LoadingOverlay>

                            {/* Step 3: Generate Study Banner */}
                            <div className="p-8 rounded-3xl bg-primary-50 dark:bg-primary-950/40 border-2 border-primary-300 dark:border-primary-800 shadow-md flex flex-col gap-8">
                                <div className="flex items-center gap-3 border-b-2 border-primary-200 dark:border-primary-800 pb-3">
                                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-600 text-white font-extrabold text-lg flex-shrink-0">
                                        3
                                    </span>
                                    <SectionHeader id="study-generation-title" className="!mb-0 !pb-0 !border-b-0">
                                        Generate & Export Study
                                    </SectionHeader>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                    <Checkbox
                                        id="include-refs"
                                        label="Include scripture references in study text"
                                        checked={includeReferences}
                                        onChange={setIncludeReferences}
                                        helperText="When checked, verse citations (e.g. Gen 1:1) will be prepended to questions."
                                    />

                                    <div className="w-full md:w-auto flex flex-col items-center gap-2">
                                        {isGenerateDisabled ? (
                                            <Tooltip content="Please check at least one question above to enable study generation">
                                                <Button
                                                    type="button"
                                                    aria-disabled="true"
                                                    variant="outline"
                                                    className="w-full md:w-auto min-w-[280px] opacity-60 cursor-not-allowed text-lg font-bold py-4"
                                                >
                                                    <BookOpen size={22} />
                                                    Generate Study Guide
                                                </Button>
                                            </Tooltip>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={handleSubmit}
                                                isLoading={isLoading || isSubmitting}
                                                loadingText="Generating study guide..."
                                                className="w-full md:w-auto min-w-[280px] text-lg font-extrabold py-4 shadow-lg animate-bounce-subtle"
                                            >
                                                <BookOpen size={22} />
                                                Generate Study Guide ({selectedIds.length} {selectedIds.length === 1 ? 'question' : 'questions'})
                                            </Button>
                                        )}
                                        {selectedIds.length === 0 && (
                                            <p className="text-sm text-secondary-600 dark:text-secondary-400 font-bold flex items-center gap-1 mt-1">
                                                <ArrowDown size={16} /> Select at least 1 question above to proceed
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </Card>
                </LoadingOverlay>
            </form>
        </div>
    );
};

export default RequestForm;

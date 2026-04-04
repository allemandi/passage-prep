import { useState, useRef, useEffect } from 'react';
import { X, Plus, Search, BookOpen, RotateCcw, MessageSquarePlus, Eye, EyeOff } from 'lucide-react';
import {
    processForm,
    searchQuestions,
} from '../services/dataService';
import { getSortedQuestions } from '../utils/bibleData';
import { processInput } from '../utils/inputUtils';
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

const ScriptureReferenceItem = ({ id, index, onRemove, referenceState, firstSelectRef }) => {
    return (
        <fieldset className="relative w-full flex flex-col gap-5 p-5 rounded-2xl bg-app-surface/40 border-2 border-app-border">
            <legend className="text-sm font-bold text-app-text-muted mb-5 w-full flex justify-between items-center">
                Reference {index + 1}
                {index > 0 && (
                    <button
                        type="button"
                        aria-label={`Remove reference ${index + 1}`}
                        onClick={() => onRemove(id)}
                        className="p-1.5 rounded-xl bg-secondary-50 text-secondary-600 hover:bg-secondary-100 dark:bg-secondary-900/30 dark:text-secondary-400 dark:hover:bg-secondary-900/50 transition-all duration-200"
                    >
                        <X size={16} />
                    </button>
                )}
            </legend>

            <BibleReferenceSelector
                bibleReference={referenceState}
                idPrefix={`ref-${id}-`}
                labelPrefix={`Reference ${index + 1}: `}
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
            <SectionHeader>Bible References</SectionHeader>
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
                <Button type="button" variant="outline" onClick={onAdd} className="w-full max-w-xs">
                    <Plus size={18} />
                    Add Another Reference
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const { selectedIds, toggleSelection, resetSelection } = useQuestionSelection();
    const [hideUnapproved, setHideUnapproved] = useState(false);
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

        setIsSubmitting(true);
        try {
            const refArr = validRefs.map(ref =>
                processInput(ref.state.formattedReference, 'scripture reference').sanitizedValue
            ).filter(Boolean);

            const themeArr = selectedThemes.length === defaultThemes.length ? [] : selectedThemes;
            const studyBaseData = await processForm({ refArr, themeArr });
            const selectedQuestionsData = searchResults.filter(q => selectedIds.includes(q._id));

            onStudyGenerated({ ...studyBaseData, filteredQuestions: selectedQuestionsData });
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
                            themeArr,
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

            // Sort results using Bible order
            const sortedResults = getSortedQuestions(deduplicatedResults);

            setSearchResults(sortedResults);
            setShowSearchResults(true);
            resetSelection();
            showToast(sortedResults.length ? 'Search completed successfully.' : 'No questions found.', sortedResults.length ? 'success' : 'info');
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
        <div className="w-full">
            <form onSubmit={handleFormSubmit} noValidate>
                <LoadingOverlay isLoading={isSearching && !showSearchResults}>
                <Card className="flex flex-col gap-12">
                    <MultiScriptureSelector
                        references={activeRefs}
                        onAdd={addReference}
                        onRemove={removeReference}
                        newRefId={newRefId}
                    />

                    <section className="pt-8 border-t-2 border-app-border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                            <ThemeSelect
                                value={selectedThemes}
                                onChange={setSelectedThemes}
                                isMulti
                                label="Themes"
                            />

                            <Button
                                type="button"
                                variant={hideUnapproved ? 'secondary' : 'outline'}
                                onClick={() => setHideUnapproved(!hideUnapproved)}
                                className="w-full"
                                title={hideUnapproved ? 'Include unapproved questions' : 'Exclude unapproved questions'}
                            >
                                {hideUnapproved ? <Eye size={18} /> : <EyeOff size={18} />}
                                {hideUnapproved ? 'Show Unapproved' : 'Hide Unapproved'}
                            </Button>

                            <div className="w-full flex gap-2">
                                <Button
                                    ref={searchButtonRef}
                                    type="submit"
                                    isLoading={isLoading || isSubmitting}
                                    className="flex-grow"
                                >
                                    <Search size={18} />
                                    Search
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClearForm}
                                    className="px-3"
                                    title="Clear form"
                                >
                                    <RotateCcw size={18} />
                                </Button>
                                {showSearchResults && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClearResults}
                                        className="px-3 text-secondary-600 border-secondary-400 hover:bg-secondary-50 dark:text-secondary-400 dark:border-secondary-500/50 dark:hover:bg-secondary-900/20"
                                        title="Clear results"
                                    >
                                        <X size={18} />
                                    </Button>
                                )}
                            </div>

                            <div className="w-full">
                                {isGenerateDisabled ? (
                                    <Tooltip content="Select at least one question from search results">
                                        <Button type="button" disabled variant="outline" className="w-full opacity-50 cursor-not-allowed">
                                            <BookOpen size={18} />
                                            Generate Study
                                        </Button>
                                    </Tooltip>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        variant="outline"
                                        isLoading={isLoading || isSubmitting}
                                        className="w-full"
                                    >
                                        <BookOpen size={18} />
                                        Generate Study {selectedIds.length > 0 && `(${selectedIds.length})`}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </section>

                    {showSearchResults && (
                        <section
                            ref={resultsRef}
                            className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                            role="region"
                            aria-live="polite"
                        >
                            <SectionHeader
                                ref={resultsHeaderRef}
                                tabIndex={-1}
                                centered={false}
                                className="focus:outline-none"
                            >
                                Search Results
                            </SectionHeader>
                            <LoadingOverlay isLoading={isSearching}>
                                {searchResults.length === 0 ? (
                                    <Card className="flex flex-col items-center justify-center py-12 px-6 text-center border-dashed border-4 border-app-border bg-app-bg/30">
                                        <div className="p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-full mb-6">
                                            <Search size={48} className="text-secondary-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-app-text mb-2">No questions found</h3>
                                        <p className="text-app-text-muted mb-8 max-w-md">
                                            We couldn&apos;t find any questions matching your current filters. You can try adjusting your search or contribute a new question.
                                        </p>
                                        <Button
                                            onClick={() => setTabValue(1)}
                                            variant="outline"
                                            className="flex items-center gap-2"
                                        >
                                            <MessageSquarePlus size={20} />
                                            Contribute a Question
                                        </Button>
                                    </Card>
                                ) : (
                                    <QuestionTable
                                        questions={searchResults}
                                        selectedIds={selectedIds}
                                        onSelectionChange={toggleSelection}
                                        showActions
                                        hideUnapproved={hideUnapproved}
                                        hideEditActions
                                    />
                                )}
                            </LoadingOverlay>
                        </section>
                    )}
                </Card>
                </LoadingOverlay>
            </form>
        </div>
    );
};

export default RequestForm;

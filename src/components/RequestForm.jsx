import { useState } from 'react';
import { X, Plus, Search, BookOpen } from 'lucide-react';
import {
    processForm,
    searchQuestions,
} from '../services/dataService';
import { getBibleBooks } from '../utils/bibleData';
import { processInput } from '../utils/inputUtils';
import { useToast } from './ToastMessage/Toast';
import useBibleReference from '../hooks/useBibleReference';
import useQuestionSelection from '../hooks/useQuestionSelection';

import Button from './ui/Button';
import Card from './ui/Card';
import SectionHeader from './ui/SectionHeader';
import ThemeSelect, { defaultThemes } from './ui/ThemeSelect';
import ScriptureCombobox from './ScriptureCombobox';
import Tooltip from './Tooltip';
import QuestionTable from './QuestionTable';

const ScriptureReferenceItem = ({ id, index, onRemove, bibleBooks, referenceState }) => {
    const {
        book, chapter, verseStart, verseEnd,
        availableChapters, totalChapters, availableVerses,
        updateReference
    } = referenceState;

    return (
        <div className="relative w-full flex flex-col gap-5 p-5 rounded-2xl bg-app-surface/40 border-2 border-app-border">
            <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-app-text-muted">
                    Reference {index + 1}
                </p>
                {index > 0 && (
                    <button
                        aria-label={`Remove reference ${index + 1}`}
                        onClick={() => onRemove(id)}
                        className="p-1.5 rounded-xl bg-secondary-50 text-secondary-600 hover:bg-secondary-100 dark:bg-secondary-900/30 dark:text-secondary-400 dark:hover:bg-secondary-900/50 transition-all duration-200"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                <ScriptureCombobox
                    id={`bookSelect-${index}`}
                    label="Book"
                    value={book}
                    onChange={(val) => updateReference({ book: val })}
                    options={bibleBooks}
                    placeholder="Select a book..."
                    isRequired={index === 0}
                />
                <ScriptureCombobox
                    id={`chapterSelect-${index}`}
                    label="Chapter"
                    value={chapter}
                    onChange={(val) => updateReference({ chapter: val })}
                    options={availableChapters}
                    placeholder={book ? `Select (1-${totalChapters})` : "Select a book first"}
                    disabled={!book}
                />
                <div className="grid grid-cols-2 gap-4">
                    <ScriptureCombobox
                        id={`verseStartSelect-${index}`}
                        label="Start"
                        value={verseStart}
                        onChange={(val) => updateReference({ verseStart: val })}
                        options={availableVerses}
                        placeholder={chapter ? "Verse" : "..."}
                        disabled={!chapter}
                    />
                    <ScriptureCombobox
                        id={`verseEndSelect-${index}`}
                        label="End"
                        value={verseEnd}
                        onChange={(val) => updateReference({ verseEnd: val })}
                        options={availableVerses}
                        isEndVerse
                        startVerseValue={verseStart}
                        disabled={!chapter}
                    />
                </div>
            </div>
        </div>
    );
};

// Wrapper component to manage multiple useBibleReference hooks
const MultiScriptureSelector = ({ references, onAdd, onRemove, bibleBooks }) => {
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
                        bibleBooks={bibleBooks}
                        referenceState={ref.state}
                    />
                ))}
            </div>
            <div className="flex justify-center">
                <Button variant="outline" onClick={onAdd} className="w-full max-w-xs">
                    <Plus size={18} />
                    Add Another Reference
                </Button>
            </div>
        </section>
    );
};

const RequestForm = ({ onStudyGenerated, isLoading }) => {
    const showToast = useToast();
    const bibleBooks = getBibleBooks();

    // Custom state management for multiple references
    const [refIds, setRefIds] = useState([1, 2]);
    const refStates = {
        1: useBibleReference(),
        2: useBibleReference(),
        3: useBibleReference(),
        4: useBibleReference(),
        5: useBibleReference(),
        6: useBibleReference(),
    };

    const addReference = () => {
        if (refIds.length >= 6) {
            showToast('Maximum of 6 references allowed.', 'info');
            return;
        }
        const nextId = [1, 2, 3, 4, 5, 6].find(n => !refIds.includes(n));
        setRefIds(prev => [...prev, nextId].sort((a, b) => a - b));
    };

    const removeReference = (id) => {
        setRefIds(prev => prev.filter(refId => refId !== id));
        refStates[id].reset();
    };

    const activeRefs = refIds.map(id => ({ id, state: refStates[id] }));

    const [selectedThemes, setSelectedThemes] = useState(defaultThemes);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const { selectedIds, toggleSelection, resetSelection } = useQuestionSelection();
    const [hideUnapproved, setHideUnapproved] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

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

        try {
            const themeArr = selectedThemes.length === defaultThemes.length ? [] : selectedThemes;
            const combinedResults = (
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

            setSearchResults(combinedResults);
            setShowSearchResults(true);
            resetSelection();
            showToast(combinedResults.length ? 'Search completed successfully.' : 'No questions found.', combinedResults.length ? 'success' : 'info');
        } catch (err) {
            showToast(err?.message || 'Search failed.', 'error');
        }
    };

    const isGenerateDisabled = searchResults.length === 0 || selectedIds.length === 0;

    return (
        <div className="w-full">
            <Card className="flex flex-col gap-12">
                <MultiScriptureSelector
                    references={activeRefs}
                    onAdd={addReference}
                    onRemove={removeReference}
                    bibleBooks={bibleBooks}
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
                            variant={hideUnapproved ? 'secondary' : 'outline'}
                            onClick={() => setHideUnapproved(!hideUnapproved)}
                            className="w-full"
                        >
                            {hideUnapproved ? 'Show Unapproved' : 'Hide Unapproved'}
                        </Button>

                        <Button
                            onClick={handleSearch}
                            isLoading={isLoading || isSubmitting}
                            className="w-full"
                        >
                            <Search size={18} />
                            Search Questions
                        </Button>

                        <div className="w-full">
                            {isGenerateDisabled ? (
                                <Tooltip content="Select at least one question from search results">
                                    <Button disabled variant="outline" className="w-full opacity-50 cursor-not-allowed">
                                        <BookOpen size={18} />
                                        Generate Study
                                    </Button>
                                </Tooltip>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    variant="outline"
                                    isLoading={isLoading || isSubmitting}
                                    className="w-full"
                                >
                                    <BookOpen size={18} />
                                    Generate Study
                                </Button>
                            )}
                        </div>
                    </div>
                </section>

                {showSearchResults && (
                    <section className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SectionHeader centered={false}>Search Results</SectionHeader>
                        <QuestionTable
                            questions={searchResults}
                            selectedIds={selectedIds}
                            onSelectionChange={toggleSelection}
                            showActions
                            hideUnapproved={hideUnapproved}
                            hideEditActions
                        />
                    </section>
                )}
            </Card>
        </div>
    );
};

export default RequestForm;

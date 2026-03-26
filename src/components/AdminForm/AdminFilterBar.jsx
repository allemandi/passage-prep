import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import ScriptureCombobox from '../ScriptureCombobox';
import ThemeSelect, { defaultThemes } from '../ui/ThemeSelect';
import Button from '../ui/Button';
import useBibleReference from '../../hooks/useBibleReference';
import { getBibleBooks } from '../../utils/bibleData';

const bibleBooks = getBibleBooks();

const AdminFilterBar = ({ onApply, initialThemes = defaultThemes, title, children }) => {
    const bibleRef = useBibleReference();
    const [selectedThemes, setSelectedThemes] = useState(initialThemes);

    const handleApply = () => {
        onApply({
            book: bibleRef.book,
            chapter: bibleRef.chapter,
            verseStart: bibleRef.verseStart,
            verseEnd: bibleRef.verseEnd,
            themes: selectedThemes
        });
    };

    const handleClear = () => {
        bibleRef.reset();
        setSelectedThemes(initialThemes);
        onApply({
            book: '',
            chapter: '',
            verseStart: '',
            verseEnd: '',
            themes: initialThemes
        });
    };

    return (
        <fieldset className="w-full mb-10">
            {title && (
                <legend className="contents">
                    <h2 className="text-xl font-bold mb-8 text-center text-app-text w-full block">
                        {title}
                    </h2>
                </legend>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-center mb-8">
                <ScriptureCombobox
                    label="Book"
                    value={bibleRef.book}
                    onChange={(book) => bibleRef.updateReference({ book })}
                    options={bibleBooks}
                    placeholder="Select a book"
                />
                <ScriptureCombobox
                    label="Chapter"
                    value={bibleRef.chapter}
                    onChange={(chapter) => bibleRef.updateReference({ chapter })}
                    options={bibleRef.availableChapters}
                    disabled={!bibleRef.book}
                    placeholder={bibleRef.book ? "Select chapter" : "Select book first"}
                />
                <ScriptureCombobox
                    label="Start Verse"
                    value={bibleRef.verseStart}
                    onChange={(verseStart) => bibleRef.updateReference({ verseStart })}
                    options={bibleRef.availableVerses}
                    disabled={!bibleRef.chapter}
                    placeholder={bibleRef.chapter ? "Start verse" : "..."}
                />
                <ScriptureCombobox
                    label="End Verse"
                    value={bibleRef.verseEnd}
                    onChange={(verseEnd) => bibleRef.updateReference({ verseEnd })}
                    options={bibleRef.availableVerses}
                    disabled={!bibleRef.chapter}
                    placeholder={bibleRef.chapter ? "End verse" : "..."}
                    isEndVerse
                    startVerseValue={bibleRef.verseStart}
                />
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <div className="w-full max-w-xs">
                    <ThemeSelect
                        value={selectedThemes}
                        onChange={setSelectedThemes}
                        isMulti
                        label="Themes"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Button
                        onClick={handleApply}
                        variant="primary"
                        className="w-full sm:w-auto min-w-[160px]"
                    >
                        <Filter className="w-5 h-5" /> Apply Filters
                    </Button>

                    <Button
                        onClick={handleClear}
                        variant="outline"
                        className="w-full sm:w-auto min-w-[160px]"
                    >
                        <X className="w-5 h-5" /> Clear Filters
                    </Button>
                    {children}
                </div>
            </div>
        </fieldset>
    );
};

export default AdminFilterBar;

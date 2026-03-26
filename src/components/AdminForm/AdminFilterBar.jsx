import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import BibleReferenceSelector from '../BibleReferenceSelector';
import ThemeSelect, { defaultThemes } from '../ui/ThemeSelect';
import Button from '../ui/Button';
import useBibleReference from '../../hooks/useBibleReference';

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
                <BibleReferenceSelector
                    bibleReference={bibleRef}
                    layout="grid"
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
                    {children}
                </div>
            </div>
        </fieldset>
    );
};

export default AdminFilterBar;

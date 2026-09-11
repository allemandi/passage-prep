import React, { useState, useRef } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import BibleReferenceSelector from '../BibleReferenceSelector';
import ThemeSelect, { defaultThemes } from '../ui/ThemeSelect';
import Button from '../ui/Button';
import { useToast } from '../ToastMessage/Toast';
import useBibleReference from '../../hooks/useBibleReference';

const AdminFilterBar = ({ onApply, initialThemes = defaultThemes, title, children }) => {
    const showToast = useToast();
    const bibleRef = useBibleReference();
    const [selectedThemes, setSelectedThemes] = useState(initialThemes);
    const firstSelectRef = useRef(null);

    const handleApply = () => {
        onApply({
            book: bibleRef.book,
            chapter: bibleRef.chapter,
            verseStart: bibleRef.verseStart,
            verseEnd: bibleRef.verseEnd,
            themes: selectedThemes
        });
    };

    const handleReset = () => {
        bibleRef.reset();
        setSelectedThemes(defaultThemes);
        showToast('Filters reset.', 'success');
        onApply({
            book: '',
            chapter: '',
            verseStart: '',
            verseEnd: '',
            themes: defaultThemes
        });

        // Return focus to the first field
        setTimeout(() => {
            firstSelectRef.current?.focus();
        }, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleApply();
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="w-full mb-8">
            <fieldset className="w-full p-4 sm:p-6 rounded-xl bg-secondary-50/60 dark:bg-stone-900/50 border border-app-border shadow-2xs flex flex-col gap-6">
                {title && (
                    <legend className="px-2 text-lg sm:text-xl font-bold text-app-text">
                        {title}
                    </legend>
                )}

                <div className="w-full">
                    <BibleReferenceSelector
                        bibleReference={bibleRef}
                        layout="grid"
                        labelPrefix="Filter: "
                        firstSelectRef={firstSelectRef}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2 border-t border-app-border/80">
                    <ThemeSelect
                        value={selectedThemes}
                        onChange={setSelectedThemes}
                        isMulti
                        label="Filter by Themes"
                    />

                    {children && (
                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 md:pt-7 justify-start md:justify-end">
                            {children}
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-app-border/80">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleReset}
                        className="w-full sm:w-auto text-app-text-muted hover:text-stone-900 dark:hover:text-stone-100 font-semibold"
                        title="Reset Filters"
                    >
                        <RotateCcw size={16} />
                        Reset Filters
                    </Button>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full sm:w-auto min-w-[200px] font-bold py-2.5"
                    >
                        <Filter size={18} /> Apply Filters
                    </Button>
                </div>
            </fieldset>
        </form>
    );
};

export default AdminFilterBar;

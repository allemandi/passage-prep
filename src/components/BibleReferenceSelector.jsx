import React from 'react';
import ScriptureCombobox from './ScriptureCombobox';
import { getBibleBooks } from '../utils/bibleData';

const bibleBooks = getBibleBooks();

const BibleReferenceSelector = ({
    bibleReference,
    required = false,
    idPrefix = '',
    layout = 'vertical',
    labelPrefix = '',
}) => {
    const {
        book, chapter, verseStart, verseEnd,
        availableChapters, totalChapters, availableVerses,
        updateReference,
    } = bibleReference;

    if (layout === 'grid') {
        return (
            <>
                <ScriptureCombobox
                    id={`${idPrefix}bookSelect`}
                    label="Book"
                    ariaLabel={`${labelPrefix}Book`}
                    value={book}
                    onChange={(val) => updateReference({ book: val })}
                    options={bibleBooks}
                    placeholder="Select a book..."
                    required={required}
                />

                <ScriptureCombobox
                    id={`${idPrefix}chapterSelect`}
                    label="Chapter"
                    ariaLabel={`${labelPrefix}Chapter`}
                    value={chapter}
                    onChange={(val) => updateReference({ chapter: val })}
                    options={availableChapters}
                    placeholder={book ? `Select chapter (1-${totalChapters})` : "Select a book first"}
                    disabled={!book}
                    required={required}
                />

                <ScriptureCombobox
                    id={`${idPrefix}verseStartSelect`}
                    label="Start Verse"
                    ariaLabel={`${labelPrefix}Start Verse`}
                    value={verseStart}
                    onChange={(val) => updateReference({ verseStart: val })}
                    options={availableVerses}
                    placeholder={chapter ? "Select" : "..."}
                    disabled={!chapter}
                    required={required}
                />

                <ScriptureCombobox
                    id={`${idPrefix}verseEndSelect`}
                    label="End Verse"
                    ariaLabel={`${labelPrefix}End Verse`}
                    value={verseEnd}
                    onChange={(val) => updateReference({ verseEnd: val })}
                    options={availableVerses}
                    isEndVerse
                    startVerseValue={verseStart}
                    disabled={!chapter}
                />
            </>
        );
    }

    return (
        <div className="space-y-6">
            <ScriptureCombobox
                id={`${idPrefix}bookSelect`}
                label="Book"
                ariaLabel={`${labelPrefix}Book`}
                value={book}
                onChange={(val) => updateReference({ book: val })}
                options={bibleBooks}
                placeholder="Select a book..."
                required={required}
            />

            <ScriptureCombobox
                id={`${idPrefix}chapterSelect`}
                label="Chapter"
                ariaLabel={`${labelPrefix}Chapter`}
                value={chapter}
                onChange={(val) => updateReference({ chapter: val })}
                options={availableChapters}
                placeholder={book ? `Select chapter (1-${totalChapters})` : "Select a book first"}
                disabled={!book}
                required={required}
            />

            <div className="grid grid-cols-2 gap-4">
                <ScriptureCombobox
                    id={`${idPrefix}verseStartSelect`}
                    label="Start Verse"
                    ariaLabel={`${labelPrefix}Start Verse`}
                    value={verseStart}
                    onChange={(val) => updateReference({ verseStart: val })}
                    options={availableVerses}
                    placeholder={chapter ? "Select" : "..."}
                    disabled={!chapter}
                    required={required}
                />

                <ScriptureCombobox
                    id={`${idPrefix}verseEndSelect`}
                    label="End Verse"
                    ariaLabel={`${labelPrefix}End Verse`}
                    value={verseEnd}
                    onChange={(val) => updateReference({ verseEnd: val })}
                    options={availableVerses}
                    isEndVerse
                    startVerseValue={verseStart}
                    disabled={!chapter}
                />
            </div>
        </div>
    );
};

export default BibleReferenceSelector;

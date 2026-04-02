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
    errors = {},
    firstSelectRef = null,
}) => {
    const {
        book, chapter, verseStart, verseEnd,
        availableChapters, totalChapters, availableVerses,
        updateReference,
    } = bibleReference;

    const config = [
        {
            id: 'bookSelect',
            label: 'Book',
            value: book,
            options: bibleBooks,
            placeholder: 'Select a book...',
            onChange: (val) => updateReference({ book: val }),
            error: errors.book,
            required: required,
        },
        {
            id: 'chapterSelect',
            label: 'Chapter',
            value: chapter,
            options: availableChapters,
            placeholder: book ? `Select chapter (1-${totalChapters})` : "Select a book first",
            disabled: !book,
            onChange: (val) => updateReference({ chapter: val }),
            error: errors.chapter,
            required: required,
        },
        {
            id: 'verseStartSelect',
            label: 'Start Verse',
            value: verseStart,
            options: availableVerses,
            placeholder: chapter ? "Select" : "...",
            disabled: !chapter,
            onChange: (val) => updateReference({ verseStart: val }),
            error: errors.verseStart,
            required: required,
        },
        {
            id: 'verseEndSelect',
            label: 'End Verse',
            value: verseEnd,
            options: availableVerses,
            isEndVerse: true,
            startVerseValue: verseStart,
            disabled: !chapter,
            onChange: (val) => updateReference({ verseEnd: val }),
            error: errors.verseEnd,
        }
    ];

    const renderCombobox = (item, ref = null) => (
        <ScriptureCombobox
            key={item.id}
            id={`${idPrefix}${item.id}`}
            label={item.label}
            ariaLabel={`${labelPrefix}${item.label}`}
            value={item.value}
            onChange={item.onChange}
            options={item.options}
            placeholder={item.placeholder}
            disabled={item.disabled}
            required={item.required}
            error={item.error}
            isEndVerse={item.isEndVerse}
            startVerseValue={item.startVerseValue}
            ref={ref}
        />
    );

    if (layout === 'grid') {
        return (
            <div className="contents">
                {config.map(item => renderCombobox(item))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {renderCombobox(config[0], firstSelectRef)}
            {renderCombobox(config[1])}
            <div className="grid grid-cols-2 gap-4">
                {renderCombobox(config[2])}
                {renderCombobox(config[3])}
            </div>
        </div>
    );
};

export default BibleReferenceSelector;

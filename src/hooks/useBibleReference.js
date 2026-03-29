import { useState, useCallback, useMemo } from 'react';
import {
    getChaptersForBook,
    getChapterCountForBook,
    getVersesForChapter,
    formatReference,
} from '../utils/bibleData';

/**
 * Custom hook to manage Bible reference state and logic.
 * Handles book, chapter, and verse selection, including dependencies and validation.
 */
export const useBibleReference = (initialValues = {}) => {
    const [reference, setReference] = useState({
        book: initialValues.book || '',
        chapter: initialValues.chapter || '',
        verseStart: initialValues.verseStart || '',
        verseEnd: initialValues.verseEnd || '',
    });

    const availableChapters = useMemo(() =>
        reference.book ? getChaptersForBook(reference.book) : [],
    [reference.book]);

    const totalChapters = useMemo(() =>
        reference.book ? getChapterCountForBook(reference.book) : 0,
    [reference.book]);

    const availableVerses = useMemo(() =>
        (reference.book && reference.chapter) ?
        Array.from({ length: getVersesForChapter(reference.book, reference.chapter) }, (_, i) => (i + 1).toString()) : [],
    [reference.book, reference.chapter]);

    const updateReference = useCallback((updates) => {
        setReference(prev => {
            const next = { ...prev, ...updates };

            // If book changed, reset chapter and verses ONLY IF NOT provided in updates
            if (updates.book !== undefined && updates.book !== prev.book) {
                if (updates.chapter === undefined) next.chapter = '';
                if (updates.verseStart === undefined) next.verseStart = '';
                if (updates.verseEnd === undefined) next.verseEnd = '';
            }

            // If chapter changed, reset verses ONLY IF NOT provided in updates
            if (updates.chapter !== undefined && updates.chapter !== prev.chapter) {
                if (updates.verseStart === undefined) next.verseStart = '';
                if (updates.verseEnd === undefined) next.verseEnd = '';
            }

            // Ensure verseEnd is not before verseStart
            if (next.verseStart && next.verseEnd && Number(next.verseEnd) < Number(next.verseStart)) {
                next.verseEnd = next.verseStart;
            }

            return next;
        });
    }, []);

    const formattedReference = useMemo(() =>
        formatReference(reference.book, reference.chapter, reference.verseStart, reference.verseEnd),
    [reference]);

    const isValid = useMemo(() => {
        return !!(reference.book && reference.chapter && reference.verseStart);
    }, [reference.book, reference.chapter, reference.verseStart]);

    const reset = useCallback(() => {
        setReference({
            book: '',
            chapter: '',
            verseStart: '',
            verseEnd: '',
        });
    }, []);

    return {
        ...reference,
        availableChapters,
        totalChapters,
        availableVerses,
        updateReference,
        formattedReference,
        isValid,
        reset,
    };
};

export default useBibleReference;

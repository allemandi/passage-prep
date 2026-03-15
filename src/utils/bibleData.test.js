import { describe, it, expect } from 'vitest';
import {
    getBibleBooks,
    getChaptersForBook,
    getChapterCountForBook,
    getVersesForChapter,
    formatReference,
    getSortedQuestions
} from './bibleData';

describe('bibleData utils', () => {
    it('getBibleBooks returns a list of books', () => {
        const books = getBibleBooks();
        expect(Array.isArray(books)).toBe(true);
        expect(books).toContain('Genesis');
        expect(books).toContain('Revelation');
    });

    it('getChapterCountForBook returns correct count', () => {
        expect(getChapterCountForBook('Genesis')).toBe(50);
        expect(getChapterCountForBook('Malachi')).toBe(4);
        expect(getChapterCountForBook('InvalidBook')).toBe(0);
    });

    it('getChaptersForBook returns array of strings', () => {
        const chapters = getChaptersForBook('Genesis');
        expect(chapters.length).toBe(50);
        expect(chapters[0]).toBe('1');
        expect(chapters[49]).toBe('50');
    });

    it('getVersesForChapter returns correct verse count', () => {
        // Genesis 1 has 31 verses
        expect(getVersesForChapter('Genesis', '1')).toBe(31);
        // Psalm 119 has 176 verses
        expect(getVersesForChapter('Psalms', '119')).toBe(176);
        // Invalid chapter
        expect(getVersesForChapter('Genesis', '99')).toBe(0);
    });

    it('formatReference formats correctly', () => {
        expect(formatReference('Genesis', '1')).toBe('Genesis 1');
        expect(formatReference('Genesis', '1', '1')).toBe('Genesis 1:1');
        expect(formatReference('Genesis', '1', '1', '5')).toBe('Genesis 1:1-5');
        expect(formatReference('Genesis', '1', '1', '1')).toBe('Genesis 1:1');
    });

    it('getSortedQuestions sorts by Bible order', () => {
        const questions = [
            { book: 'Revelation', chapter: 1, verseStart: 1 },
            { book: 'Genesis', chapter: 1, verseStart: 10 },
            { book: 'Genesis', chapter: 1, verseStart: 1 },
            { book: 'Exodus', chapter: 1, verseStart: 1 },
        ];
        const sorted = getSortedQuestions(questions);
        expect(sorted[0].book).toBe('Genesis');
        expect(sorted[0].verseStart).toBe(1);
        expect(sorted[1].book).toBe('Genesis');
        expect(sorted[1].verseStart).toBe(10);
        expect(sorted[2].book).toBe('Exodus');
        expect(sorted[3].book).toBe('Revelation');
    });
});

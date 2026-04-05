import {
    listBibleBooks,
    getChapterCount,
    listChapters,
    listVerses,
    isValidBook,
    isValidChapter,
} from '@allemandi/bible-validate';

export const getBibleBooks = () => listBibleBooks();

export const getChaptersForBook = (bookName) => {
    if (!isValidBook(bookName)) return [];
     return listChapters(bookName).map(String);
};

export const getChapterCountForBook = (bookName) => {
    if (!isValidBook(bookName)) return 0;
    return getChapterCount(bookName);
};

export const getVersesForChapter = (bookName, chapterNum) => {
    const chapterNumber = parseInt(chapterNum, 10);
    if (!isValidChapter(bookName, chapterNumber)) return 0;
    const versesArray = listVerses(bookName, chapterNumber);
    return versesArray.length > 0 ? Math.max(...versesArray) : 0;
};

export const formatReference = (book, chapter, startVerse = '', endVerse = '') => {
    let ref = `${book} ${chapter}`;
    if (startVerse) ref += `:${startVerse}`;
    if (endVerse && endVerse !== startVerse) ref += `-${endVerse}`;
    return ref;
};

/**
 * Common regex for extracting the book name from a full reference string.
 */
export const BIBLE_BOOK_REGEX = /^((?:\d\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*)/i;

/**
 * Common regex for parsing a full Bible reference.
 * Captures: book, chapter, verseStart, verseEnd.
 */
export const BIBLE_REFERENCE_PARSE_REGEX = /^((?:\d\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s*(\d+)?(?::(\d+)(?:-(\d+))?)?/i;

const bookOrderMap = listBibleBooks().reduce((map, book, idx) => {
    map[book] = idx;
    return map;
}, {});

export const getSortedQuestions = (questionsArray = []) => {
    if (!questionsArray.length) return [];

    return [...questionsArray].sort((a, b) => {
        const bookAIndex = bookOrderMap[a.book] ?? Infinity;
        const bookBIndex = bookOrderMap[b.book] ?? Infinity;

        if (bookAIndex !== bookBIndex) return bookAIndex - bookBIndex;

        const chapterDiff = (parseInt(a.chapter, 10) || 0) - (parseInt(b.chapter, 10) || 0);
        if (chapterDiff !== 0) return chapterDiff;

        return (parseInt(a.verseStart, 10) || 0) - (parseInt(b.verseStart, 10) || 0);
    });
};

import {
    listBibleBooks,
    getChapterCount,
    listChapters,
    listVerses,
    isValidBook,
    isValidChapter,
    isValidReference,
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

export const validateBook = (bookName) => isValidBook(bookName);

export const validateChapter = (bookName, chapterNum) => {
    return isValidChapter(bookName, parseInt(chapterNum, 10));
};

export const validateVerse = (bookName, chapterNum, verseNum) => {
    return isValidReference(bookName, parseInt(chapterNum, 10), parseInt(verseNum, 10));
};

export const validateVerseRange = (bookName, chapterNum, startVerse, endVerse) => {
    return isValidReference(bookName, parseInt(chapterNum, 10), parseInt(startVerse, 10), parseInt(endVerse, 10));
};

export const formatReference = (book, chapter, startVerse = '', endVerse = '') => {
    let ref = `${book} ${chapter}`;
    if (startVerse) ref += `:${startVerse}`;
    if (endVerse && endVerse !== startVerse) ref += `-${endVerse}`;
    return ref;
};

export const getSortedQuestions = (questionsArray = []) => {
    if (!questionsArray.length) return [];
    const currentBibleBooks = listBibleBooks();
    const bookOrderMap = currentBibleBooks.reduce((map, book, idx) => {
        map[book] = idx;
        return map;
    }, {});

    return [...questionsArray].sort((a, b) => {
        const bookAIndex = bookOrderMap[a.book] ?? Infinity;
        const bookBIndex = bookOrderMap[b.book] ?? Infinity;

        if (bookAIndex !== bookBIndex) return bookAIndex - bookBIndex;

        const chapterDiff = (parseInt(a.chapter, 10) || 0) - (parseInt(b.chapter, 10) || 0);
        if (chapterDiff !== 0) return chapterDiff;

        return (parseInt(a.verseStart, 10) || 0) - (parseInt(b.verseStart, 10) || 0);
    });
};
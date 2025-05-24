import bibleCounts from '../data/bible-counts.json';

// Helpers
const findBook = (bookName) =>
    bookName && bibleCounts.find(b => b.book.toLowerCase() === bookName.toLowerCase());

// Utility functions
export const getBibleBooks = () => bibleCounts.map(book => book.book);

export const getChaptersForBook = (bookName) => {
    const book = findBook(bookName);
    return book ? book.chapters.map(ch => ch.chapter) : [];
};

export const getChapterCountForBook = (bookName) => {
    const book = findBook(bookName);
    return book?.chapters.length || 0;
};

export const getVersesForChapter = (bookName, chapterNum) => {
    const book = findBook(bookName);
    const chapter = book?.chapters.find(ch => ch.chapter === chapterNum.toString());
    return chapter ? parseInt(chapter.verses, 10) : 0;
};

export const formatReference = (book, chapter, startVerse = '', endVerse = '') => {
    let ref = `${book} ${chapter}`;
    if (startVerse) ref += `:${startVerse}`;
    if (endVerse && endVerse !== startVerse) ref += `-${endVerse}`;
    return ref;
};

export const getSortedQuestions = (questionsArray = []) => {
    if (!questionsArray.length) return [];

    const bookOrderMap = bibleCounts.reduce((map, book, idx) => {
        map[book.book] = idx;
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
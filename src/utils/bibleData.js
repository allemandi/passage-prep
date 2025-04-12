import bibleData from '../data/bible-counts.json';

// Extract all book names for combobox options
export const getBibleBooks = () => {
  return bibleData.map(book => book.book);
};

// Get chapter numbers for a specific book name
export const getChaptersForBook = (bookName) => {
  if (!bookName) return [];
  
  const book = bibleData.find(
    b => b.book.toLowerCase() === bookName.toLowerCase()
  );
  
  if (!book) return [];
  
  return book.chapters.map(ch => ch.chapter);
};

// Get total chapter count for a specific book
export const getChapterCountForBook = (bookName) => {
  if (!bookName) return 0;
  
  const book = bibleData.find(
    b => b.book.toLowerCase() === bookName.toLowerCase()
  );
  
  return book ? book.chapters.length : 0;
};

// Get verses for a specific book and chapter
export const getVersesForChapter = (bookName, chapterNum) => {
  if (!bookName || !chapterNum) return 0;
  
  const book = bibleData.find(
    b => b.book.toLowerCase() === bookName.toLowerCase()
  );
  
  if (!book) return 0;
  
  const chapter = book.chapters.find(ch => ch.chapter === chapterNum.toString());
  return chapter ? parseInt(chapter.verses, 10) : 0;
};

// Format reference based on selected book and chapter
export const formatReference = (book, chapter) => {
  if (!book) return '';
  if (!chapter) return book;
  return `${book} ${chapter}`;
};

// Export all functions as a named object
const bibleDataUtils = {
  getBibleBooks,
  getChaptersForBook,
  getChapterCountForBook,
  getVersesForChapter,
  formatReference
};

export default bibleDataUtils;
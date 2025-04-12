import { saveQuestionToServer } from './apiService';

// Helper to get the correct API URL based on environment
const getApiUrl = (endpoint) => {
  // In production with Netlify, use /.netlify/functions/
  // In development, use /api/
  const base = process.env.NODE_ENV === 'production' 
    ? '/.netlify/functions'
    : '/api';
  
  return `${base}/${endpoint}`;
};

// Constants
export const themes = [
  "God's Love",
  "Forgiveness",
  "Faith",
  "Prayer",
  "Salvation",
  "Spiritual Gifts",
  "Identity",
  "Healing"
];

// Load books data from MongoDB
let booksCache = null;
export const getBooks = async () => {
  try {
    if (booksCache) {
      return booksCache;
    }
    
    console.log("Fetching books data from API...");
    const response = await fetch(getApiUrl('books'));
    
    if (!response.ok) {
      console.error(`Failed to fetch books: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`);
    }
    
    const books = await response.json();
    console.log(`Successfully fetched ${books.length} books from API`);
    booksCache = books;
    return books;
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
};

// Load questions data from MongoDB
export const getQuestions = async () => {
  try {
    console.log("Fetching questions data from API...");
    const response = await fetch(getApiUrl('questions'));
    
    if (!response.ok) {
      console.error(`Failed to fetch questions: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch questions: ${response.status} ${response.statusText}`);
    }
    
    const questions = await response.json();
    console.log(`Successfully fetched ${questions.length} questions from API`);
    return questions;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};

// Save a new question to MongoDB
export const saveQuestion = async (theme, question, reference) => {
  try {
    // Validate inputs
    if (!theme || !question || !reference) {
      throw new Error("Missing required question data");
    }
    
    const newQuestion = {
      theme: theme,
      question: question,
      biblePassage: reference
    };
    
    // Save to server
    const serverSaved = await saveQuestionToServer(null, newQuestion);
    
    if (!serverSaved) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

// Process the form data and return study data
export const processForm = async (formData) => {
  try {
    // Get all questions and books
    const questions = await getQuestions();
    const books = await getBooks();
    
    console.log(`Processing form with ${questions.length} questions and ${books.length} books`);
    
    // Check if we have questions and books
    if (!Array.isArray(questions) || !Array.isArray(books)) {
      console.error("Data not in expected format: questions or books is not an array");
      throw new Error("Failed to load necessary data: database response format error");
    }
    
    if (questions.length === 0 || books.length === 0) {
      console.error("Missing data: Questions:", questions.length, "Books:", books.length);
      throw new Error("Missing data: Check your database connection or data import");
    }
    
    console.log("Processing form data with references:", formData.refArr, "themes:", formData.themeArr);
    
    // Process reference array - remove any empty values
    const refArr = [...new Set(formData.refArr)].filter(n => n);
    
    // Get unique themes or use all themes if none specified
    const themeArr = formData.themeArr.length === 0 ? themes : [...new Set(formData.themeArr)].filter(n => n);
    
    // Process scripture references to get book and chapter information
    const scriptureRefs = refArr.map(ref => {
      // Split reference into book and chapter parts
      const match = ref.match(/^((?:\d\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s*(\d+)?/i);
      if (!match) return null;
      
      const [, book, chapter] = match;
      return {
        book: book.toLowerCase().trim(),
        chapter: chapter ? parseInt(chapter, 10) : null
      };
    }).filter(Boolean);
    
    // Get book contexts for matched books
    const contextArr = books
      .filter(book => {
        if (!book.Book) return false;
        return scriptureRefs.some(ref => {
          const bookLower = book.Book.toLowerCase();
          return bookLower.includes(ref.book);
        });
      })
      .map(book => `${book.Book} is about ${book.Context} The author is ${book.Author}.`);
    
    // Filter questions based on themes
    const questionsByTheme = themeArr.map(theme => {
      // First filter by theme
      let filteredQuestions = questions.filter(q => q.theme === theme);
      
      // Then filter by scripture references
      filteredQuestions = filteredQuestions.filter(q => {
        if (!q.biblePassage) return false;
        const passageLower = q.biblePassage.toLowerCase();
        
        // Check if the question matches any of the scripture references
        return scriptureRefs.some(ref => {
          // First check if the book matches
          if (!passageLower.includes(ref.book)) return false;
          
          // If a chapter was specified, check if it matches
          if (ref.chapter !== null) {
            const chapterMatch = passageLower.match(/\b(\d+)(?::\d+(?:-\d+)?)?/);
            if (!chapterMatch) return false;
            return parseInt(chapterMatch[1], 10) === ref.chapter;
          }
          
          return true;
        });
      });
      
      // Apply max limit per theme
      return filteredQuestions.slice(0, formData.maxLimit);
    });
    
    // Remove empty theme arrays
    const finalQuestionArr = questionsByTheme.filter(questions => questions.length > 0);
    
    // Prepare data for the study
    return {
      refArr,
      themeArr: themeArr.filter((_, index) => finalQuestionArr[index]?.length > 0),
      contextArr,
      questionArr: finalQuestionArr
    };
  } catch (error) {
    console.error("Study generation error:", error);
    throw new Error(`An error occurred while generating your study: ${error.message}`);
  }
};

export const searchQuestions = async (formData) => {
  try {
    // Get all questions and books
    const questions = await getQuestions();
    const books = await getBooks();
    
    if (!Array.isArray(questions) || !Array.isArray(books)) {
      throw new Error("Data not in expected format: questions or books is not an array");
    }
    
    if (questions.length === 0 || books.length === 0) {
      throw new Error("Missing data: Check your database connection or data import");
    }
    
    // Process reference array - remove any empty values
    const refArr = [...new Set(formData.refArr)].filter(n => n);
    
    // Get unique themes or use all themes if none specified
    const themeArr = formData.themeArr.length === 0 ? themes : [...new Set(formData.themeArr)].filter(n => n);
    
    // Process scripture references using the same logic as processForm
    const scriptureRefs = refArr.map(ref => {
      const match = ref.match(/^((?:\d\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s*(\d+)?/i);
      if (!match) return null;
      
      const [, book, chapter] = match;
      return {
        book: book.toLowerCase().trim(),
        chapter: chapter ? parseInt(chapter, 10) : null
      };
    }).filter(Boolean);
    
    // Filter questions based on themes and scripture references
    const matchingQuestions = questions.filter(q => {
      // Check if the question matches any of the selected themes
      const themeMatches = themeArr.length === 0 || themeArr.includes(q.theme);
      if (!themeMatches) return false;
      
      // Convert passage to lowercase for case-insensitive comparison
      const passageLower = q.biblePassage.toLowerCase();
      
      // Check if the question matches any of the scripture references
      return scriptureRefs.some(ref => {
        if (!passageLower.includes(ref.book)) return false;
        
        if (ref.chapter !== null) {
          const chapterMatch = passageLower.match(/\b(\d+)(?::\d+(?:-\d+)?)?/);
          if (!chapterMatch) return false;
          return parseInt(chapterMatch[1], 10) === ref.chapter;
        }
        
        return true;
      });
    });
    
    // Sort questions by book order and chapter
    return matchingQuestions.sort((a, b) => {
      const aBook = books.findIndex(book => a.biblePassage.toLowerCase().includes(book.Book.toLowerCase()));
      const bBook = books.findIndex(book => b.biblePassage.toLowerCase().includes(book.Book.toLowerCase()));
      
      if (aBook !== bBook) return aBook - bBook;
      
      const aChapter = parseInt(a.biblePassage.match(/\b(\d+)(?::\d+(?:-\d+)?)?/)?.[1] || '0', 10);
      const bChapter = parseInt(b.biblePassage.match(/\b(\d+)(?::\d+(?:-\d+)?)?/)?.[1] || '0', 10);
      
      return aChapter - bChapter;
    });
    
  } catch (error) {
    console.error("Question search error:", error);
    throw new Error(`An error occurred while searching questions: ${error.message}`);
  }
};
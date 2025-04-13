import { saveQuestionToServer } from './apiService';
import themes from './themes.json'; // Replace hardcoded array

// Helper to get the correct API URL based on environment
const getApiUrl = (endpoint) => {
  // In production with Netlify, use /.netlify/functions/
  // In development, use /api/
  const base = process.env.NODE_ENV === 'production' 
    ? '/.netlify/functions'
    : '/api';
  
  return `${base}/${endpoint}`;
};


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
    if (!theme || !question || !reference?.book || !reference?.chapter || !reference?.verseStart) {
      throw new Error("Missing required fields: theme, question, book, chapter, or verseStart");
    }

    const newQuestion = {
      theme,
      question,
      book: reference.book,
      chapter: reference.chapter,
      verseStart: reference.verseStart,
      verseEnd: reference.verseEnd || reference.verseStart, // Default to verseStart if missing
    };

    const response = await fetch(getApiUrl('save-question'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newData: newQuestion }), // Ensure this matches the server's expected format
    });

    if (!response.ok) {
      const errorData = await response.json(); // Parse error response
      throw new Error(errorData.error || "Server error");
    }

    return true;
  } catch (error) {
    console.error("Failed to save question:", error);
    throw error; // Propagate to UI
  }
};

// Process the form data and return study data
export const processForm = async (formData) => {
  try {
    const questions = await getQuestions();
    const books = await getBooks();
    
    if (!Array.isArray(questions) || !Array.isArray(books)) {
      throw new Error("Failed to load necessary data: database response format error");
    }
    
    if (questions.length === 0 || books.length === 0) {
      throw new Error("Missing data: Check your database connection or data import");
    }
    
    const refArr = [...new Set(formData.refArr)].filter(n => n);
    const themeArr = formData.themeArr.length === 0 ? themes : [...new Set(formData.themeArr)].filter(n => n);
    
    const scriptureRefs = refArr.map(ref => {
      const match = ref.match(/^((?:\d\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s*(\d+)?(?::(\d+)(?:-(\d+))?)?/i);
      if (!match) return null;
      
      const [, book, chapter, verseStart, verseEnd] = match;
      return {
        book: book.toLowerCase().trim(),
        chapter: chapter ? parseInt(chapter, 10) : null,
        verseStart: verseStart ? parseInt(verseStart, 10) : null,
        verseEnd: verseEnd ? parseInt(verseEnd, 10) : null
      };
    }).filter(Boolean);
    
    const contextArr = books
      .filter(book => {
        if (!book.Book) return false;
        return scriptureRefs.some(ref => book.Book.toLowerCase().includes(ref.book));
      })
      .map(book => `${book.Book} is about ${book.Context} The author is ${book.Author}.`);
    
    const questionsByTheme = themeArr.map(theme => {
      let filteredQuestions = questions.filter(q => q.theme === theme);
      
      filteredQuestions = filteredQuestions.filter(q => {
        if (!q.book) return false;
        const bookLower = q.book.toLowerCase();
        
        return scriptureRefs.some(ref => {
          if (!bookLower.includes(ref.book)) return false;
          
          if (ref.chapter !== null && q.chapter !== ref.chapter) return false;
          
          // Check verse range overlap
          if (ref.verseStart !== null && ref.verseEnd !== null) {
            const qVerseStart = parseInt(q.verseStart, 10);
            const qVerseEnd = parseInt(q.verseEnd || q.verseStart, 10);
            return (
              (qVerseStart >= ref.verseStart && qVerseStart <= ref.verseEnd) ||
              (qVerseEnd >= ref.verseStart && qVerseEnd <= ref.verseEnd) ||
              (qVerseStart <= ref.verseStart && qVerseEnd >= ref.verseEnd)
            );
          }
          
          return true;
        });
      });
      
      return filteredQuestions.slice(0, formData.maxLimit);
    });
    
    const finalQuestionArr = questionsByTheme.filter(questions => questions.length > 0);
    
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

export const searchQuestions = async ({ book, chapter, startVerse, endVerse, themeArr }) => {
  try {
    // Build the query object with direct field mapping
    const payload = {
      book: book.trim(),
      ...(chapter && { chapter: parseInt(chapter, 10) }),
      ...(startVerse && { verseStart: parseInt(startVerse, 10) }),
      ...(endVerse && { verseEnd: parseInt(endVerse, 10) }),
      ...(themeArr?.length && { theme: themeArr })
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('/api/search-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) // Send flat structure
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Search failed');
    }
    return await response.json();
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};
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

// Constants (previously defined in code.gs)
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

export const subcategories = [
  "General and Referenced Chapters",
  "Referenced Chapters Only",
  "Referenced Books Only",
  "General Only",
  "General and Referenced Books",
  "All"
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
      Theme: theme,
      Question: question,
      Subcategory: reference
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
    
    // Process reference array (similar to the original code)
    const refArr = [...new Set(formData.refArr)].filter(n => n);
    
    // Sanitize Bible references to return only alphabetical characters
    const noVerseArr = refArr.map(ref => {
      if (!ref) return '';
      return ref.replace(/[\d:.-]+$/, '').toLowerCase().trim();
    }).filter(n => n);
    
    // Sanitize Bible references to include chapters
    const withChapterArr = refArr.map(ref => {
      if (!ref) return '';
      const sanitized = ref.replace(/[^A-Za-z\d:]/g, '').split(':');
      return sanitized[0].toLowerCase();
    }).filter(n => n);
    
    console.log("Processed references - noVerseArr:", noVerseArr, "withChapterArr:", withChapterArr);
    
    // Get unique themes
    const themeArr = [...new Set(formData.themeArr)].filter(n => n);
    
    // Filter books for context based on references
    const contextArr = books
      .filter(book => {
        if (!book.Book) return false;
        
        return noVerseArr.some(ref => {
          const bookLower = book.Book.toLowerCase();
          const refLower = ref.toLowerCase();
          
          // Check for exact book match or book with chapter/verse
          // For numbered books like "1 John", ensure we match the full book name
          if (bookLower.match(/^\d\s+\w+/)) {
            // This is a numbered book like "1 John"
            return bookLower === refLower || refLower === bookLower;
          } else {
            // For regular books, check if reference starts with the book name
            // or if the book name matches the reference exactly
            const bookWords = bookLower.split(' ');
            const refWords = refLower.split(' ');
            
            if (bookWords.length === 1) {
              // Single word book (like "John")
              return refWords[0] === bookLower;
            } else {
              // Multi-word book (like "Song of Solomon")
              return bookLower === refLower || refLower.startsWith(bookLower);
            }
          }
        });
      })
      .map(book => `${book.Book}: ${book.Context}`);
    
    // Filter questions based on themes and subcategory choice
    const questionsByTheme = themeArr.map(theme => {
      let filteredQuestions = questions.filter(q => q.Theme === theme);
      
      // Apply subcategory filtering
      switch (formData.subChoice) {
        case 'General and Referenced Chapters':
          filteredQuestions = filteredQuestions.filter(q => {
            if (!q.Subcategory) return false;
            const subLower = q.Subcategory.toLowerCase();
            
            if (subLower === 'general') return true;
            
            // Check against chapter references
            return withChapterArr.some(chapterRef => {
              // Extract book name from chapter reference (e.g., "john6" -> "john")
              const bookPart = chapterRef.replace(/\d+$/, '').toLowerCase();
              
              // For exact matching of book names in chapters
              if (bookPart.match(/^\d\s*\w+/)) {
                // Numbered book with chapter
                return subLower.startsWith(bookPart);
              } else {
                // Standard book with chapter
                const subWords = subLower.split(' ');
                return subWords[0] === bookPart || subLower.startsWith(bookPart);
              }
            }) || refArr.some(ref => q.Subcategory.includes(ref));
          });
          break;
        case 'Referenced Chapters Only':
          filteredQuestions = filteredQuestions.filter(q => {
            if (!q.Subcategory) return false;
            const subLower = q.Subcategory.toLowerCase();
            
            // Check against chapter references
            return withChapterArr.some(chapterRef => {
              // Extract book name from chapter reference (e.g., "john6" -> "john")
              const bookPart = chapterRef.replace(/\d+$/, '').toLowerCase();
              
              // For exact matching of book names in chapters
              if (bookPart.match(/^\d\s*\w+/)) {
                // Numbered book with chapter
                return subLower.startsWith(bookPart);
              } else {
                // Standard book with chapter
                const subWords = subLower.split(' ');
                return subWords[0] === bookPart || subLower.startsWith(bookPart);
              }
            }) || refArr.some(ref => q.Subcategory.includes(ref));
          });
          break;
        case 'Referenced Books Only':
          filteredQuestions = filteredQuestions.filter(q => {
            if (!q.Subcategory) return false;
            const subLower = q.Subcategory.toLowerCase();
            
            return noVerseArr.some(book => {
              // For exact matching of book names
              const bookWords = book.split(' ');
              const subWords = subLower.split(' ');
              
              if (book.match(/^\d\s+\w+/)) {
                // For numbered books like "1 John"
                return subLower === book || subLower.startsWith(book);
              } else if (bookWords.length === 1) {
                // Single word book (like "John")
                return subWords[0] === book;
              } else {
                // Multi-word book
                return subLower === book || subLower.startsWith(book);
              }
            });
          });
          break;
        case 'General Only':
          filteredQuestions = filteredQuestions.filter(q => 
            q.Subcategory.toLowerCase() === 'general'
          );
          break;
        case 'General and Referenced Books':
          filteredQuestions = filteredQuestions.filter(q => {
            if (!q.Subcategory) return false;
            const subLower = q.Subcategory.toLowerCase();
            
            if (subLower === 'general') return true;
            
            return noVerseArr.some(book => {
              // For exact matching of book names
              const bookWords = book.split(' ');
              const subWords = subLower.split(' ');
              
              if (book.match(/^\d\s+\w+/)) {
                // For numbered books like "1 John"
                return subLower === book || subLower.startsWith(book);
              } else if (bookWords.length === 1) {
                // Single word book (like "John")
                return subWords[0] === book;
              } else {
                // Multi-word book
                return subLower === book || subLower.startsWith(book);
              }
            });
          });
          break;
        default:
          // 'All' returns all questions for the theme, so no filtering needed
          break;
      }
      
      // Limit number of questions
      return filteredQuestions.slice(0, formData.maxLimit);
    });
    
    // Prepare data for the study
    return {
      refArr,
      themeArr,
      contextArr,
      questionArr: questionsByTheme.map(questions => questions.map(q => q.Question))
    };
  } catch (error) {
    console.error("Study generation error:", error);
    throw new Error(`An error occurred while generating your study: ${error.message}`);
  }
}; 
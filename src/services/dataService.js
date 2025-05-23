import themes from './themes.json'; // Replace hardcoded array

// Helper to get the correct API URL based on environment
const getApiUrl = (endpoint) => {
  // In production with Netlify, use /.netlify/functions/
  // In development, use /api/
  const base = import.meta.env.MODE === 'production' 
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
    
    const response = await fetch(getApiUrl('books'));
    
    if (!response.ok) {
      console.error(`Failed to fetch books: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`);
    }
    
    const books = await response.json();
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
    const response = await fetch(getApiUrl('questions'));
    
    if (!response.ok) {
      console.error(`Failed to fetch questions: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch questions: ${response.status} ${response.statusText}`);
    }
    
    const questions = await response.json();
    return questions;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};

// Save a new question to MongoDB
export const saveQuestion = async (theme, question, reference) => {
  try {
    // Validate required fields
    if (!theme || !question || !reference?.book || !reference?.chapter || !reference?.verseStart) {
      throw new Error("Missing required fields: theme, question, book, chapter, or verseStart");
    }

    const newQuestion = {
      theme,
      question,
      book: reference.book,
      chapter: reference.chapter,
      verseStart: reference.verseStart,
      verseEnd: reference.verseEnd || reference.verseStart,
    };

    const response = await fetch(getApiUrl('save-question'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newData: newQuestion }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save question");
    }

    return true;
  } catch (error) {
    console.error("Question save error:", error);
    throw error;
  }
};

// Process the form data and return study data
export const processForm = async (formData) => {
  try {
    // const questions = await getQuestions(); // Replaced by searchQuestions loop
    const books = await getBooks();
    
    if (!Array.isArray(books)) { // questions array is no longer fetched here
      throw new Error("Failed to load book data");
    }

    const { refArr, themeArr } = formData;

    const refArrFiltered = [...new Set(refArr)].filter(n => n);
    const themeArrFiltered = formData.themeArr.length === themes.length ? [] : [...new Set(themeArr)].filter(n => n);

    // Extract book names from references for ordering
    const extractBookFromReference = (ref) => {
      const match = ref.match(/^((?:\d\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*)/i);
      return match ? match[1].trim() : null;
    };

    // Get ordered book names from reference array
    const orderedBooks = refArrFiltered
      .map(extractBookFromReference)
      .filter(Boolean);
    
    // Remove duplicates while preserving order
    const uniqueOrderedBooks = [...new Set(orderedBooks)];

    const scriptureRefs = refArrFiltered.map(ref => {
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

    // Get context for matching books
    let contextArr = books
      .filter(book => scriptureRefs.some(ref => book.Book.toLowerCase().includes(ref.book)))
      .map(book => `${book.Book} is about ${book.Context} The author is ${book.Author}.`);

    // Sort contextArr based on the order of books in refArr
    contextArr = contextArr.sort((a, b) => {
      // Extract book name from context
      const getBookFromContext = (contextStr) => {
        for (const bookName of uniqueOrderedBooks) {
          if (contextStr.includes(bookName)) {
            return bookName;
          }
        }
        return null;
      };

      const bookA = getBookFromContext(a);
      const bookB = getBookFromContext(b);
      
      // If both contexts have books associated with them
      if (bookA && bookB) {
        const indexA = uniqueOrderedBooks.indexOf(bookA);
        const indexB = uniqueOrderedBooks.indexOf(bookB);
        
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB; // Sort by book order
        }
        
        // If one book is in the ordered list and the other isn't
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
      }
      
      // If only one context has a book associated with it
      if (bookA) return -1;
      if (bookB) return 1;
      
      // If neither has a book, maintain original order
      return 0;
    });

    // Question fetching and processing is now handled in RequestForm.jsx
    // processForm is now responsible for references, themes, and context.

    return {
      refArr: refArrFiltered,
      themeArr: themeArrFiltered,
      contextArr
      // questionArr is no longer returned from here
    };
  } catch (error) {
    console.error("Study data preparation error:", error);
    throw error;
  }
};

export const searchQuestions = async ({ book, chapter, startVerse, endVerse, themeArr, isApproved }) => {
  try {
    // Build the query object with direct field mapping
    const payload = {
      ...(typeof book === 'string' && book.trim() && { book: book.trim() }),
      ...(chapter && { chapter: parseInt(chapter, 10) }),
      ...(startVerse && { verseStart: parseInt(startVerse, 10) }),
      ...(endVerse && { verseEnd: parseInt(endVerse, 10) }),
      ...(themeArr?.length && { theme: themeArr }),
      ...(typeof isApproved === 'boolean' ? { isApproved } : {})
    };

    const response = await fetch(getApiUrl('search-questions'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
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

export const deleteQuestions = async (questionIds) => {
  try {
    const response = await fetch(getApiUrl('delete-questions'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIds }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to delete questions');
    }
    return true;
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
};

export const fetchAllQuestions = async () => {
  try {
    const response = await fetch(`${getApiUrl('questions')}?${Date.now()}`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const fetchUnapprovedQuestions = async () => {
  try {
    let url;
    if (import.meta.env.MODE === 'production') {
      url = '/.netlify/functions/unapproved-questions';
    } else {
      url = '/api/unapproved-questions';
    }
    let response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    let contentType = response.headers.get('content-type');
    // If dev server returns HTML (not found), fallback to fetchAllQuestions and filter client-side
    if (!response.ok || !(contentType && contentType.includes('application/json'))) {
      // Try fallback only in dev
      if (import.meta.env.MODE !== 'production') {
        const all = await fetchAllQuestions();
        return all.filter(q => q.isApproved === false);
      }
      let errorText = contentType && contentType.includes('text') ? await response.text() : '';
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch unapproved error:', error);
    throw error;
  }
};

export const approveQuestions = async (questionIds) => {
  try {
    const url = import.meta.env.MODE === 'production'
      ? '/.netlify/functions/approve-questions'
      : '/api/approve-questions';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIds }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to approve questions');
    }
    return await response.json();
  } catch (error) {
    console.error('Approve questions error:', error);
    throw error;
  }
};

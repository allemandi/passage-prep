import themes from './themes.json'; // Replace hardcoded array

// Helper to get the correct API URL based on environment
const getApiUrl = (endpoint) => {
  // In production with Netlify, use /.netlify/functions/
  // In development, use /api/
  const base = process.env.NODE_ENV === 'production' 
    ? '/.netlify/functions'
    : 'http://localhost:3001/api'; // Adjust port if needed
  
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
    const questions = await getQuestions();
    const books = await getBooks();
    
    if (!Array.isArray(questions) || !Array.isArray(books)) {
      throw new Error("Failed to load necessary data");
    }

    const { refArr, themeArr } = formData;

    const refArrFiltered = [...new Set(refArr)].filter(n => n);
    const themeArrFiltered = formData.themeArr.length === themes.length ? [] : [...new Set(themeArr)].filter(n => n);

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
    const contextArr = books
      .filter(book => scriptureRefs.some(ref => book.Book.toLowerCase().includes(ref.book)))
      .map(book => `${book.Book} is about ${book.Context} The author is ${book.Author}.`);

    // Filter questions without max limit
    const questionArr = questions.filter(q => {
      if (!q.book) return false;
      
      return scriptureRefs.some(ref => {
        const bookMatch = q.book.toLowerCase().includes(ref.book);
        const chapterMatch = ref.chapter === null || q.chapter === ref.chapter;
        
        // Check verse range overlap if specified
        let verseMatch = true;
        if (ref.verseStart !== null && ref.verseEnd !== null) {
          const qStart = parseInt(q.verseStart, 10);
          const qEnd = parseInt(q.verseEnd || q.verseStart, 10);
          verseMatch = (
            (qStart >= ref.verseStart && qStart <= ref.verseEnd) ||
            (qEnd >= ref.verseStart && qEnd <= ref.verseEnd) ||
            (qStart <= ref.verseStart && qEnd >= ref.verseEnd)
          );
        }
        
        return bookMatch && chapterMatch && verseMatch;
      });
    });

    return {
      refArr: refArrFiltered,
      themeArr: themeArrFiltered,
      contextArr,
      questionArr
    };
  } catch (error) {
    console.error("Study generation error:", error);
    throw error;
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
    
    const data = await response.json();
    return data.map(({ _id, __v, ...rest }) => rest); // Remove MongoDB internal fields
    
  } catch (error) {
    console.error("Fetch error:", error);
    throw new Error('Failed to load questions. Please try again.');
  }
};
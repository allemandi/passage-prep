import Papa from 'papaparse';
import { saveQuestionToServer, downloadCSV } from './apiService';

// Utility functions to read and parse CSV files
const parseCSV = async (file) => {
  return new Promise((resolve, reject) => {
    fetch(file)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${file}: ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: results => resolve(results.data),
          error: error => reject(error)
        });
      })
      .catch(error => reject(error));
  });
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

// Load books data from CSV
let booksCache = null;
export const getBooks = async () => {
  try {
    if (booksCache) return booksCache;
    
    const books = await parseCSV('/document/Books.csv');
    booksCache = books;
    return books;
  } catch (error) {
    console.error("Error loading Books data:", error);
    return [];
  }
};

// Load questions data from CSV
let questionsCache = null;
export const getQuestions = async () => {
  try {
    // Always reload questions to get the latest
    questionsCache = null;
    
    if (questionsCache) return questionsCache;
    
    const questions = await parseCSV('/document/Questions.csv');
    questionsCache = questions;
    return questions;
  } catch (error) {
    console.error("Error loading Questions data:", error);
    return [];
  }
};

// Save a new question to Questions.csv
export const saveQuestion = async (theme, question, reference) => {
  try {
    // Validate inputs
    if (!theme || !question || !reference) {
      console.error("Invalid question data:", { theme, question, reference });
      throw new Error("Missing required question data");
    }
    
    const newQuestion = {
      Theme: theme,
      Question: question,
      Subcategory: reference
    };
    
    // Log for debugging
    console.log("Saving new question:", newQuestion);
    
    // Try to save to server
    const serverSaved = await saveQuestionToServer('/document/Questions.csv', newQuestion);
    
    // If server save fails or we're running in development, download a CSV file
    if (!serverSaved) {
      console.log("Server save failed, downloading CSV instead");
      await downloadCSV(newQuestion, `question_${new Date().getTime()}.csv`);
      
      // Return true anyway, we've given the user a way to save the question
      return true;
    }
    
    // Clear the cache so we reload questions next time
    questionsCache = null;
    
    return true;
  } catch (error) {
    console.error("Error saving question:", error);
    
    // Try to download as fallback
    try {
      const newQuestion = {
        Theme: theme,
        Question: question,
        Subcategory: reference
      };
      await downloadCSV(newQuestion, `question_${new Date().getTime()}.csv`);
      return true;
    } catch (downloadError) {
      console.error("Failed to download CSV as fallback:", downloadError);
      return false;
    }
  }
};

// Process the form data and return study data
export const processForm = async (formData) => {
  // Get all questions and books
  const questions = await getQuestions();
  const books = await getBooks();
  
  // Process reference array (similar to the original code)
  const refArr = [...new Set(formData.refArr)].filter(n => n);
  
  // Sanitize Bible references to return only alphabetical characters
  const noVerseArr = refArr.map(ref => {
    if (!ref) return '';
    return ref.replace(/[\d:\.\-]+$/, '').toLowerCase().trim();
  }).filter(n => n);
  
  // Sanitize Bible references to include chapters
  const withChapterArr = refArr.map(ref => {
    if (!ref) return '';
    const sanitized = ref.replace(/[^A-Za-z\d:]/g, '').split(':');
    return sanitized[0].toLowerCase();
  }).filter(n => n);
  
  // Get unique themes
  const themeArr = [...new Set(formData.themeArr)].filter(n => n);
  
  // Filter books for context based on references
  const contextArr = books
    .filter(book => book.Book && noVerseArr.some(ref => 
      book.Book.toLowerCase().includes(ref) || ref.includes(book.Book.toLowerCase())
    ))
    .map(book => `${book.Book}: ${book.Context}`);
  
  console.log("Processing references:", refArr);
  console.log("Book-only references:", noVerseArr);
  console.log("With chapter references:", withChapterArr);
  console.log("Themes:", themeArr);
  
  // Filter questions based on themes and subcategory choice
  const questionsByTheme = themeArr.map(theme => {
    let filteredQuestions = questions.filter(q => q.Theme === theme);
    console.log(`Found ${filteredQuestions.length} questions for theme ${theme}`);
    
    // Apply subcategory filtering
    switch (formData.subChoice) {
      case 'General and Referenced Chapters':
        filteredQuestions = filteredQuestions.filter(q => 
          q.Subcategory.toLowerCase() === 'general' || 
          withChapterArr.some(chapter => q.Subcategory.toLowerCase().includes(chapter)) ||
          refArr.some(ref => q.Subcategory.includes(ref))
        );
        break;
      case 'Referenced Chapters Only':
        filteredQuestions = filteredQuestions.filter(q => 
          withChapterArr.some(chapter => q.Subcategory.toLowerCase().includes(chapter)) ||
          refArr.some(ref => q.Subcategory.includes(ref))
        );
        break;
      case 'Referenced Books Only':
        filteredQuestions = filteredQuestions.filter(q => 
          noVerseArr.some(book => q.Subcategory.toLowerCase().includes(book))
        );
        break;
      case 'General Only':
        filteredQuestions = filteredQuestions.filter(q => 
          q.Subcategory.toLowerCase() === 'general'
        );
        break;
      case 'General and Referenced Books':
        filteredQuestions = filteredQuestions.filter(q => 
          q.Subcategory.toLowerCase() === 'general' || 
          noVerseArr.some(book => q.Subcategory.toLowerCase().includes(book))
        );
        break;
      // 'All' returns all questions for the theme, so no filtering needed
    }
    
    console.log(`After subcategory filtering: ${filteredQuestions.length} questions for theme ${theme}`);
    
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
}; 
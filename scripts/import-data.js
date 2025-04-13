const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Book = require('../models/Book');
const Question = require('../models/Question');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'bible_study_app'
    });
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Read and parse a CSV file
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    Papa.parse(fileContent, {
      header: true,
      complete: (results) => {
        resolve(results.data.filter(item => Object.values(item).some(val => val)));
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Import Books data
const importBooks = async () => {
  try {
    const books = await parseCSV(path.join(__dirname, '../data/Books.csv'));
    
    console.log(`Found ${books.length} books to import`);
    
    // Clear existing books
    await Book.deleteMany({});
    
    // Import books
    for (const book of books) {
      await Book.create({
        Index: parseInt(book.Index),
        Book: book.Book,
        Author: book.Author,
        Context: book.Context
      });
    }
    
    console.log(`Successfully imported ${books.length} books to MongoDB`);
  } catch (error) {
    console.error('Error importing books:', error);
  }
};

// Import Questions data
const importQuestions = async () => {
  try {
    const questions = await parseCSV(path.join(__dirname, '../data/Questions.csv'));
    
    console.log(`Found ${questions.length} questions to import`);
    
    // Clear existing questions
    await Question.deleteMany({});
    
    // Import questions with all specified columns
    for (const question of questions) {
      await Question.create({
        theme: question.theme,
        question: question.question,
        book: question.book,
        chapter: question.chapter,
        verseStart: question.verseStart,
        verseEnd: question.verseEnd
      });
    }
    
    console.log(`Successfully imported ${questions.length} questions to MongoDB`);
  } catch (error) {
    console.error('Error importing questions:', error);
  }
};

// Add this right after your import functions in import-data.js
const createIndexesIfNeeded = async () => {
  try {
    const requiredIndexes = [
      { key: { book: 1 }, name: 'book_1' },
      { key: { chapter: 1 }, name: 'chapter_1' },
      { key: { verseStart: 1 }, name: 'verseStart_1' },
      { key: { verseEnd: 1 }, name: 'verseEnd_1' },
      { key: { theme: 1 }, name: 'theme_1' },
      { 
        key: { book: 1, chapter: 1, verseStart: 1, verseEnd: 1 },
        name: 'compound_scripture_ref' 
      }
    ];

    const existingIndexes = await Question.collection.indexes();
    const existingIndexNames = existingIndexes.map(idx => idx.name);

    for (const indexSpec of requiredIndexes) {
      if (!existingIndexNames.includes(indexSpec.name)) {
        await Question.collection.createIndex(indexSpec.key, { name: indexSpec.name });
        console.log(`Created index: ${indexSpec.name}`);
      }
    }
    
    console.log('Index verification complete');
  } catch (error) {
    console.error('Index management error:', error);
  }
};

// Main function
const importAll = async () => {
  const isConnected = await connectDB();
  
  if (isConnected) {
    console.log('Starting data import...');
    
    await importBooks();
    await importQuestions();
    
    // Call this after your import functions
    await createIndexesIfNeeded();
    
    console.log('Data import completed');
    process.exit(0);
  }
};

// Run the import
importAll();
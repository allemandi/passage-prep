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
    
    // Import questions
    for (const question of questions) {
      await Question.create({
        Theme: question.Theme,
        Question: question.Question,
        Subcategory: question.Subcategory
      });
    }
    
    console.log(`Successfully imported ${questions.length} questions to MongoDB`);
  } catch (error) {
    console.error('Error importing questions:', error);
  }
};

// Main function
const importAll = async () => {
  const isConnected = await connectDB();
  
  if (isConnected) {
    console.log('Starting data import...');
    
    await importBooks();
    await importQuestions();
    
    console.log('Data import completed');
    process.exit(0);
  }
};

// Run the import
importAll(); 
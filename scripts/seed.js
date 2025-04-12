const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const connectDB = require('../config/db');
const Book = require('../models/Book');
const Question = require('../models/Question');

// Connect to MongoDB
connectDB();

// Arrays to store parsed data
const books = [];
const questions = [];

// Process Books.csv
fs.createReadStream(path.join(__dirname, '../data/Books.csv'))
  .pipe(csv())
  .on('data', (data) => books.push(data))
  .on('end', async () => {
    try {
      console.log(`Processing ${books.length} books...`);
      
      for (const book of books) {
        // Check if book already exists by Index
        const existingBook = await Book.findOne({ Index: book.Index });
        
        if (!existingBook) {
          // Create new book if it doesn't exist
          await Book.create({
            Index: parseInt(book.Index),
            Book: book.Book,
            Author: book.Author,
            Context: book.Context
          });
          console.log(`Added book: ${book.Book}`);
        } else {
          console.log(`Book already exists: ${book.Book}`);
        }
      }
      
      console.log('Books seeding completed');
      
      // Process Questions after Books are done
      processQuestions();
    } catch (error) {
      console.error('Error seeding books:', error);
      process.exit(1);
    }
  });

// Process Questions.csv
const processQuestions = () => {
  fs.createReadStream(path.join(__dirname, '../data/Questions.csv'))
    .pipe(csv())
    .on('data', (data) => questions.push(data))
    .on('end', async () => {
      try {
        console.log(`Processing ${questions.length} questions...`);
        
        for (const question of questions) {
          // Check if question already exists by all fields (no unique identifier in CSV)
          const existingQuestion = await Question.findOne({
            Theme: question.Theme,
            Question: question.Question,
            Subcategory: question.Subcategory
          });
          
          if (!existingQuestion) {
            // Create new question if it doesn't exist
            await Question.create({
              Theme: question.Theme,
              Question: question.Question,
              Subcategory: question.Subcategory
            });
            console.log(`Added question: ${question.Question.substring(0, 30)}...`);
          } else {
            console.log(`Question already exists: ${question.Question.substring(0, 30)}...`);
          }
        }
        
        console.log('Questions seeding completed');
        console.log('Database seeding finished successfully!');
        process.exit(0);
      } catch (error) {
        console.error('Error seeding questions:', error);
        process.exit(1);
      }
    });
}; 
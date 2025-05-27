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

// Import Books data
const importBooks = async () => {
    try {
        const filePath = path.join(__dirname, '../data/Books.csv');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const results = Papa.parse(fileContent, {
            header: true
        });
        const books = results.data.filter(item => Object.values(item).some(val => val));

        if (results.errors && results.errors.length > 0) {
            console.warn(`Book import terminated. Papaparse errors encountered while parsing ${filePath}:`, results.errors);
            return;
        }

        console.log(`Found ${books.length} books to import`);

        // await Book.deleteMany({});

        // Import books
        for (const book of books) {
            await Book.create({
                index: parseInt(book.index),
                book: book.book,
                author: book.author,
                context: book.context
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
                verseEnd: question.verseEnd,
                isApproved: question.isApproved,
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
        await createIndexesIfNeeded();

        console.log('Data import completed');
        process.exit(0);
    }
};

// Run the import
importAll();
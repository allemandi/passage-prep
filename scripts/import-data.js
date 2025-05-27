const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
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

// Import Questions data
const importQuestions = async () => {
    try {
        const filePath = path.join(__dirname, '../data/allQuestions.csv');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const results = Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true
        });
        if (results.errors && results.errors.length > 0) {

            return console.warn(`Failed to parse questions. Papaparse errors encountered while parsing ${filePath}:`, results.errors);
        };
        const questions = results.data.filter(item => Object.values(item).some(val => val));

        console.log(`Found ${questions.length} questions to import`);

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
        // Comment out the line below to keep existing data
        await Question.deleteMany({});

        await importQuestions();
        await createIndexesIfNeeded();

        console.log('Data import completed');
        process.exit(0);
    }
};

// Run the import
importAll();
const mongoose = require('mongoose');
const Book = require('../../models/Book');
const Question = require('../../models/Question');
const Admin = require('../../models/Admin');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// --- DB Connection ---
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('MongoDB URI not found in environment variables');
  const client = await mongoose.connect(MONGODB_URI, {
    dbName: 'bible_study_app',
    serverSelectionTimeoutMS: 5000
  });
  cachedDb = client;
  return client;
}

// --- Book Logic ---
async function getAllBooks() {
  return await Book.find().sort({ index: 1 });
}

// --- Question Logic ---
async function getAllQuestions() {
  return await Question.find();
}

async function saveQuestion(newData) {
  if (!newData || !newData.theme || !newData.question || !newData.book || !newData.chapter || !newData.verseStart || !newData.verseEnd) {
    return { success: false, error: 'Missing required question data' };
  }
  
  try {
    const question = new Question({
      theme: newData.theme,
      question: newData.question,
      book: newData.book,
      chapter: newData.chapter,
      verseStart: newData.verseStart,
      verseEnd: newData.verseEnd,
      isApproved: newData.isApproved === true || false
    });
    await question.validate();
    await question.save();
    return { success: true };
  } catch (error) {
    return { 
      success: false,
      error: error.message || 'Failed to save question'
    };
  }
}

async function updateQuestion(questionId, updatedData) {
  if (!questionId || !updatedData) {
    return { success: false, error: 'Missing question ID or update data' };
  }
  const updatedQuestion = await Question.findByIdAndUpdate(
    questionId,
    { $set: updatedData },
    { new: true }
  );
  if (!updatedQuestion) {
    return { success: false, error: 'Question not found' };
  }
  return { success: true, updatedQuestion };
}

async function searchQuestions({ book, chapter, verseStart, verseEnd, themeArr }) {
  if (book) query.book = new RegExp(book, 'i');
  if (chapter) query.chapter = parseInt(chapter, 10);
  if (themeArr && themeArr.length > 0) query.theme = { $in: themeArr };

  const vStart = Number(verseStart);
  const vEnd = Number(verseEnd);
  const hasVStart = !isNaN(vStart);
  const hasVEnd = !isNaN(vEnd);

  if (hasVStart && hasVEnd && verseStart !== null && verseEnd !== null) {
    query.verseStart = { $lte: vEnd };
    query.verseEnd = { $gte: vStart };
  } else {
    if (hasVStart && verseStart !== null) {
      query.verseStart = vStart;
    }
    if (hasVEnd && verseEnd !== null) {
      query.verseEnd = vEnd;
    }
  }
  const questions = await Question.find(query);
  return questions;
}

async function approveQuestions(questionIds) {
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    return { success: false, error: 'No question IDs provided' };
  }
  await Question.updateMany(
    { _id: { $in: questionIds } },
    { $set: { isApproved: true } }
  );
  return { success: true };
}

async function getUnapprovedQuestions() {
  return await Question.find({ isApproved: false }).lean();
}

async function deleteQuestions(questionIds) {
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    return { success: false, error: 'No question IDs provided' };
  }
  await Question.deleteMany({ _id: { $in: questionIds } });
  return { success: true };
}

async function loginHandler({ username, password }) {
  const admin = await Admin.findOne({ username });
  if (!admin) return { success: false, error: 'Invalid credentials' };
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return { success: false, error: 'Invalid credentials' };
  return { success: true };
}

module.exports = {
  connectToDatabase,
  getAllBooks,
  getAllQuestions,
  saveQuestion,
  updateQuestion,
  searchQuestions,
  approveQuestions,
  getUnapprovedQuestions,
  deleteQuestions,
  loginHandler,
};

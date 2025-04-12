const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  theme: {
    type: String,
    required: true,
    trim: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  biblePassage: {
    type: String,
    required: true,
    trim: true
  }
});

// Prevent model recompilation error in serverless context
module.exports = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
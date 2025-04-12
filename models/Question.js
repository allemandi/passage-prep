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

module.exports = mongoose.model('Question', QuestionSchema);
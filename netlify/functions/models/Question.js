const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  Theme: {
    type: String,
    required: true,
    trim: true
  },
  Question: {
    type: String,
    required: true,
    trim: true
  },
  Subcategory: {
    type: String,
    required: true,
    trim: true
  }
});

// Prevent model recompilation error in serverless context
module.exports = mongoose.models.Question || mongoose.model('Question', QuestionSchema); 
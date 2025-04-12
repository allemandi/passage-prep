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

module.exports = mongoose.model('Question', QuestionSchema); 
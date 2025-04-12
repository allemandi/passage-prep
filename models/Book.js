const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  Index: {
    type: Number,
    required: true
  },
  Book: {
    type: String,
    required: true,
    trim: true
  },
  Author: {
    type: String,
    required: true,
    trim: true
  },
  Context: {
    type: String,
    required: true,
    trim: true
  }
});

module.exports = mongoose.model('Book', BookSchema); 
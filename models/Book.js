const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  index: {
    type: Number,
    required: true
  },
  book: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  context: {
    type: String,
    required: true,
    trim: true
  }
});

module.exports = mongoose.model('Book', BookSchema); 
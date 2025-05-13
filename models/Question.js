const mongoose = require('mongoose');
const themes = require('../src/data/themes.json');

const QuestionSchema = new mongoose.Schema({
  theme: {
    type: String,
    required: [true, 'Theme is required'],
    trim: true,
    enum: {
      values: themes,
      message: props => `${props.value} is not a valid theme`
    }
  },
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    minlength: [5, 'Question must be at least 5 characters long']
  },
  book: {
    type: String,
    required: [true, 'Book name is required'],
    trim: true
  },
  chapter: {
    type: Number,
    required: [true, 'Chapter number is required'],
    min: [1, 'Chapter must be at least 1']
  },
  verseStart: {
    type: Number,
    required: [true, 'Start verse is required'],
    min: [1, 'Start verse must be at least 1']
  },
  verseEnd: {
    type: Number,
    required: [true, 'End verse is required'],
    min: [1, 'End verse must be at least 1'],
    validate: {
      validator: function(value) {
        return value >= this.verseStart;
      },
      message: 'End verse must be greater than or equal to start verse'
    }
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Question', QuestionSchema);
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const Book = require('./models/Book');
const Question = require('./models/Question');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'build')));

// API endpoint to get all books
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find().sort({ Index: 1 });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books', details: error.message });
  }
});

// API endpoint to get all questions
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions', details: error.message });
  }
});

// API endpoint to save a question to MongoDB
app.post('/api/save-question', async (req, res) => {
  try {
    const { newData } = req.body;
    
    if (!newData || !newData.theme || !newData.question || !newData.biblePassage) {
      return res.status(400).json({ error: 'Missing required question data' });
    }
    
    // Save to MongoDB
    const savedQuestion = await Question.create({
      theme: newData.theme,
      question: newData.question,
      biblePassage: newData.biblePassage
    });
    
    res.status(200).json({ success: true, message: 'Question saved successfully to MongoDB' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save question', details: error.message });
  }
});

// API endpoint to test if the server is reachable
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle shutdown signals properly
process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  shutdown();
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  shutdown();
});

// Clean shutdown function
function shutdown() {
  console.log('Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    
    // Close database connection
    console.log('Closing database connection...');
    if (connectDB.mongoose && connectDB.mongoose.connection) {
      try {
        connectDB.mongoose.connection.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
      }
    } else {
      console.log('No active MongoDB connection to close.');
      process.exit(0);
    }
  });
  
  // Failsafe: if we can't close connections in time, forcefully shut down
  setTimeout(() => {
    console.log('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 5000);
}
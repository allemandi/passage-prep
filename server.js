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

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API endpoint to get all books
app.get('/api/books', async (req, res) => {
  try {
    console.log('Fetching books from MongoDB...');
    const books = await Book.find().sort({ Index: 1 });
    console.log(`Retrieved ${books.length} books from MongoDB`);
    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books', details: error.message });
  }
});

// API endpoint to get all questions
app.get('/api/questions', async (req, res) => {
  try {
    console.log('Fetching questions from MongoDB...');
    const questions = await Question.find();
    console.log(`Retrieved ${questions.length} questions from MongoDB`);
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions', details: error.message });
  }
});

// API endpoint to save a question to MongoDB
app.post('/api/save-question', async (req, res) => {
  try {
    console.log('Received request to save question. Body:', JSON.stringify(req.body));
    const { newData } = req.body;
    
    if (!newData || !newData.Theme || !newData.Question || !newData.Subcategory) {
      console.error('Missing required question data:', newData);
      return res.status(400).json({ error: 'Missing required question data' });
    }
    
    console.log('Validated request. Saving question:', newData);
    
    // Save to MongoDB
    const savedQuestion = await Question.create({
      Theme: newData.Theme,
      Question: newData.Question,
      Subcategory: newData.Subcategory
    });
    
    console.log(`Question successfully added to MongoDB with ID: ${savedQuestion._id}`);
    
    res.status(200).json({ success: true, message: 'Question saved successfully to MongoDB' });
  } catch (error) {
    console.error('Error saving question:', error);
    res.status(500).json({ error: 'Failed to save question', details: error.message });
  }
});

// API endpoint to test if the server is reachable
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/save-question`);
}); 
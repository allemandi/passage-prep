const fs = require('fs');
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const {
  connectToDatabase,
  getAllBooks,
  getAllQuestions,
  saveQuestion,
  updateQuestion,
  searchQuestions,
  approveQuestions,
  getUnapprovedQuestions,
  loginHandler,
  deleteQuestions
} = require('./src/utils/server');
const Question = require('./models/Question');
const { parseCSV, processBulkUpload } = require('./src/utils/dataProcessor');

// Connect to MongoDB
connectToDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const indexPath = path.join(__dirname, 'build', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('\nERROR: The file ' + indexPath + ' was not found.');
  console.error('This usually means the frontend application has not been built yet.');
  console.error('Please run the build command (e.g., `npm run build` or `yarn build`) before starting the server.');
  console.error('Aborting server startup.\n');
  process.exit(1);
}
app.use(express.static(path.join(__dirname, 'build')));

// API endpoint to get all books
app.get('/api/books', async (req, res) => {
  try {
    const books = await getAllBooks();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books', details: error.message });
  }
});

// API endpoint to get all questions
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await getAllQuestions();
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions', details: error.message });
  }
});

// API endpoint to save a question to MongoDB
app.post('/api/save-question', async (req, res) => {
  try {
    const { newData } = req.body;
    const result = await saveQuestion(newData);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to test if the server is reachable
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// New endpoint in server.js
app.post('/api/search-questions', async (req, res) => {
  try {
    const results = await searchQuestions(req.body);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
    // Ensure mongoose is available for shutdown
    const mongoose = require('mongoose');
    if (mongoose && mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        mongoose.connection.close();
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

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await loginHandler({ username, password });
    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve questions endpoint
app.post('/api/approve-questions', async (req, res) => {
  try {
    const { questionIds } = req.body;
    const result = await approveQuestions(questionIds);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all unapproved questions
app.get('/api/unapproved-questions', async (req, res) => {
  try {
    const results = await getUnapprovedQuestions();
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this endpoint in server.js
app.get('/api/all-questions', async (req, res) => {
  try {
    const results = await Question.find().select('-_id -__v').lean(); // Exclude _id and __v
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete questions endpoint
app.post('/api/delete-questions', async (req, res) => {
  try {
    const { questionIds } = req.body;
    const result = await deleteQuestions(questionIds);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update question endpoint
app.post('/api/update-question', async (req, res) => {
  try {
    const { questionId, updatedData } = req.body;
    const result = await updateQuestion(questionId, updatedData);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json(result.updatedQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk upload questions endpoint
app.post('/api/bulk-upload', async (req, res) => {
  try {
    let questions = [];
    if (req.body.questions && Array.isArray(req.body.questions)) {
      questions = req.body.questions;
    } else if (req.body.csvText) {
      questions = parseCSV(req.body.csvText);
    } else {
      return res.status(400).json({ error: 'No questions provided or invalid format' });
    }
    
    if (questions.length === 0) {
      return res.status(400).json({ error: 'No valid questions found' });
    }
    
    // Use the new processBulkUpload function
    const results = await processBulkUpload(questions, saveQuestion);
    
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to process bulk upload', 
      details: error.message 
    });
  }
});
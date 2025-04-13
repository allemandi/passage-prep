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
    
    // Validate all required fields
    if (!newData?.theme || !newData?.question || !newData?.book || !newData?.chapter || !newData?.verseStart) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Save to MongoDB
    await Question.create({
      theme: newData.theme,
      question: newData.question,
      book: newData.book,
      chapter: newData.chapter,
      verseStart: newData.verseStart,
      verseEnd: newData.verseEnd || newData.verseStart, // Default to verseStart
    });

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
    console.log('Received raw body:', JSON.stringify(req.body, null, 2));

    const { book, chapter, verseStart, verseEnd, theme } = req.body;

    // Validate required fields
    if (!book) {
      return res.status(400).json({ error: "Book is required" });
    }

    // Build query with proper type conversion
    const query = {
      book: book.trim(),
      ...(chapter && { chapter: parseInt(chapter, 10) })
    };

    // Handle verse range
    if (verseStart !== undefined) {
      const start = parseInt(verseStart, 10);
      const end = verseEnd !== undefined ? parseInt(verseEnd, 10) : start;
      
      query.$and = [
        { verseStart: { $lte: end } },
        { verseEnd: { $gte: start } }
      ];
    }

    // Add theme filter
    if (theme?.length) {
      query.theme = { $in: Array.isArray(theme) ? theme : [theme] };
    }

    console.log('Executing MongoDB query:', JSON.stringify(query, null, 2));

    const results = await Question.find(query)
      .sort({ book: 1, chapter: 1, verseStart: 1 })
      .lean();

    console.log(`Found ${results.length} matching questions`);
    res.status(200).json(results);
  } catch (error) {
    console.error("Search failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to parse scripture references
function parseScriptureReference(ref) {
  const match = ref.match(/^(\d*\s*[A-Za-z]+)\s*(\d+)?(?::(\d+)(?:-(\d+))?)?$/i);
  if (!match) return null;

  const verseStart = match[3] ? parseInt(match[3]) : null;
  const verseEnd = match[4] ? parseInt(match[4]) : verseStart; // Default to verseStart if not specified

  return {
    book: match[1].trim(),
    chapter: match[2] ? parseInt(match[2]) : null,
    verseStart,
    verseEnd
  };
}

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
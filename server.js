const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const {
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

// Function to parse CSV text safely (duplicated from serverless function for consistency)
function parseCSV(csvText) {
  // Split by lines and filter out empty lines
  const lines = csvText.split('\n').filter(line => line.trim());
  const result = [];

  // Get headers from first line
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Process data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let currentValue = '';
    let insideQuotes = false;
    
    // Parse CSV line character by character to handle quotes
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"' && (j === 0 || line[j-1] !== '\\')) {
        // Toggle inside quotes state (if not escaped)
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        // End of field
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        // Add character to current value
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue.trim());
    
    // Create object from headers and values
    const obj = {};
    headers.forEach((header, index) => {
      // Handle quoted values
      let value = values[index] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      // Replace escaped quotes with actual quotes
      value = value.replace(/\\"/g, '"');
      
      obj[header] = value;
    });
    
    result.push(obj);
  }
  
  return result;
}

// Bulk upload questions endpoint
app.post('/api/bulk-upload', async (req, res) => {
  try {
    // Handle both direct JSON input and CSV text
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
    
    const results = {
      totalQuestions: questions.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    // Load validation data directly
    const fs = require('fs');
    const path = require('path');
    
    // Load themes directly from JSON file
    const themesPath = path.join(__dirname, 'src/data/themes.json');
    const themes = JSON.parse(fs.readFileSync(themesPath, 'utf8'));
    
    // Load Bible data for book and verse validation
    const bibleDataPath = path.join(__dirname, 'src/data/bible-counts.json');
    const bibleData = JSON.parse(fs.readFileSync(bibleDataPath, 'utf8'));
    
    // Create validation helper functions
    const getBibleBooks = () => bibleData.map(book => book.book);
    
    const getChaptersForBook = (bookName) => {
      if (!bookName) return [];
      const book = bibleData.find(b => b.book.toLowerCase() === bookName.toLowerCase());
      if (!book) return [];
      return book.chapters.map(ch => ch.chapter);
    };
    
    const getVerseCountForBookAndChapter = (bookName, chapterNum) => {
      if (!bookName || !chapterNum) return 0;
      const book = bibleData.find(b => b.book.toLowerCase() === bookName.toLowerCase());
      if (!book) return 0;
      const chapter = book.chapters.find(ch => ch.chapter === chapterNum.toString());
      return chapter ? parseInt(chapter.verses, 10) : 0;
    };
    
    // Get valid book names for validation
    const validBooks = getBibleBooks();
    
    // Process each question
    for (const question of questions) {
      try {
        // Basic validation
        if (!question.theme || !question.question || !question.book || !question.chapter || !question.verseStart) {
          throw new Error(`Question missing required fields: ${JSON.stringify(question)}`);
        }

        // Validate theme
        if (!themes.includes(question.theme)) {
          throw new Error(`Invalid theme: "${question.theme}" - must be one of: ${themes.join(', ')}`);
        }

        // Validate book
        if (!validBooks.some(book => book.toLowerCase() === question.book.toLowerCase())) {
          throw new Error(`Invalid book: "${question.book}"`);
        }

        // Validate chapter
        const availableChapters = getChaptersForBook(question.book);
        const chapterNum = parseInt(question.chapter, 10);
        if (!availableChapters.includes(chapterNum.toString())) {
          throw new Error(`Invalid chapter for ${question.book}: ${question.chapter}`);
        }

        // Validate verse range
        const maxVerses = getVerseCountForBookAndChapter(question.book, chapterNum);
        const verseStart = parseInt(question.verseStart, 10);
        const verseEnd = parseInt(question.verseEnd || question.verseStart, 10);
        
        if (isNaN(verseStart) || verseStart < 1 || verseStart > maxVerses) {
          throw new Error(`Invalid verseStart for ${question.book} ${question.chapter}: ${question.verseStart} (max: ${maxVerses})`);
        }
        
        if (isNaN(verseEnd) || verseEnd < verseStart || verseEnd > maxVerses) {
          throw new Error(`Invalid verseEnd for ${question.book} ${question.chapter}: ${question.verseEnd} (must be between ${verseStart} and ${maxVerses})`);
        }

        // Prepare data for saving
        const validatedQuestion = {
          theme: question.theme,
          question: question.question,
          book: question.book,
          chapter: chapterNum,
          verseStart: verseStart,
          verseEnd: verseEnd,
          isApproved: question.isApproved === 'true' || question.isApproved === true || false
        };

        // Save question to database
        const saveResult = await saveQuestion(validatedQuestion);
        
        if (!saveResult.success) {
          throw new Error(saveResult.error || 'Failed to save question');
        }
        
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          question: question.question?.substring(0, 50) + '...',
          error: error.message
        });
      }
    }
    
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to process bulk upload', 
      details: error.message 
    });
  }
});
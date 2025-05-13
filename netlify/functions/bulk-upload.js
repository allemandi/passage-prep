const { connectToDatabase, saveQuestion } = require('../../src/utils/server');
const fs = require('fs');
const path = require('path');

// Function to parse CSV text safely
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

exports.handler = async function(event, context) {
  // Avoid cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const data = JSON.parse(event.body);
    
    // Handle both direct JSON input and CSV text
    let questions = [];
    if (data.questions && Array.isArray(data.questions)) {
      questions = data.questions;
    } else if (data.csvText) {
      questions = parseCSV(data.csvText);
    } else {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: 'No questions provided or invalid format' })
      };
    }
    
    if (questions.length === 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: 'No valid questions found' })
      };
    }

    const results = {
      totalQuestions: questions.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    // Load validation data directly
    // Load themes directly from JSON file
    const themesPath = path.join(__dirname, '../../src/data/themes.json');
    const themes = JSON.parse(fs.readFileSync(themesPath, 'utf8'));
    
    // Load Bible data for book and verse validation
    const bibleDataPath = path.join(__dirname, '../../src/data/bible-counts.json');
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
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(results)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        error: 'Failed to process bulk upload', 
        details: error.message 
      })
    };
  }
}; 
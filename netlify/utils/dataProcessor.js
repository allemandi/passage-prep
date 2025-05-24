const fs = require('fs');
const path = require('path');

// Function to parse CSV text safely
function parseCSV(csvText) {
  // Split by lines and filter out empty lines
  const lines = csvText.split('\n').filter(line => line.trim());
  const result = [];

  // Get headers from first line
  if (lines.length === 0) {
    return result; // Return empty if no lines/headers
  }
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

async function processBulkUpload(questions, saveQuestionFn) {
  const results = {
    totalQuestions: questions.length,
    successful: 0,
    failed: 0,
    errors: []
  };
  const themesPath = path.join(__dirname, '../../src/data/themes.json');
  const themes = JSON.parse(fs.readFileSync(themesPath, 'utf8'));
  const bibleDataPath = path.join(__dirname, '../../src/data/bible-counts.json');
  const bibleData = JSON.parse(fs.readFileSync(bibleDataPath, 'utf8'));
  const getBibleBooks = () => bibleData.map(book => book.book);
  
  const getChaptersForBook = (bookName) => {
    if (!bookName) return [];
    const book = bibleData.find(b => b.book.toLowerCase() === bookName.toLowerCase());
    if (!book) return [];
    return book.chapters.map(ch => ch.chapter);
  };
  
  const getVersesForChapter = (bookName, chapterNum) => {
    if (!bookName || !chapterNum) return 0;
    const book = bibleData.find(b => b.book.toLowerCase() === bookName.toLowerCase());
    if (!book) return 0;
    const chapterData = book.chapters.find(ch => ch.chapter === chapterNum.toString());
    return chapterData ? parseInt(chapterData.verses, 10) : 0;
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
      const foundBook = validBooks.find(book => book.toLowerCase() === question.book.toLowerCase());
      if (!foundBook) {
        throw new Error(`Invalid book: "${question.book}"`);
      }
      const validatedBookName = foundBook; // Use the case from bible-counts.json

      // Validate chapter
      const availableChapters = getChaptersForBook(validatedBookName);
      const chapterNum = parseInt(question.chapter, 10);
      if (isNaN(chapterNum) || !availableChapters.includes(chapterNum.toString())) {
        throw new Error(`Invalid chapter for ${validatedBookName}: ${question.chapter}`);
      }

      // Validate verse range
      const maxVerses = getVersesForChapter(validatedBookName, chapterNum);
      const verseStart = parseInt(question.verseStart, 10);
      const verseEnd = parseInt(question.verseEnd || question.verseStart, 10);
      
      if (isNaN(verseStart) || verseStart < 1 || verseStart > maxVerses) {
        throw new Error(`Invalid verseStart for ${validatedBookName} ${chapterNum}: ${question.verseStart} (max: ${maxVerses})`);
      }
      
      if (isNaN(verseEnd) || verseEnd < verseStart || verseEnd > maxVerses) {
        throw new Error(`Invalid verseEnd for ${validatedBookName} ${chapterNum}: ${question.verseEnd} (must be between ${verseStart} and ${maxVerses})`);
      }

      // Prepare data for saving
      const validatedQuestion = {
        theme: question.theme,
        question: question.question,
        book: validatedBookName, // Use validated book name
        chapter: chapterNum,
        verseStart: verseStart,
        verseEnd: verseEnd,
        isApproved: question.isApproved === 'true' || question.isApproved === true || false
      };

      // Save question to database using the provided function
      const saveResult = await saveQuestionFn(validatedQuestion);
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save question');
      }
      
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        question: question.question ? question.question.substring(0, 50) + '...' : 'Invalid question entry',
        error: error.message
      });
    }
  }
  
  return results;
}

module.exports = {
  parseCSV,
  processBulkUpload,
};

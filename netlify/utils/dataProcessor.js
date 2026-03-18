const fs = require('fs');
const path = require('path');
const { getBook, isValidChapter, isValidReference } = require('@allemandi/bible-validate')

async function processBulkUpload(questions, bulkSaveFn) {
  const results = {
    totalQuestions: questions.length,
    successful: 0,
    failed: 0,
    errors: []
  };
  const themesPath = path.join(__dirname, '../../src/data/themes.json');
  const themes = JSON.parse(fs.readFileSync(themesPath, 'utf8'));
  
  const validQuestions = [];

  for (const question of questions) {
    try {
      if (!question.theme || !question.question || !question.book || !question.chapter || !question.verseStart) {
        throw new Error(`Question missing required fields: ${JSON.stringify(question)}`);
      }
      if (!themes.includes(question.theme)) {
        throw new Error(`Invalid theme: "${question.theme}" - must be one of: ${themes.join(', ')}`);
      }
    
      const foundBook = getBook(question.book);
      if (!foundBook) {
        throw new Error(`Invalid book: "${question.book}"`);
      }
      const standardBookName = foundBook.book;

      const chapterNum = parseInt(question.chapter, 10);
      if (!isValidChapter(standardBookName, chapterNum)) {
        throw new Error(`Invalid chapter for ${standardBookName}: ${question.chapter}`);
      }
      const verseStart = parseInt(question.verseStart, 10);
      const verseEnd = parseInt(question.verseEnd || question.verseStart, 10);
      
      if (!isValidReference(standardBookName, chapterNum, verseStart, verseEnd)) {
        throw new Error(`Invalid verse references for ${standardBookName} ${chapterNum}.`);
      }

      validQuestions.push({
        theme: question.theme,
        question: question.question,
        book: standardBookName,
        chapter: chapterNum,
        verseStart: verseStart,
        verseEnd: verseEnd,
        isApproved: question.isApproved === 'true' || question.isApproved === true || false
      });
    } catch (error) {
      results.failed++;
      results.errors.push({
        question: question.question ? question.question.substring(0, 50) + '...' : 'Invalid question entry',
        error: error.message
      });
    }
  }

  if (validQuestions.length > 0) {
    try {
        await bulkSaveFn(validQuestions);
        results.successful = validQuestions.length;
    } catch (error) {
        // If insertMany fails (e.g. some validation failed in mongoose even if it passed here, or DB error)
        // Note: with ordered: false, it might still have inserted some.
        // But for simplicity in this refined version, we'll try to handle it.
        if (error.writeErrors) {
            results.successful = error.nInserted;
            results.failed += error.writeErrors.length;
            error.writeErrors.forEach(we => {
                results.errors.push({
                    question: 'Bulk insertion error',
                    error: we.errmsg || 'Failed to save question in bulk'
                });
            });
        } else {
            results.failed += validQuestions.length;
            results.errors.push({
                question: 'Bulk insertion failed',
                error: error.message
            });
        }
    }
  }
  
  return results;
}

module.exports = {
  processBulkUpload,
};

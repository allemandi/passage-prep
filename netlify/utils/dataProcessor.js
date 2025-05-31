const fs = require('fs');
const path = require('path');
const { getBook, isValidChapter, isValidReference } = require('@allemandi/bible-validate')

async function processBulkUpload(questions, saveQuestionFn) {
  const results = {
    totalQuestions: questions.length,
    successful: 0,
    failed: 0,
    errors: []
  };
  const themesPath = path.join(__dirname, '../../src/data/themes.json');
  const themes = JSON.parse(fs.readFileSync(themesPath, 'utf8'));
  
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

      const validatedQuestion = {
        theme: question.theme,
        question: question.question,
        book: standardBookName,
        chapter: chapterNum,
        verseStart: verseStart,
        verseEnd: verseEnd,
        isApproved: question.isApproved === 'true' || question.isApproved === true || false
      };

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
  processBulkUpload,
};

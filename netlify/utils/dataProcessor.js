const fs = require('fs');
const path = require('path');
const { getBook, isValidChapter, isValidReference } = require('@allemandi/bible-validate')
const { sanitizeInput } = require('./shared/sanitization');

const Question = require('../../models/Question');

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
  const processedBatch = [];

  // Pre-process questions: sanitize and validate basic structure
  for (const question of questions) {
    try {
      if (!question.theme || !question.question || !question.book || !question.chapter || !question.verseStart) {
        throw new Error(`Question missing required fields: ${JSON.stringify(question)}`);
      }
      if (!themes.includes(question.theme)) {
        throw new Error(`Invalid theme: "${question.theme}" - must be one of: ${themes.join(', ')}`);
      }

      const sanitizedQuestionText = sanitizeInput(question.question);
      const foundBook = getBook(question.book);
      if (!foundBook) {
        throw new Error(`Invalid book: "${question.book}"`);
      }
      const standardBookName = foundBook.book;
      const chapterNum = parseInt(question.chapter, 10);
      const verseStart = parseInt(question.verseStart, 10);
      const verseEnd = parseInt(question.verseEnd || question.verseStart, 10);

      if (!isValidChapter(standardBookName, chapterNum)) {
        throw new Error(`Invalid chapter for ${standardBookName}: ${question.chapter}`);
      }
      
      if (!isValidReference(standardBookName, chapterNum, verseStart, verseEnd)) {
        throw new Error(`Invalid verse references for ${standardBookName} ${chapterNum}.`);
      }

      processedBatch.push({
        theme: question.theme,
        question: sanitizedQuestionText,
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

  // Optimize: Batch check for duplicates against the database
  const batchTexts = processedBatch.map(q => q.question);
  const existingQuestions = await Question.find({ question: { $in: batchTexts } }).select('question');
  const existingTexts = new Set(existingQuestions.map(q => q.question));

  const seenInBatch = new Set();

  for (const q of processedBatch) {
    if (existingTexts.has(q.question)) {
      results.failed++;
      results.errors.push({
        question: q.question.substring(0, 50) + '...',
        error: 'A question with this exact text already exists in the database.'
      });
      continue;
    }

    if (seenInBatch.has(q.question)) {
      results.failed++;
      results.errors.push({
        question: q.question.substring(0, 50) + '...',
        error: 'Duplicate question text found within this upload batch.'
      });
      continue;
    }

    seenInBatch.add(q.question);
    validQuestions.push(q);
  }

  if (validQuestions.length > 0) {
    try {
        await bulkSaveFn(validQuestions);
        results.successful = validQuestions.length;
    } catch (error) {
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

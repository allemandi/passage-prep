const Question = require('../../models/Question');
const { filterXSS } = require('xss');
const { isValidReference } = require('@allemandi/bible-validate');

/**
 * Standardizes common symbols like smart quotes, dashes, and ellipses to their ASCII equivalents.
 */
const standardizeSymbols = (text) => {
    if (typeof text !== 'string') return text;
    return text
        .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'") // single quotes/apostrophes
        .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"') // double quotes
        .replace(/[\u2013\u2014\u2015]/g, '-') // dashes
        .replace(/\u2026/g, '...'); // ellipses
};

/**
 * Sanitizes input text to prevent XSS attacks and standardizes symbols.
 */
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    const standardized = standardizeSymbols(input);
    return filterXSS(standardized, {
        whiteList: {},
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script'],
    });
};

const questionService = {
    async getAllQuestions() {
        return await Question.find();
    },

    async saveQuestion(newData, isAdmin = false) {
        if (!newData || !newData.theme || !newData.question || !newData.book || !newData.chapter || !newData.verseStart || !newData.verseEnd) {
            throw new Error('Missing required question data');
        }

        if (!isValidReference(newData.book, parseInt(newData.chapter), parseInt(newData.verseStart), parseInt(newData.verseEnd))) {
            throw new Error(`Invalid Bible reference: ${newData.book} ${newData.chapter}:${newData.verseStart}-${newData.verseEnd}`);
        }

        // Sanitize string inputs
        const sanitizedNewData = { ...newData };
        Object.keys(sanitizedNewData).forEach(key => {
            if (typeof sanitizedNewData[key] === 'string') {
                sanitizedNewData[key] = sanitizeInput(sanitizedNewData[key]);
            }
        });

        // Basic security check: Check for identical recently submitted questions
        // (within the last 5 minutes to prevent rapid duplicate spam)
        // Skip this check for admin uploads
        if (!isAdmin) {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const existing = await Question.findOne({
                question: sanitizedNewData.question,
                createdAt: { $gte: fiveMinutesAgo }
            });

            if (existing) {
                throw new Error('Duplicate question detected. Please wait a few minutes before submitting again.');
            }
        }

        const question = new Question({
            theme: sanitizedNewData.theme,
            question: sanitizedNewData.question,
            book: sanitizedNewData.book,
            chapter: sanitizedNewData.chapter,
            verseStart: sanitizedNewData.verseStart,
            verseEnd: sanitizedNewData.verseEnd,
            isApproved: sanitizedNewData.isApproved === true
        });

        await question.validate();
        return await question.save();
    },

    async updateQuestion(questionId, updatedData) {
        if (!questionId || !updatedData) {
            throw new Error('Missing question ID or update data');
        }

        // If updating Bible reference fields, validate the combined result
        if (updatedData.book || updatedData.chapter || updatedData.verseStart || updatedData.verseEnd) {
            const existing = await Question.findById(questionId);
            if (!existing) throw new Error('Question not found');

            const book = updatedData.book || existing.book;
            const chapter = parseInt(updatedData.chapter || existing.chapter);
            const verseStart = parseInt(updatedData.verseStart || existing.verseStart);
            const verseEnd = parseInt(updatedData.verseEnd || existing.verseEnd);

            if (!isValidReference(book, chapter, verseStart, verseEnd)) {
                throw new Error(`Invalid Bible reference: ${book} ${chapter}:${verseStart}-${verseEnd}`);
            }
        }

        const sanitizedData = { ...updatedData };
        Object.keys(sanitizedData).forEach(key => {
            if (typeof sanitizedData[key] === 'string') {
                sanitizedData[key] = sanitizeInput(sanitizedData[key]);
            }
        });

        const updatedQuestion = await Question.findByIdAndUpdate(
            questionId,
            { $set: sanitizedData },
            { new: true }
        );
        if (!updatedQuestion) {
            throw new Error('Question not found');
        }
        return updatedQuestion;
    },

    async searchQuestions({ book, chapter, verseStart, verseEnd, themeArr }) {
        const query = {};
        if (book) query.book = new RegExp(book, 'i');
        if (chapter) query.chapter = parseInt(chapter, 10);
        if (themeArr && themeArr.length > 0) query.theme = { $in: themeArr };

        const vStart = Number(verseStart);
        const vEnd = Number(verseEnd);
        const hasVStart = !isNaN(vStart);
        const hasVEnd = !isNaN(vEnd);

        if (hasVStart && hasVEnd && verseStart !== null && verseEnd !== null) {
            query.verseStart = { $lte: vEnd };
            query.verseEnd = { $gte: vStart };
        } else {
            if (hasVStart && verseStart !== null) query.verseStart = vStart;
            if (hasVEnd && verseEnd !== null) query.verseEnd = vEnd;
        }
        return await Question.find(query);
    },

    async approveQuestions(questionIds) {
        if (!Array.isArray(questionIds) || questionIds.length === 0) {
            throw new Error('No question IDs provided');
        }
        return await Question.updateMany(
            { _id: { $in: questionIds } },
            { $set: { isApproved: true } }
        );
    },

    async getUnapprovedQuestions() {
        return await Question.find({ isApproved: false }).lean();
    },

    async deleteQuestions(questionIds) {
        if (!Array.isArray(questionIds) || questionIds.length === 0) {
            throw new Error('No question IDs provided');
        }
        return await Question.deleteMany({ _id: { $in: questionIds } });
    },

    async bulkSaveQuestions(questions) {
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('No questions provided');
        }

        const sanitizedQuestions = questions.map(q => {
            const sanitizedQ = { ...q };
            Object.keys(sanitizedQ).forEach(key => {
                if (typeof sanitizedQ[key] === 'string') {
                    sanitizedQ[key] = sanitizeInput(sanitizedQ[key]);
                }
            });
            return {
                theme: sanitizedQ.theme,
                question: sanitizedQ.question,
                book: sanitizedQ.book,
                chapter: parseInt(sanitizedQ.chapter),
                verseStart: parseInt(sanitizedQ.verseStart),
                verseEnd: parseInt(sanitizedQ.verseEnd),
                isApproved: sanitizedQ.isApproved === true
            };
        });

        return await Question.insertMany(sanitizedQuestions, { ordered: false });
    }
};

module.exports = questionService;

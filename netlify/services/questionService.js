const Question = require('../../models/Question');
const { filterXSS } = require('xss');
const { isValidReference } = require('@allemandi/bible-validate');

/**
 * Sanitizes input text to prevent XSS attacks.
 */
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return filterXSS(input, {
        whiteList: {},
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script'],
    });
};

const questionService = {
    async getAllQuestions() {
        return await Question.find();
    },

    async saveQuestion(newData) {
        if (!newData || !newData.theme || !newData.question || !newData.book || !newData.chapter || !newData.verseStart || !newData.verseEnd) {
            throw new Error('Missing required question data');
        }

        if (!isValidReference(newData.book, parseInt(newData.chapter), parseInt(newData.verseStart), parseInt(newData.verseEnd))) {
            throw new Error(`Invalid Bible reference: ${newData.book} ${newData.chapter}:${newData.verseStart}-${newData.verseEnd}`);
        }

        // Basic security check: Check for identical recently submitted questions
        // (within the last 5 minutes to prevent rapid duplicate spam)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const existing = await Question.findOne({
            question: sanitizeInput(newData.question),
            createdAt: { $gte: fiveMinutesAgo }
        });

        if (existing) {
            throw new Error('Duplicate question detected. Please wait a few minutes before submitting again.');
        }

        const question = new Question({
            theme: sanitizeInput(newData.theme),
            question: sanitizeInput(newData.question),
            book: sanitizeInput(newData.book),
            chapter: newData.chapter,
            verseStart: newData.verseStart,
            verseEnd: newData.verseEnd,
            isApproved: newData.isApproved === true || false
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

        const updatedQuestion = await Question.findByIdAndUpdate(
            questionId,
            { $set: updatedData },
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
    }
};

module.exports = questionService;

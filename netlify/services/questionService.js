const Question = require('../../models/Question');
const { isValidReference } = require('@allemandi/bible-validate');
const { sanitizeInput } = require('../../src/utils/sanitization.cjs');

const questionService = {
    async findDuplicate(sanitizedQuestion, excludeId = null) {
        const query = { question: sanitizedQuestion };
        if (excludeId) query._id = { $ne: excludeId };
        return await Question.findOne(query);
    },

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

        // Check for duplicates
        const existing = await this.findDuplicate(sanitizedNewData.question);
        if (existing) {
            throw new Error('This question already exists in our database.');
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

        const existingQuestion = await Question.findById(questionId);
        if (!existingQuestion) throw new Error('Question not found');

        // If updating Bible reference fields, validate the combined result
        if (updatedData.book || updatedData.chapter || updatedData.verseStart || updatedData.verseEnd) {
            const book = updatedData.book || existingQuestion.book;
            const chapter = parseInt(updatedData.chapter || existingQuestion.chapter);
            const verseStart = parseInt(updatedData.verseStart || existingQuestion.verseStart);
            const verseEnd = parseInt(updatedData.verseEnd || existingQuestion.verseEnd);

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

        // Check for duplicates if question text is updated
        if (sanitizedData.question) {
            const duplicate = await this.findDuplicate(sanitizedData.question, questionId);
            if (duplicate) {
                throw new Error('Update failed: This would create a duplicate question.');
            }
        }

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

    async searchQuestions({ book, chapter, verseStart, verseEnd, themeArr, isApproved }) {
        const query = {};
        if (book) query.book = new RegExp(book, 'i');
        if (chapter) query.chapter = parseInt(chapter, 10);
        if (themeArr && themeArr.length > 0) query.theme = { $in: themeArr };

        // Add support for isApproved filter
        if (isApproved !== undefined && isApproved !== null) {
            query.isApproved = isApproved === true || isApproved === 'true';
        }

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

        const questionsToApprove = await Question.find({ _id: { $in: questionIds } });

        // Check for duplicates within the approval batch
        const textsInBatch = new Set();
        for (const q of questionsToApprove) {
            if (textsInBatch.has(q.question)) {
                throw new Error(`Cannot approve: Multiple questions with the exact same text found in the selection.`);
            }
            textsInBatch.add(q.question);
        }

        // Check for duplicates in the database (Approved only)
        const existingApproved = await Question.find({
            question: { $in: Array.from(textsInBatch) },
            isApproved: true,
            _id: { $nin: questionIds }
        });

        if (existingApproved.length > 0) {
            throw new Error(`Cannot approve: One or more questions already exist as approved questions.`);
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

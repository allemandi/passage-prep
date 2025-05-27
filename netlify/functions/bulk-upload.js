const { connectToDatabase, saveQuestion } = require('../utils/db');
const { processBulkUpload } = require('../utils/dataProcessor');
const Papa = require('papaparse');

exports.handler = async function (event, context) {
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
        await connectToDatabase();
        const data = JSON.parse(event.body);

        let questions = [];
        if (data.questions && Array.isArray(data.questions)) {
            questions = data.questions;
        } else if (data.csvText) {
            const parseResults = Papa.parse(data.csvText, {
                header: true,
                skipEmptyLines: true
            });

            if (parseResults.errors && parseResults.errors.length > 0) {
                console.warn('CSV parsing errors encountered in bulk-upload.js:', parseResults.errors);
            }
            questions = parseResults.data;
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

        const results = await processBulkUpload(questions, saveQuestion);

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
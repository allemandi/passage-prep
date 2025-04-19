const { connectToDatabase } = require('./utils/db');
const Question = require('../../models/Question');

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
  try {
    await connectToDatabase();
    const { questionIds } = JSON.parse(event.body);
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No question IDs provided' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
    await Question.updateMany(
      { _id: { $in: questionIds } },
      { $set: { isApproved: true } }
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
}; 
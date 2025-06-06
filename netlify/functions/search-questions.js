const { connectToDatabase, searchQuestions } = require('../utils/db');

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    await connectToDatabase();
    const params = JSON.parse(event.body);
    const questions = await searchQuestions(params);
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questions)
    };
  } catch (error) {
    console.error('Search questions error:', error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        error: 'Failed to search questions', 
        details: error.message 
      })
    };
  }
};
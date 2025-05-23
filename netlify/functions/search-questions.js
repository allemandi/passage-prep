const { connectToDatabase, searchQuestions } = require('../utils/db');

exports.handler = async function(event, context) {
  // Make the database connection reusable to avoid cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Only allow POST method
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const params = JSON.parse(event.body);
    
    // Search for questions
    const questions = await searchQuestions(params);
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(questions)
    };
  } catch (error) {
    console.error('Search questions error:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        error: 'Failed to search questions', 
        details: error.message 
      })
    };
  }
};
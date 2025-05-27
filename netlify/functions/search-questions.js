const { connectToDatabase, searchQuestions } = require('../utils/db');

exports.handler = async function(event, context) {
  console.log("Netlify search-questions.js - Received event.body:", event.body);
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
    console.log("Netlify search-questions.js - Parsed params object:", params);
    console.log("Netlify search-questions.js - params.verseStart:", params.verseStart);
    console.log("Netlify search-questions.js - params.verseEnd:", params.verseEnd);

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
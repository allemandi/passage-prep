const { connectToDatabase, getAllQuestions } = require('../../src/utils/server');

exports.handler = async function(event, context) {
  // Make the database connection reusable to avoid cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get all questions
    const questions = await getAllQuestions();
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(questions)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        error: 'Failed to fetch questions', 
        details: error.message 
      })
    };
  }
}; 
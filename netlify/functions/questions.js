const { connectToDatabase } = require('./utils/db');
const Question = require('./models/Question');

exports.handler = async function(event, context) {
  // Make the database connection reusable to avoid cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get all questions
    const questions = await Question.find();
    
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
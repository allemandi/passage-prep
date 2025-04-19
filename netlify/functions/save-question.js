const { connectToDatabase } = require('./utils/db');
const Question = require('../../models/Question');

exports.handler = async function(event, context) {
  // Make the database connection reusable to avoid cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  try {
    // Parse the request body
    const data = JSON.parse(event.body);
    const { newData } = data;
    
    // Validate the data
    if (!newData || !newData.theme || !newData.question || !newData.book || !newData.chapter || !newData.verseStart || !newData.verseEnd ) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ error: 'Missing required question data' })
      };
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Save to MongoDB
    await Question.create({
      theme: newData.theme,
      question: newData.question,
      book: newData.book,
      chapter: newData.chapter,
      verseStart: newData.verseStart,
      verseEnd: newData.verseEnd,
    });
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Question saved successfully to MongoDB' 
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        error: 'Failed to save question', 
        details: error.message 
      })
    };
  }
};

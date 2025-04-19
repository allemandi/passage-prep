const { connectToDatabase, saveQuestion } = require('../../src/utils/server');

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
    // Connect to the database
    await connectToDatabase();
    
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
    
    const result = await saveQuestion(newData);
    if (!result.success) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ error: result.error })
      };
    }
    
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

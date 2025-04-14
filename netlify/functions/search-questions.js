const { connectToDatabase } = require('./utils/db');
const Question = require('./models/Question');

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

    // Parse the request body
    const { book, chapter, verseStart, verseEnd, theme } = JSON.parse(event.body);

    // Build the query
    const query = {};
    if (book) query.book = new RegExp(book, 'i');
    if (chapter) query.chapter = parseInt(chapter, 10);
    if (verseStart) query.verseStart = parseInt(verseStart, 10);
    if (verseEnd) query.verseEnd = parseInt(verseEnd, 10);
    if (theme && theme.length > 0) {
      query.theme = { $in: theme };
    }

    // Connect to the database
    await connectToDatabase();
    
    // Search for questions
    const questions = await Question.find(query);
    
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
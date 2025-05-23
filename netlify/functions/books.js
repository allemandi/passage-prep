const { connectToDatabase, getAllBooks } = require('../utils/db');

exports.handler = async function(event, context) {
  // Make the database connection reusable to avoid cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get all books, sorted by Index
    const books = await getAllBooks();
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(books)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        error: 'Failed to fetch books', 
        details: error.message 
      })
    };
  }
}; 
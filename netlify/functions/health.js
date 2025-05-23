const { connectToDatabase } = require('../utils/db');

// Health Check Function
exports.handler = async function(event, context) {
  // Make this function run until it's completed
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Try to connect to the database
    const mongoose = await connectToDatabase();
    
    // Check collections count if connection was successful
    const bookCount = await mongoose.connection.db.collection('books').countDocuments();
    const questionCount = await mongoose.connection.db.collection('questions').countDocuments();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'OK',
        message: 'Server is running and connected to MongoDB',
        data: {
          books: bookCount,
          questions: questionCount,
          mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        }
      })
    };
  } catch (error) {
    console.error('Health check error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'ERROR',
        message: 'Server is running but database connection failed',
        error: error.message
      })
    };
  }
}; 
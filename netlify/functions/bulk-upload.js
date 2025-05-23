const { connectToDatabase, saveQuestion } = require('../utils/db');
const { parseCSV, processBulkUpload } = require('../utils/dataProcessor');

exports.handler = async function(event, context) {
  // Avoid cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const data = JSON.parse(event.body);
    
    // Handle both direct JSON input and CSV text
    let questions = [];
    if (data.questions && Array.isArray(data.questions)) {
      questions = data.questions;
    } else if (data.csvText) {
      questions = parseCSV(data.csvText);
    } else {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: 'No questions provided or invalid format' })
      };
    }
    
    if (questions.length === 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: 'No valid questions found' })
      };
    }
    
    // Use the new processBulkUpload function
    const results = await processBulkUpload(questions, saveQuestion);
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(results)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        error: 'Failed to process bulk upload', 
        details: error.message 
      })
    };
  }
}; 
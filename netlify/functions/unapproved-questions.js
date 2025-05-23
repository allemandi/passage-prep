const { connectToDatabase, getUnapprovedQuestions } = require('../utils/db');

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase();
    const results = await getUnapprovedQuestions();
    return {
      statusCode: 200,
      body: JSON.stringify(results),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
}; 
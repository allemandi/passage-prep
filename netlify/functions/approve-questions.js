const { connectToDatabase, approveQuestions } = require('../../src/utils/server');

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
  try {
    await connectToDatabase();
    const { questionIds } = JSON.parse(event.body);
    const result = await approveQuestions(questionIds);
    if (!result.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: result.error }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
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
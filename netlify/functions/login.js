const { connectToDatabase, loginHandler } = require('../utils/db');

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
    const { username, password } = JSON.parse(event.body);
    const result = await loginHandler({ username, password });
    if (!result.success) {
      return {
        statusCode: 401,
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
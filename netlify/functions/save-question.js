const { connectToDatabase } = require('../utils/db');
const { saveQuestion } = require('../services/questionService');
const { success, error, methodNotAllowed } = require('../utils/response');

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  
  try {
    await connectToDatabase();
    const { newData } = JSON.parse(event.body);
    
    const result = await saveQuestion(newData);
    
    return success({
      success: true,
      message: 'Question saved successfully',
      data: result
    });
  } catch (err) {
    return error(err.message === 'Missing required question data' ? 400 : 500, err.message);
  }
};

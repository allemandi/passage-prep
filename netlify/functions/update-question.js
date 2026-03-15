const { connectToDatabase } = require('../utils/db');
const { updateQuestion } = require('../services/questionService');
const { success, error, methodNotAllowed } = require('../utils/response');

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  try {
    await connectToDatabase();
    const { questionId, updatedData } = JSON.parse(event.body);
    const updatedQuestion = await updateQuestion(questionId, updatedData);
    return success({ success: true, updatedQuestion });
  } catch (err) {
    return error(500, err.message);
  }
};

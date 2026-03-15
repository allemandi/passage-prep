const { connectToDatabase } = require('../utils/db');
const { deleteQuestions } = require('../services/questionService');
const { success, error, methodNotAllowed } = require('../utils/response');

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  try {
    await connectToDatabase();
    const { questionIds } = JSON.parse(event.body);
    const result = await deleteQuestions(questionIds);
    return success({ success: true, result });
  } catch (err) {
    return error(500, err.message);
  }
};

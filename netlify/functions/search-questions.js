const { connectToDatabase, searchQuestions } = require('../utils/db');
const { success, error, methodNotAllowed } = require('../utils/response');

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  try {
    await connectToDatabase();
    const params = JSON.parse(event.body);
    const questions = await searchQuestions(params);
    return success(questions);
  } catch (err) {
    return error(500, 'Failed to search questions', err.message);
  }
};

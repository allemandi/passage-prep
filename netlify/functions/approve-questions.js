const { connectToDatabase, approveQuestions } = require('../utils/db');
const { success, error, methodNotAllowed } = require('../utils/response');

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  try {
    await connectToDatabase();
    const { questionIds } = JSON.parse(event.body);
    const result = await approveQuestions(questionIds);
    if (!result.success) {
      return error(400, result.error);
    }
    return success({ success: true });
  } catch (err) {
    return error(500, err.message);
  }
};

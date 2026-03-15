const { connectToDatabase, getAllQuestions } = require('../utils/db');
const { success, error } = require('../utils/response');

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    await connectToDatabase();
    const questions = await getAllQuestions();
    return success(questions);
  } catch (err) {
    return error(500, 'Failed to fetch questions', err.message);
  }
};

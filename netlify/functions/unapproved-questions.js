const { connectToDatabase } = require('../utils/db');
const { getUnapprovedQuestions } = require('../services/questionService');
const { success, error } = require('../utils/response');

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase();
    const results = await getUnapprovedQuestions();
    return success(results);
  } catch (err) {
    return error(500, err.message);
  }
};

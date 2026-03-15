const { connectToDatabase, getUnapprovedQuestions } = require('../utils/db');
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

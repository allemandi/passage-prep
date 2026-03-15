const { connectToDatabase, loginHandler } = require('../utils/db');
const { success, error, methodNotAllowed } = require('../utils/response');

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  try {
    await connectToDatabase();
    const { username, password } = JSON.parse(event.body);
    const result = await loginHandler({ username, password });

    if (!result.success) {
      return error(401, result.error);
    }
    return success({ success: true });
  } catch (err) {
    return error(500, err.message);
  }
};

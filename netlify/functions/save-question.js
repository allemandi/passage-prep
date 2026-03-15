const { connectToDatabase, saveQuestion } = require('../utils/db');
const { success, error, methodNotAllowed } = require('../utils/response');

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  
  try {
    await connectToDatabase();
    const { newData } = JSON.parse(event.body);
    
    if (!newData || !newData.theme || !newData.question || !newData.book || !newData.chapter || !newData.verseStart || !newData.verseEnd ) {
      return error(400, 'Missing required question data');
    }
    
    const result = await saveQuestion(newData);
    if (!result.success) {
      return error(400, result.error);
    }
    
    return success({
      success: true,
      message: 'Question saved successfully'
    });
  } catch (err) {
    return error(500, 'Failed to save question', err.message);
  }
};

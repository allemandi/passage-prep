const success = (body) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const error = (statusCode, message, details) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ error: message, details }),
});

const methodNotAllowed = () => error(405, 'Method not allowed');

module.exports = { success, error, methodNotAllowed };

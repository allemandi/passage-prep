const { filterXSS } = require('xss');

/**
 * Standardizes common symbols like smart quotes, dashes, and ellipses to their ASCII equivalents.
 * @param {string} text - The input text to standardize.
 * @returns {string} The standardized text.
 */
const standardizeSymbols = (text) => {
  if (typeof text !== 'string') return text;
  return text
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'") // single quotes/apostrophes
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"') // double quotes
    .replace(/[\u2013\u2014\u2015]/g, '-') // dashes
    .replace(/\u2026/g, '...'); // ellipses
};

/**
 * Sanitizes input text to prevent XSS attacks and standardizes symbols.
 * @param {string} input - The input text to sanitize.
 * @returns {string} The sanitized and standardized text.
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  const standardized = standardizeSymbols(input);
  return filterXSS(standardized, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true, // Remove all HTML tags
    stripIgnoreTagBody: ['script'], // Remove script tags and their content
  });
};

module.exports = {
  standardizeSymbols,
  sanitizeInput,
};

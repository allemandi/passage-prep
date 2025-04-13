import { filterXSS } from 'xss';

/**
 * Sanitizes input text to prevent XSS attacks.
 * @param {string} input - The input text to sanitize.
 * @returns {string} The sanitized text.
 */
export const sanitizeInput = (input) => {
  return filterXSS(input, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true, // Remove all HTML tags
    stripIgnoreTagBody: ['script'], // Remove script tags and their content
  });
};

/**
 * Validates required fields.
 * @param {string} value - The input value to validate.
 * @param {string} fieldName - The name of the field for error messages.
 * @returns {string} An error message if validation fails, otherwise an empty string.
 */
export const validateRequired = (value, fieldName) => {
  if (!value || !value.trim()) {
    return `Please enter a ${fieldName}.`;
  }
  return '';
};

/**
 * Validates and sanitizes input fields.
 * @param {string} value - The input value.
 * @param {string} fieldName - The name of the field for error messages.
 * @returns {Object} { sanitizedValue: string, error: string }
 */
export const processInput = (value, fieldName) => {
  const sanitizedValue = sanitizeInput(value);
  const error = validateRequired(sanitizedValue, fieldName);
  return { sanitizedValue, error };
};

import { sanitizeInput } from './sanitization.cjs';

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

export { sanitizeInput };

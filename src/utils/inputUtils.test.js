import { describe, it, expect } from 'vitest';
import { sanitizeInput, validateRequired, processInput } from './inputUtils';

describe('inputUtils', () => {
  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script><p>Hello</p>';
      expect(sanitizeInput(input)).toBe('Hello');
    });

    it('should handle plain text', () => {
      const input = 'Normal text';
      expect(sanitizeInput(input)).toBe('Normal text');
    });

    it('should standardize smart quotes and other symbols', () => {
      const input = '“It’s a test—really…”';
      // “ -> "
      // ’ -> '
      // — -> -
      // … -> ...
      // ” -> "
      expect(sanitizeInput(input)).toBe('"It\'s a test-really..."');
    });
  });

  describe('validateRequired', () => {
    it('should return error message for empty input', () => {
      expect(validateRequired('', 'Name')).toBe('Please enter a Name.');
      expect(validateRequired('   ', 'Name')).toBe('Please enter a Name.');
    });

    it('should return empty string for valid input', () => {
      expect(validateRequired('Valid', 'Name')).toBe('');
    });
  });

  describe('processInput', () => {
    it('should sanitize and validate', () => {
      const result = processInput('<p>Test</p>', 'Field');
      expect(result.sanitizedValue).toBe('Test');
      expect(result.error).toBe('');
    });

    it('should return error for empty after sanitization', () => {
      const result = processInput('<p></p>', 'Field');
      expect(result.sanitizedValue).toBe('');
      expect(result.error).toBe('Please enter a Field.');
    });
  });
});

/**
 * Safe string matching utility
 * Prevents "Cannot read properties of undefined (reading 'match')" errors
 * 
 * @param {any} value - The value to match against
 * @param {RegExp|string} pattern - The regex pattern or string to match
 * @returns {RegExpMatchArray|null} - Match result or null
 */
export function safeStringMatch(value, pattern) {
  // Return null if value is not a string
  if (typeof value !== 'string') {
    return null;
  }
  
  // Return null if value is empty
  if (!value || value.trim() === '') {
    return null;
  }
  
  // Convert string pattern to RegExp if needed
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  
  try {
    return value.match(regex);
  } catch (error) {
    console.warn('safeStringMatch: Invalid regex pattern', error);
    return null;
  }
}

/**
 * Safe string includes check
 * @param {any} value - The value to check
 * @param {string} searchString - The string to search for
 * @returns {boolean}
 */
export function safeStringIncludes(value, searchString) {
  if (typeof value !== 'string' || !value) {
    return false;
  }
  return value.includes(searchString);
}

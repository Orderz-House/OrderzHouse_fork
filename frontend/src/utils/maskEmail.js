// src/utils/maskEmail.js
/**
 * Masks an email address for display
 * Rules:
 * - Keep first character of local-part
 * - Replace the rest of local-part with *
 * - Keep full domain
 * Example: lenakattab@gmail.com => l********@gmail.com
 * 
 * @param {string} email - Email address to mask
 * @returns {string} Masked email address, or empty string if email is invalid/undefined
 */
export const maskEmail = (email) => {
  // Guard: return empty string if email is undefined, null, or not a string
  if (!email || typeof email !== "string") {
    return "";
  }

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return "";
  }

  // Validate email format (basic check)
  const emailParts = trimmedEmail.split("@");
  if (emailParts.length !== 2) {
    // Invalid email format, return as-is or empty
    return "";
  }

  const [localPart, domain] = emailParts;

  // Guard: ensure localPart and domain exist
  if (!localPart || !domain) {
    return "";
  }

  // Keep first character of local-part, mask the rest
  const firstChar = localPart.charAt(0);
  const maskedLocalPart = firstChar + "*".repeat(Math.max(0, localPart.length - 1));

  // Return masked email: firstChar + stars + @ + domain
  return `${maskedLocalPart}@${domain}`;
};

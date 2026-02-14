/**
 * Format price with JD currency
 * Removes $ symbol and appends " JD" after numeric value
 * 
 * @param {number|string|null|undefined} value - Price value
 * @param {object} options - Formatting options
 * @param {string} options.suffix - Additional suffix (e.g., "/hr")
 * @returns {string} Formatted price string
 */
export function formatPrice(value, options = {}) {
  const { suffix = "" } = options;
  
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  
  // Convert to number if string
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    return "—";
  }
  
  // Format as integer if whole number, otherwise show decimals
  const formatted = Number.isInteger(numValue) 
    ? numValue.toString() 
    : numValue.toFixed(2).replace(/\.?0+$/, "");
  
  return `${formatted} JD${suffix}`;
}

/**
 * Format bidding range (min - max)
 * 
 * @param {number|string|null|undefined} min - Minimum price
 * @param {number|string|null|undefined} max - Maximum price
 * @returns {string} Formatted range string
 */
export function formatBiddingRange(min, max) {
  const minFormatted = formatPrice(min);
  const maxFormatted = formatPrice(max ?? min);
  
  if (minFormatted === "—" && maxFormatted === "—") {
    return "—";
  }
  
  if (minFormatted === "—") {
    return maxFormatted;
  }
  
  if (maxFormatted === "—") {
    return minFormatted;
  }
  
  return `${minFormatted} - ${maxFormatted}`;
}

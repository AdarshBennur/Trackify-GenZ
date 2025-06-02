/**
 * Utility functions for Indian currency formatting
 */

/**
 * Format amount in Indian currency format (INR)
 * @param {number|string} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the ₹ symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatINR = (amount, showSymbol = true) => {
  // Handle null, undefined, or empty values
  if (amount === null || amount === undefined || amount === '') {
    return showSymbol ? '₹0.00' : '0.00';
  }

  // Convert to number
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle NaN
  if (isNaN(numAmount)) {
    return showSymbol ? '₹0.00' : '0.00';
  }

  // Use Intl.NumberFormat for Indian currency formatting
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const formatted = formatter.format(numAmount);
  
  // If showSymbol is false, remove the ₹ symbol
  return showSymbol ? formatted : formatted.replace('₹', '').trim();
};

/**
 * Format amount in Indian numbering system without currency symbol
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted number string
 */
export const formatIndianNumber = (amount) => {
  return formatINR(amount, false);
};

/**
 * Format amount for display in charts and tables
 * @param {number|string} amount - The amount to format
 * @param {boolean} compact - Whether to use compact notation (K, L, Cr)
 * @returns {string} Formatted currency string
 */
export const formatINRCompact = (amount, compact = false) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
    return '₹0';
  }

  if (!compact) {
    return formatINR(numAmount);
  }

  // Indian compact notation
  if (numAmount >= 10000000) { // 1 Crore
    return `₹${(numAmount / 10000000).toFixed(1)}Cr`;
  } else if (numAmount >= 100000) { // 1 Lakh
    return `₹${(numAmount / 100000).toFixed(1)}L`;
  } else if (numAmount >= 1000) { // 1 Thousand
    return `₹${(numAmount / 1000).toFixed(1)}K`;
  }
  
  return formatINR(numAmount);
};

/**
 * Parse INR formatted string back to number
 * @param {string} formattedAmount - The formatted currency string
 * @returns {number} Parsed number
 */
export const parseINR = (formattedAmount) => {
  if (!formattedAmount) return 0;
  
  // Remove currency symbol and commas, then parse
  const cleanAmount = formattedAmount.toString().replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleanAmount);
  
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Validate if a string is a valid currency amount
 * @param {string} amount - The amount string to validate
 * @returns {boolean} Whether the amount is valid
 */
export const isValidAmount = (amount) => {
  if (!amount) return false;
  
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount >= 0;
};

/**
 * Format amount for input fields (no symbol, but with Indian formatting)
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted number for input
 */
export const formatForInput = (amount) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
    return '';
  }
  
  return numAmount.toString();
};

// Export default formatINR function
export default formatINR; 
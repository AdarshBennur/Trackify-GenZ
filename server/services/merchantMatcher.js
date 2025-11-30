const stringSimilarity = require('string-similarity');
const merchantDictionary = require('../data/merchantDictionary.json');

// Convert dictionary to uppercase keys for case-insensitive matching
const merchantMap = Object.keys(merchantDictionary).reduce((acc, key) => {
    acc[key.toUpperCase()] = merchantDictionary[key];
    return acc;
}, {});

// Get list of merchant names for fuzzy matching
const merchantNames = Object.values(merchantDictionary);

/**
 * Match and normalize vendor name
 * @param {string} rawVendor - Raw vendor string from email
 * @returns {Object} - { vendor, confidence }
 */
function matchVendor(rawVendor) {
    if (!rawVendor) {
        return { vendor: 'Unknown', confidence: 'low' };
    }

    const cleanVendor = rawVendor.trim().toUpperCase();

    // 1. Exact match in dictionary
    for (const [key, value] of Object.entries(merchantMap)) {
        if (cleanVendor.includes(key)) {
            return { vendor: value, confidence: 'high' };
        }
    }

    // 2. Fuzzy match
    const matches = stringSimilarity.findBestMatch(cleanVendor, merchantNames);
    const bestMatch = matches.bestMatch;

    if (bestMatch.rating >= 0.7) {
        return { vendor: bestMatch.target, confidence: 'high' };
    } else if (bestMatch.rating >= 0.5) {
        return { vendor: bestMatch.target, confidence: 'medium' };
    }

    // 3. No match - return cleaned raw vendor
    return {
        vendor: capitalize(rawVendor),
        confidence: 'low'
    };
}

/**
 * Capitalize string (first letter of each word)
 */
function capitalize(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Add new merchant to dictionary (for admin use)
 * @param {string} key - Dictionary key (usually uppercase short form)
 * @param {string} value - Full merchant name
 */
function addMerchant(key, value) {
    merchantMap[key.toUpperCase()] = value;
    merchantNames.push(value);
    // Note: This modifies in-memory only. Persist to file separately.
    return { success: true, key: key.toUpperCase(), value };
}

/**
 * Get all merchants
 */
function getAllMerchants() {
    return merchantMap;
}

module.exports = {
    matchVendor,
    addMerchant,
    getAllMerchants
};

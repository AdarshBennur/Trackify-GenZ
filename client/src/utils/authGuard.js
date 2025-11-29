// client/src/utils/authGuard.js

/**
 * Get stored auth token from localStorage
 * @returns {string|null} Token or null if not found
 */
export function getStoredToken() {
    try {
        return localStorage.getItem('token') || null;
    } catch (e) {
        console.error('Error accessing localStorage:', e);
        return null;
    }
}

/**
 * Check if token appears valid (basic JWT expiry check)
 * @param {string} token - JWT token
 * @returns {boolean} True if token appears valid
 */
export function isTokenLikelyValid(token) {
    if (!token) return false;

    try {
        // JWT format: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) return false;

        // Decode payload
        const payload = JSON.parse(atob(parts[1]));

        // Check expiry if present
        if (payload && payload.exp) {
            return payload.exp * 1000 > Date.now();
        }

        // If no exp, assume valid (server will verify)
        return true;
    } catch (e) {
        console.error('Token validation error:', e);
        return false;
    }
}

/**
 * Check if user is authenticated (has valid token)
 * @returns {boolean}
 */
export function hasValidAuth() {
    const token = getStoredToken();
    return isTokenLikelyValid(token);
}

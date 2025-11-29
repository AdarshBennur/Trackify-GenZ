// client/src/utils/requestWithAuth.js
import { requestWithRetry } from './apiClient';
import { getStoredToken, isTokenLikelyValid } from './authGuard';

/**
 * Make an authenticated API request with automatic retry
 * @param {object} config - Axios config
 * @param {number} retries - Number of retries
 * @returns {Promise} API response
 * @throws {Error} If no valid token or API fails
 */
export async function protectedRequest(config, retries = 2) {
    const token = getStoredToken();

    // Short-circuit: don't call protected endpoint without valid token
    if (!token || !isTokenLikelyValid(token)) {
        const err = new Error('No auth token present');
        err.code = 'NO_TOKEN';
        err.isAuthError = true;
        throw err;
    }

    // Attach token to request
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;

    // Use existing retry wrapper
    return requestWithRetry(config, retries);
}

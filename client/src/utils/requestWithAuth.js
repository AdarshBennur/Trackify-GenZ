import { getToken } from './token';
import { isTokenLikelyValid } from './authGuard';
import api from './apiClient';

/**
 * Wrapper for protected API requests that checks auth state first
 * @param {Object} options - Axios request options
 * @returns {Promise} - Axios response
 */
export const protectedRequest = async (options) => {
    // 1. Check if we have a token
    const token = getToken();

    // Short-circuit: don't call protected endpoint without valid token
    if (!token || !isTokenLikelyValid()) {
        const err = new Error('No auth token present');
        err.code = 'NO_TOKEN';
        err.isAuthError = true;
        throw err;
    }

    // 2. Make request using shared api instance
    // The interceptor will attach the token automatically
    // But we can ensure it's there if needed, though api interceptor does it.

    return api(options);
};

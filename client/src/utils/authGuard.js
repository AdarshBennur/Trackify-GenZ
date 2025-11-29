import { getToken } from './token';
import { jwtDecode } from 'jwt-decode';

/**
 * Check if a token exists and looks like a JWT
 * @returns {boolean}
 */
export function hasLikelyToken() {
    const token = getToken();
    if (!token) return false;
    // optional: quick JWT format check
    return token.split('.').length === 3;
}

/**
 * Check if the stored token is valid (exists and not expired)
 * @returns {boolean}
 */
export function isTokenLikelyValid() {
    const token = getToken();
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Combined check for auth status
 * @returns {boolean}
 */
export function hasValidAuth() {
    return hasLikelyToken() && isTokenLikelyValid();
}

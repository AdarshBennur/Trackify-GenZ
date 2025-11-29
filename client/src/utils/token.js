import api from './apiClient';

/**
 * Store authentication token and set axios header synchronously
 * @param {string} token - JWT token
 */
export function setToken(token) {
    if (!token) return;

    // Store in localStorage
    localStorage.setItem('token', token);

    // Set axios default header for all future requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    console.log('Token stored and axios header set');
}

/**
 * Get stored token from localStorage
 * @returns {string|null}
 */
export function getToken() {
    return localStorage.getItem('token');
}

/**
 * Clear token from localStorage and axios header
 */
export function clearToken() {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    console.log('Token cleared');
}

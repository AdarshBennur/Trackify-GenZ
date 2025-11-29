import axios from 'axios';
import { clearToken, getToken } from './token';

// Create single shared instance
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 20000 // 20s timeout
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;

// Response interceptor for smart 401 handling
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const status = error?.response?.status;
        const token = getToken();

        if (status === 401) {
            // If no token (visitor) => suppress toasts and return rejected promise
            if (!token) {
                // silently reject so pages can redirect via ProtectedRoute
                return Promise.reject(error);
            }

            // If token existed, we want to check if token really expired or server temporarily failing.
            // Avoid immediate token-clearing; attempt a single /auth/me check if not already refreshing.
            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    console.log('401 received with token. Verifying session with /auth/me...');
                    await api.get('/auth/me');
                    // if this passes, token is valid; just retry original request
                    console.log('Session verified. Retrying original request...');
                    isRefreshing = false;
                    return api(error.config); // retry original request
                } catch (e) {
                    console.log('Session verification failed. Clearing token.');
                    isRefreshing = false;
                    // token definitely invalid -> clear and show friendly message
                    clearToken();
                    // emit event to let app redirect gracefully
                    window.dispatchEvent(new CustomEvent('app:auth-expired'));
                    return Promise.reject(error);
                }
            }

            // if already refreshing, just reject
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

// Helper for retry logic (kept for backward compatibility if needed, but api instance is preferred)
export const requestWithRetry = async (options, retries = 3, backoff = 300) => {
    try {
        return await api(options);
    } catch (err) {
        if (retries > 0 && (!err.response || err.response.status >= 500)) {
            await new Promise(resolve => setTimeout(resolve, backoff));
            return requestWithRetry(options, retries - 1, backoff * 2);
        }
        throw err;
    }
};

export default api;

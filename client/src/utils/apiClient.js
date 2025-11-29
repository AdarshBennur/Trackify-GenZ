import axios from 'axios';
import { toast } from 'react-toastify';
import { getStoredToken } from './authGuard';

// Create axios instance with extended timeout for cold starts
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 12000, // 12 seconds to tolerate cold starts
});

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        // Handle 401 Unauthorized errors
        if (status === 401) {
            const token = getStoredToken();

            // If token existed but was rejected => session expired
            if (token) {
                // Clear invalid token
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];

                // Show friendly message
                toast.info('Session expired. Please sign in again.', {
                    toastId: 'session-expired' // Prevent duplicates
                });

                // Redirect to login after short delay
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            }
            // Else: no token => visitor trying to access protected route
            // Don't show toast - ProtectedRoute will handle redirect

            return Promise.reject(error);
        }

        // Handle other errors (500, 404, etc.)
        if (status >= 500) {
            toast.error('Server error. Please try again later.');
        } else if (status === 404) {
            toast.error('Resource not found.');
        } else if (error.message === 'Network Error') {
            toast.error('Network error. Check your connection.');
        }

        return Promise.reject(error);
    }
);

// Request with automatic retry and exponential backoff
async function requestWithRetry(config, retries = 3, delay = 800) {
    try {
        return await api(config);
    } catch (err) {
        if (retries <= 0) throw err;

        // Don't retry auth errors
        if (err.response?.status === 401) {
            throw err;
        }

        // Wait before retry with exponential backoff
        await new Promise(r => setTimeout(r, delay));
        return requestWithRetry(config, retries - 1, delay * 2);
    }
}

export { api, requestWithRetry };

import axios from 'axios';
import { toast } from 'react-toastify';

// Create an instance of axios with default configs
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add a request interceptor to attach token to every request
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching issues
    config.params = {
      ...config.params,
      _t: Date.now()
    };
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common error cases
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Get the status code
    const status = error.response ? error.response.status : null;
    
    // Get error message from the response if available
    const errorMsg = 
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : error.message;
    
    // Get the request URL to check specific endpoints
    const requestUrl = error.config?.url || '';
    
    // List of silent endpoints that shouldn't trigger toast errors automatically
    // These endpoints handle their errors gracefully in the component
    const silentEndpoints = [
      '/incomes/stats',
      'stats',
      'categories'
    ];
    
    // Check if the current endpoint is in the silent list
    const isSilentEndpoint = silentEndpoints.some(endpoint => requestUrl.includes(endpoint));
    
    // If this is a silent endpoint, just log the error without showing a toast
    if (isSilentEndpoint) {
      console.log(`Silent error handling for ${requestUrl}:`, errorMsg);
      return Promise.reject(error);
    }
    
    // Handle specific status codes
    switch (status) {
      case 401: // Unauthorized (authentication issues)
        console.error('Authentication error:', errorMsg);
        
        // Clear auth data when token is invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('guestMode');
        
        // Don't show toast for "not authenticated" as it can be normal flow
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
          toast.error('Authentication expired. Please log in again.');
          
          // Optionally redirect to login
          // window.location.href = '/login';
        }
        break;
        
      case 403: // Forbidden (authorization issues)
        console.error('Authorization error:', errorMsg);
        toast.error('You do not have permission to access this resource');
        break;
        
      case 404: // Not found
        console.error('Resource not found:', errorMsg);
        // Only show toast for API calls, not page navigation
        if (error.config && error.config.url && !error.config.url.includes('html')) {
          toast.error('The requested resource was not found');
        }
        break;
        
      case 500: // Server error
      case 502: // Bad gateway
      case 503: // Service unavailable
        console.error('Server error:', errorMsg);
        toast.error('Server error occurred. Please try again later.');
        break;
        
      default:
        // Don't show toast for cancelled requests
        if (axios.isCancel(error)) {
          console.log('Request canceled:', error.message);
        } else if (error.code === 'ECONNABORTED') {
          console.error('Request timeout:', errorMsg);
          toast.error('Request timed out. Please check your internet connection.');
        } else {
          console.error('API error:', errorMsg);
          toast.error('An error occurred. Please try again.');
        }
    }
    
    return Promise.reject(error);
  }
);

export default api; 
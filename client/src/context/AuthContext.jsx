import React, { createContext, useReducer, useContext, useEffect } from 'react';
import axios from 'axios';
import { requestWithRetry } from '../utils/apiClient';

// Create context
export const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
    case 'USER_LOADED':
    case 'GUEST_LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token in headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Load user
  const loadUser = async () => {
    // Check for token in local storage
    const token = localStorage.getItem('token');

    // If no token, just set loading to false and return
    if (!token) {
      dispatch({
        type: 'AUTH_ERROR'
      });
      return; // Early return - don't call API
    }

    // Token exists, set it and try to load user
    setAuthToken(token);

    try {
      const res = await requestWithRetry({
        url: '/auth/me',
        method: 'GET'
      });

      dispatch({
        type: 'USER_LOADED',
        payload: res.data.data
      });
    } catch (err) {
      // Only log error, don't show toast (interceptor handles that)
      console.error('Failed to load user:', err.response?.status);

      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response?.data?.message || 'Authentication failed'
      });

      // Clear invalid token
      setAuthToken(null);
    }
  };

  // Login as guest user
  const loginAsGuest = async () => {
    try {
      // Use the regular login endpoint with guest credentials
      const res = await requestWithRetry({
        url: '/auth/login',
        method: 'POST',
        data: {
          email: 'guest@demo.com',
          password: 'guest123'
        }
      });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data.user
      });

      setAuthToken(res.data.token);
      return res.data;
    } catch (err) {
      // If the login fails, create a guest user locally as fallback
      console.log('Using local guest login fallback');

      // Create a guest token and user object
      const guestUser = {
        id: 'guest-user',
        username: 'Guest User',
        email: 'guest@demo.com',
        role: 'guest'
      };

      // Store in localStorage to persist across page refreshes
      localStorage.setItem('guestMode', 'true');

      dispatch({
        type: 'GUEST_LOGIN',
        payload: guestUser
      });
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      console.log('Attempting to register new user:', { ...formData, password: '[HIDDEN]' });

      // Try /auth/register endpoint first, fallback to /auth/signup if needed
      let res;
      try {
        // Add more detailed logging
        console.log('Sending registration request to /auth/register endpoint...');
        res = await requestWithRetry({
          url: '/auth/register',
          method: 'POST',
          data: formData
        });
        console.log('Registration successful with /auth/register endpoint');
      } catch (err) {
        console.log('Registration at /auth/register failed, trying /auth/signup');
        console.log('Error details:', err.response?.data || err.message);

        // Try the alternative endpoint
        res = await requestWithRetry({
          url: '/auth/signup',
          method: 'POST',
          data: formData
        });
        console.log('Registration successful with /auth/signup endpoint');
      }

      console.log('Registration successful, user created in MongoDB');

      // Log the returned data (without sensitive info)
      console.log('Server response:', {
        success: res.data.success,
        user: res.data.user,
        token: res.data.token ? '[TOKEN EXISTS]' : '[NO TOKEN]'
      });

      // Update auth state
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data.user
      });

      // Store the token for authenticated requests
      setAuthToken(res.data.token);

      return res.data;
    } catch (err) {
      // Handle MongoDB connection errors or other server issues
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed';

      console.error('Registration error:', errorMessage);

      // Provide more specific error messages based on the server response
      let displayError = errorMessage;

      if (err.response?.status === 500) {
        displayError = 'Server error. Please try again later.';
        if (err.response?.data?.message?.includes('Database connection')) {
          displayError = 'Database connection error. Please try again later.';
        }
      }

      dispatch({
        type: 'REGISTER_FAIL',
        payload: displayError
      });

      throw err;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await requestWithRetry({
        url: '/auth/login',
        method: 'POST',
        data: formData
      });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data.user
      });

      setAuthToken(res.data.token);

      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Login failed';

      dispatch({
        type: 'LOGIN_FAIL',
        payload: errorMessage
      });

      throw err;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      // Only call the logout endpoint if not in guest mode
      if (!localStorage.getItem('guestMode')) {
        await requestWithRetry({
          url: '/auth/logout',
          method: 'GET'
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Clear guest mode flag
    localStorage.removeItem('guestMode');

    setAuthToken(null);
    dispatch({ type: 'LOGOUT' });
  };

  // Check if user is guest
  const isGuestUser = () => {
    return state.user && (state.user.role === 'guest' || state.user.email === 'guest@demo.com');
  };

  // Clear errors
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Load user on initial render
  useEffect(() => {
    // Check if in guest mode
    if (localStorage.getItem('guestMode') === 'true') {
      const guestUser = {
        id: 'guest-user',
        username: 'Guest User',
        email: 'guest@example.com',
        role: 'guest'
      };

      dispatch({
        type: 'GUEST_LOGIN',
        payload: guestUser
      });
    } else {
      // Only load user if token exists
      const token = localStorage.getItem('token');
      if (token) {
        loadUser();
      } else {
        // No token, just set loading to false
        dispatch({ type: 'AUTH_ERROR' });
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: state.error,
        register,
        login,
        logout,
        clearError,
        loginAsGuest,
        isGuestUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 
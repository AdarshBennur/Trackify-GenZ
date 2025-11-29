import React, { createContext, useReducer, useContext, useEffect } from 'react';
import api, { requestWithRetry } from '../utils/apiClient';
import { getToken, setToken, clearToken } from '../utils/token';

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

  // Load user
  const loadUser = async () => {
    // Check for token in local storage
    const token = getToken();

    // If no token, just set loading to false and return
    if (!token) {
      dispatch({
        type: 'AUTH_ERROR'
      });
      return; // Early return - don't call API
    }

    try {
      const res = await api.get('/auth/me');

      dispatch({
        type: 'USER_LOADED',
        payload: res.data.data || res.data
      });
    } catch (err) {
      // Only log error, don't show toast (interceptor handles that)
      console.error('Failed to load user:', err.response?.status);

      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response?.data?.message || 'Authentication failed'
      });

      // Clear invalid token
      clearToken();
    }
  };

  // Login as guest user
  const loginAsGuest = async () => {
    try {
      // Use the regular login endpoint with guest credentials
      const res = await api.post('/auth/login', {
        email: 'guest@demo.com',
        password: 'guest123'
      });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data.user
      });

      setToken(res.data.token);
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
        console.log('Sending registration request to /auth/register endpoint...');
        res = await api.post('/auth/register', formData);
        console.log('Registration successful with /auth/register endpoint');
      } catch (err) {
        console.log('Registration at /auth/register failed, trying /auth/signup');

        // Try the alternative endpoint
        res = await api.post('/auth/signup', formData);
        console.log('Registration successful with /auth/signup endpoint');
      }

      // Update auth state
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data.user
      });

      // Store the token for authenticated requests
      setToken(res.data.token);

      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed';

      console.error('Registration error:', errorMessage);

      dispatch({
        type: 'REGISTER_FAIL',
        payload: errorMessage
      });

      throw err;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await api.post('/auth/login', formData);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data.user
      });

      setToken(res.data.token);

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
        await api.get('/auth/logout');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Clear guest mode flag
    localStorage.removeItem('guestMode');

    clearToken();
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
      const token = getToken();
      if (token) {
        loadUser();
      } else {
        // No token, just set loading to false
        dispatch({ type: 'AUTH_ERROR' });
      }
    }
  }, []);

  // Listen for auth success events (from Google login or other sources)
  useEffect(() => {
    const handleAuthSuccess = async (event) => {
      console.log('AuthContext received auth success event');
      try {
        const user = event?.detail?.user;
        if (user) {
          dispatch({ type: 'USER_LOADED', payload: user });
          return;
        }
        // fallback: if event had no user, refetch
        const res = await api.get('/auth/me');
        dispatch({ type: 'USER_LOADED', payload: res.data.data || res.data });
      } catch (err) {
        dispatch({ type: 'AUTH_ERROR' });
      }
    };

    window.addEventListener('app:auth-success', handleAuthSuccess);
    return () => window.removeEventListener('app:auth-success', handleAuthSuccess);
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
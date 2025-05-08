import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const AuthForm = ({ mode }) => {
  const isLogin = mode === 'login';
  const { register: registerFormField, handleSubmit, formState: { errors } } = useForm();
  const { login, register: registerUser, loginAsGuest, error, clearError, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Display error messages from auth context
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      if (isLogin) {
        // For login, we just need email and password
        await login({
          email: data.email,
          password: data.password
        });
        toast.success('Successfully logged in!');
      } else {
        // For signup, confirm passwords match before API call
        if (data.password !== data.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        
        // Register the user with username, email, password
        await registerUser({
          username: data.username,
          email: data.email,
          password: data.password
        });
        toast.success('Account created successfully!');
      }
    } catch (err) {
      console.error('Auth error:', err);
      // Error will be handled by the useEffect that watches for error state
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      await loginAsGuest();
      toast.success('Logged in as guest. You can explore all features!');
    } catch (err) {
      console.error('Guest login error:', err);
      toast.error('Failed to login as guest');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <motion.div 
      className="w-full max-w-md mx-auto bg-transparent"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="mt-2 text-[#A0A0A0]">
          {isLogin
            ? 'Sign in to manage your expenses'
            : 'Start tracking your expenses today'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Username field - only shown on signup */}
        {!isLogin && (
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your name"
              className="block w-full rounded-md border-[#F4F1EB] shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] bg-white transition-colors duration-200"
              {...registerFormField('username', { 
                required: 'Name is required',
                minLength: {
                  value: 3,
                  message: 'Name must be at least 3 characters'
                }
              })}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-[#D4AF37]">{errors.username.message}</p>
            )}
          </div>
        )}
        
        {/* Email field - shown on both login and signup */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email address"
            className="block w-full rounded-md border-[#F4F1EB] shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] bg-white transition-colors duration-200"
            {...registerFormField('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-[#D4AF37]">{errors.email.message}</p>
          )}
        </div>
        
        {/* Password field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder={isLogin ? "Enter your password" : "Create a password (min. 6 characters)"}
            className="block w-full rounded-md border-[#F4F1EB] shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] bg-white transition-colors duration-200"
            {...registerFormField('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-[#D4AF37]">{errors.password.message}</p>
          )}
        </div>
        
        {/* Confirm Password field - only shown on signup */}
        {!isLogin && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="block w-full rounded-md border-[#F4F1EB] shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] bg-white transition-colors duration-200"
              {...registerFormField('confirmPassword', { 
                validate: (value, formValues) => value === formValues.password || 'Passwords do not match'
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-[#D4AF37]">{errors.confirmPassword.message}</p>
            )}
          </div>
        )}
        
        <div className="space-y-3">
          {/* Submit button */}
          <button
            type="submit"
            className="inline-flex items-center justify-center w-full px-5 py-2.5 border border-transparent rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300 bg-[#D4AF37] text-white hover:bg-opacity-90 focus:ring-[#D4AF37] shadow-luxe hover:shadow-luxe-hover"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
              </div>
            ) : (
              isLogin ? 'Sign in' : 'Create account'
            )}
          </button>
          
          {/* Guest login button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="inline-flex items-center justify-center w-full px-5 py-2.5 border border-[#2E8B57] rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300 bg-white text-[#2E8B57] hover:bg-[#f7f7f7] focus:ring-[#2E8B57]"
            disabled={guestLoading}
          >
            {guestLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#2E8B57] mr-2"></div>
                <span>Entering as guest...</span>
              </div>
            ) : 'Continue as Guest'}
          </button>
        </div>
      </form>
      
      {/* Toggle between login and signup */}
      <div className="mt-6 text-center">
        <p className="text-sm text-[#A0A0A0]">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#2E8B57] hover:text-[#207346] font-medium transition-colors duration-300">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link to="/login" className="text-[#2E8B57] hover:text-[#207346] font-medium transition-colors duration-300">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </motion.div>
  );
};

export default AuthForm; 
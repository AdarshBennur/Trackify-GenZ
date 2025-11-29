import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { warmBackend } from '../utils/warmup';
import '../styles/connection.css';
import Logo from '../assets/logo/logo.svg';
import { GoogleLogin } from '@react-oauth/google';
import { requestWithRetry } from '../utils/apiClient';
import { handleGoogleCredential } from '../utils/googleAuth';

const Signup = () => {
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const navigate = useNavigate();

  // Warm up backend when signup page loads
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    if (apiUrl) {
      warmBackend(apiUrl);
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      await handleGoogleCredential(credentialResponse.credential);
    } catch (err) {
      console.error('Google signup error:', err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google signup failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-[#F4F1EB] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center items-center"
        >
          <Link to="/" className="flex items-center">
            <img src={Logo} alt="CashHarbor Logo" className="h-12 w-12 mr-3" />
            <span className="text-2xl font-bold text-[#2E8B57]">Cash<span className="text-[#D4AF37]">Harbor</span></span>
          </Link>
        </motion.div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-[#A0A0A0]">
          Or{' '}
          <Link to="/login" className="font-medium text-[#2E8B57] hover:text-[#207346] transition-colors">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F8F6F0] py-8 px-4 shadow-luxe rounded-xl border border-[#F4F1EB] sm:px-10">
          <AuthForm mode="signup" />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#F4F1EB]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#F8F6F0] px-2 text-[#A0A0A0]">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              {googleLoading ? (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#2E8B57]"></div>
                  <span className="ml-2 text-sm text-[#A0A0A0]">Signing up with Google...</span>
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  width="350"
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
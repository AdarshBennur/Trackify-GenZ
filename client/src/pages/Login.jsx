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

const Login = () => {
  const [guestLoading, setGuestLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const navigate = useNavigate();

  // Warm up backend when login page loads
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    if (apiUrl) {
      warmBackend(apiUrl);
    }
  }, []);

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      const res = await requestWithRetry({
        url: '/auth/guest',
        method: 'POST'
      });

      toast.success('Logged in as guest. You can explore all features!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Guest login error:', err);
      toast.error('Failed to login as guest');
    } finally {
      setGuestLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const res = await requestWithRetry({
        url: '/auth/google',
        method: 'POST',
        data: { credential: credentialResponse.credential }
      });

      toast.success('Successfully logged in with Google!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Google login error:', err);
      toast.error('Google login failed. Server might be warming up, please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
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
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-[#A0A0A0]">
          Or{' '}
          <Link to="/signup" className="font-medium text-[#2E8B57] hover:text-[#207346] transition-colors duration-300">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F8F6F0] py-8 px-4 shadow-luxe rounded-xl border border-[#F4F1EB] sm:px-10">
          <AuthForm mode="login" />

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
                  <span className="ml-2 text-sm text-[#A0A0A0]">Signing in with Google...</span>
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  width="350"
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="text-center">
          <p className="text-sm text-[#A0A0A0] mb-3">Want to explore without creating an account?</p>
          <button
            onClick={handleGuestLogin}
            disabled={guestLoading}
            className="inline-flex items-center justify-center px-6 py-3 border border-[#D4AF37] bg-[#D4AF37] text-white rounded-lg shadow-md hover:bg-[#C39E2D] transition-colors duration-300 font-medium"
          >
            {guestLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                <span>Loading...</span>
              </div>
            ) : (
              'Continue as Guest'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './utils/api'; // Import API utility to initialize it
import { warmBackend } from './utils/warmup';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Budget from './pages/Budget';
import Search from './pages/Search';
import Reminders from './pages/Reminders';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  const location = useLocation();

  // Warm up backend on app load to prevent cold start delays
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    if (apiUrl) {
      warmBackend(apiUrl);
    }
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
      <>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public routes with no navigation */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes with Layout */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />

            <Route
              path="/expenses"
              element={
                <Layout>
                  <Expenses />
                </Layout>
              }
            />

            <Route
              path="/income"
              element={
                <Layout>
                  <Income />
                </Layout>
              }
            />

            <Route
              path="/budget"
              element={
                <Layout>
                  <Budget />
                </Layout>
              }
            />

            <Route
              path="/search"
              element={
                <Layout>
                  <Search />
                </Layout>
              }
            />

            <Route
              path="/reminders"
              element={
                <Layout>
                  <Reminders />
                </Layout>
              }
            />

            <Route
              path="/goals"
              element={
                <Layout>
                  <Goals />
                </Layout>
              }
            />

            <Route
              path="/profile"
              element={
                <Layout>
                  <Profile />
                </Layout>
              }
            />
          </Route>

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </>
    </GoogleOAuthProvider>
  );
}

export default App;
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import { hasValidAuth } from '../utils/authGuard';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F4F1EB]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Check both context auth and token validity
  if (!isAuthenticated || !hasValidAuth()) {
    // Silent redirect - no toast (interceptor handles that)
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 
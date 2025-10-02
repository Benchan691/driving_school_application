import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && user?.user_type !== requiredRole) {
    // Redirect to appropriate page based on user role
    if (user?.user_type === 'student') {
      return <Navigate to="/dashboard/student" replace />;
    } else if (user?.user_type === 'instructor') {
      return <Navigate to="/dashboard/instructor" replace />;
    } else if (user?.user_type === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated and has required role (if specified)
  return children;
};

export default ProtectedRoute;

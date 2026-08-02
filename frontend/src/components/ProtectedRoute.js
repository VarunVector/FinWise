import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireOnboarded = true }) => {
  const { isAuthenticated, isOnboarded, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but not onboarded - redirect to onboarding (unless already there)
  if (requireOnboarded && !isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  // Authenticated and condition met - render children
  return children;
};

export default ProtectedRoute;


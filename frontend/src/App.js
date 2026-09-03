import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingWizard from './components/OnboardingWizard';
import ClerkOtpRegister from './components/ClerkOtpRegister';
import ClerkOtpLogin from './components/ClerkOtpLogin';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AIPoweredAdvisor from './pages/AIPoweredAdvisor';
import StockPrediction from './pages/StockPrediction';

function AppRoutes() {
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

  return (
    <Router>
      {isAuthenticated && isOnboarded && <Navbar />}
      <div className={isAuthenticated && isOnboarded ? 'main-content' : ''}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} />} />
          {/* Dedicated route for Clerk's prebuilt SignIn component (handles CAPTCHA + OTP). */}
          <Route path="/sign-in" element={!isAuthenticated ? <ClerkOtpLogin /> : <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} />} />
          {/* Dedicated route for Clerk's prebuilt SignUp component (handles CAPTCHA + OTP)
              so the Clerk user is reliably created and persistable. */}
          <Route path="/sign-up" element={!isAuthenticated ? <ClerkOtpRegister /> : <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} />} />
          <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} />} />

          {/* Protected routes */}
          <Route path="/onboarding" element={
            <ProtectedRoute requireOnboarded={false}>
              <OnboardingWizard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute requireOnboarded={true}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/ai-advisor" element={
            <ProtectedRoute requireOnboarded={true}>
              <AIPoweredAdvisor />
            </ProtectedRoute>
          } />
          <Route path="/stock-prediction" element={
            <ProtectedRoute requireOnboarded={true}>
              <StockPrediction />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinancialDataProvider } from './context/FinancialDataContext';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingWizard from './components/OnboardingWizard';
import ClerkOtpRegister from './components/ClerkOtpRegister';
import ClerkOtpLogin from './components/ClerkOtpLogin';
import MainLayout from './components/layout/MainLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import GoalPlanning from './pages/GoalPlanning';
import Transactions from './pages/Transactions';
import MutualFunds from './pages/MutualFunds';
import Stocks from './pages/Stocks';
import ETFs from './pages/ETFs';
import Gold from './pages/Gold';
import FixedDeposits from './pages/FixedDeposits';
import AIPoweredAdvisor from './pages/AIPoweredAdvisor';
import StockPrediction from './pages/StockPrediction';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function AppRoutes() {
  const { isAuthenticated, isOnboarded, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f4f6fa' }}>
        <div className="spinner-border text-teal" role="status">
          <span className="visually-hidden">Loading FinWise AI...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} />} />
        <Route path="/sign-in" element={!isAuthenticated ? <ClerkOtpLogin /> : <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} />} />
        <Route path="/sign-up" element={!isAuthenticated ? <ClerkOtpRegister /> : <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} />} />

        {/* Onboarding Wizard (requires authentication, but not yet onboarded) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireOnboarded={false}>
              <OnboardingWizard />
            </ProtectedRoute>
          }
        />

        {/* Authenticated & Onboarded Modules inside MainLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/portfolio"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <MainLayout>
                <Portfolio />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/goals"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <MainLayout>
                <GoalPlanning />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <MainLayout>
                <Transactions />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/investments/mutual-funds"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <MainLayout>
                <MutualFunds />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/investments/stocks"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <MainLayout>
                <Stocks />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/investments/etfs"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <MainLayout>
                <ETFs />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/investments/gold"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <MainLayout>
                <Gold />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/investments/fixed-deposits"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <MainLayout>
                <FixedDeposits />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-advisor"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <MainLayout>
                <AIPoweredAdvisor />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/stock-prediction"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <MainLayout>
                <StockPrediction />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all redirect to dashboard if authenticated, else landing */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <FinancialDataProvider>
        <AppRoutes />
      </FinancialDataProvider>
    </AuthProvider>
  );
}

export default App;

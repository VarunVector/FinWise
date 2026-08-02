import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('finwise_token');
    const storedUser = localStorage.getItem('finwise_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('finwise_token');
        localStorage.removeItem('finwise_user');
      }
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      
      // Store token and user
      localStorage.setItem('finwise_token', response.token);
      localStorage.setItem('finwise_user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
      setLoading(false);
      
      return { success: true, user: response.user };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  // Register handler
  const register = useCallback(async (userData) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authAPI.register(userData);
      
      // Store token and user  
      localStorage.setItem('finwise_token', response.token);
      localStorage.setItem('finwise_user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
      setLoading(false);
      
      return { success: true, user: response.user };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('finwise_token');
    localStorage.removeItem('finwise_user');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // Send OTP for password reset
  const sendOtp = useCallback(async (email) => {
    setError(null);
    try {
      const response = await authAPI.sendOtp(email);
      return { success: true, message: response.message, otp: response.otp };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Verify OTP
  const verifyOtp = useCallback(async (email, otp) => {
    setError(null);
    try {
      const response = await authAPI.verifyOtp(email, otp);
      return { success: true, message: response.message };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email, newPassword) => {
    setError(null);
    try {
      const response = await authAPI.resetPassword(email, newPassword);
      return { success: true, message: response.message };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Complete onboarding
  const completeOnboarding = useCallback(async (profileData) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await authAPI.completeOnboarding(user.id, profileData);
      
      // Update stored user
      localStorage.setItem('finwise_user', JSON.stringify(response.user));
      setUser(response.user);
      
      return { success: true, user: response.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user]);

  // Update user profile locally (for demo)
  const updateUser = useCallback((updatedUser) => {
    localStorage.setItem('finwise_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  // Send OTP for login
  const sendLoginOtp = useCallback(async (email) => {
    setError(null);
    try {
      const response = await authAPI.sendOtpLogin(email);
      return { success: true, message: response.message, otp: response.otp };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Verify OTP and login
  const verifyLoginOtp = useCallback(async (email, otp) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authAPI.verifyOtpLogin(email, otp);
      
      localStorage.setItem('finwise_token', response.token);
      localStorage.setItem('finwise_user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
      setLoading(false);
      
      return { success: true, user: response.user };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  // Send OTP for registration
  const sendRegistrationOtp = useCallback(async (userData) => {
    setError(null);
    try {
      const response = await authAPI.sendOtpRegistration(userData);
      return { success: true, message: response.message, otp: response.otp };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Verify OTP and complete registration
  const verifyRegistrationOtp = useCallback(async (email, otp) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authAPI.verifyOtpRegistration(email, otp);
      
      localStorage.setItem('finwise_token', response.token);
      localStorage.setItem('finwise_user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
      setLoading(false);
      
      return { success: true, user: response.user };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    isOnboarded: user?.isOnboarded || false,
    login,
    register,
    logout,
    sendOtp,
    verifyOtp,
    resetPassword,
    completeOnboarding,
    updateUser,
    sendLoginOtp,
    verifyLoginOtp,
    sendRegistrationOtp,
    verifyRegistrationOtp,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;


import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// Detect if a real Clerk publishable key is configured.
// When true, the app is wrapped in <ClerkProvider> and Clerk hooks are usable.
const isClerkConfigured = () => {
  const key = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
  return !!key && !key.includes('YOUR_CLERK');
};

/**
 * Bridge that syncs a Clerk session into the mock AuthContext.
 * This component is only rendered when isClerkConfigured() returns true,
 * which guarantees a <ClerkProvider> is present in the tree, so the
 * Clerk hooks are safe to call.
 */
const ClerkSessionBridge = ({ onSync }) => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { isSignedIn } = useClerkAuth();

  useEffect(() => {
    if (clerkLoaded) {
      // Read the Clerk user's onboarding status from localStorage (defaults to
      // false for new users so they are routed to the questionnaire first).
      const clerkOnboarded = clerkUser
        ? localStorage.getItem(`finwise_clerk_onboarded_${clerkUser.id}`) === 'true'
        : false;

      onSync({
        isSignedIn: !!isSignedIn,
        user: clerkUser
          ? {
            id: clerkUser.id,
            name: clerkUser.fullName || clerkUser.firstName || 'User',
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            isOnboarded: clerkOnboarded,
            isClerk: true,
          }
          : null,
      });
    }
  }, [clerkLoaded, isSignedIn, clerkUser, onSync]);

  return null;
};

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
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.profile || Object.keys(parsedUser.profile).length === 0) {
          const rawProfile = localStorage.getItem(`finwise_user_profile_${parsedUser.id}`) ||
            localStorage.getItem(`finwise_user_profile_${parsedUser.email}`) ||
            localStorage.getItem('finwise_user_profile');
          if (rawProfile) parsedUser.profile = JSON.parse(rawProfile);
        }
        setUser(parsedUser);
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
      let updatedUser;

      if (user.isClerk) {
        // Clerk users aren't stored in the mock backend; persist onboarding locally.
        localStorage.setItem(`finwise_clerk_onboarded_${user.id}`, 'true');
        updatedUser = {
          ...user,
          isOnboarded: true,
          profile: { ...(user.profile || {}), ...profileData },
        };
      } else {
        const response = await authAPI.completeOnboarding(user.id, profileData);
        updatedUser = response.user;
      }

      // Explicitly persist profile to dedicated localStorage keys
      if (updatedUser.profile) {
        localStorage.setItem('finwise_user_profile', JSON.stringify(updatedUser.profile));
        if (updatedUser.id) localStorage.setItem(`finwise_user_profile_${updatedUser.id}`, JSON.stringify(updatedUser.profile));
        if (updatedUser.email) localStorage.setItem(`finwise_user_profile_${updatedUser.email}`, JSON.stringify(updatedUser.profile));
      }

      // Update stored user
      localStorage.setItem('finwise_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user]);

  // Update user profile locally (for demo)
  const updateUser = useCallback((updatedUser) => {
    if (updatedUser.profile) {
      localStorage.setItem('finwise_user_profile', JSON.stringify(updatedUser.profile));
      if (updatedUser.id) localStorage.setItem(`finwise_user_profile_${updatedUser.id}`, JSON.stringify(updatedUser.profile));
      if (updatedUser.email) localStorage.setItem(`finwise_user_profile_${updatedUser.email}`, JSON.stringify(updatedUser.profile));
    }
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

  // Sync Clerk session into the mock auth state when Clerk is configured.
  const handleClerkSync = useCallback(({ isSignedIn, user: clerkUser }) => {
    setLoading(false);
    if (isSignedIn && clerkUser) {
      let storedProfile = null;
      try {
        const rawProfile = localStorage.getItem(`finwise_user_profile_${clerkUser.id}`) ||
          localStorage.getItem(`finwise_user_profile_${clerkUser.primaryEmailAddress?.emailAddress}`) ||
          localStorage.getItem('finwise_user_profile');
        if (rawProfile) storedProfile = JSON.parse(rawProfile);
      } catch (e) {
        console.warn('Failed to parse stored user profile during Clerk sync', e);
      }

      const fullUser = {
        ...clerkUser,
        profile: storedProfile || clerkUser.profile || {}
      };

      setUser(fullUser);
      setToken('clerk_session_' + (clerkUser.id || ''));
    } else if (!isSignedIn) {
      // Only clear Clerk-derived state; keep mock session if present
      const storedToken = localStorage.getItem('finwise_token');
      const storedUser = localStorage.getItem('finwise_user');
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          if (!parsedUser.profile || Object.keys(parsedUser.profile).length === 0) {
            const rawProfile = localStorage.getItem(`finwise_user_profile_${parsedUser.id}`) ||
              localStorage.getItem(`finwise_user_profile_${parsedUser.email}`) ||
              localStorage.getItem('finwise_user_profile');
            if (rawProfile) parsedUser.profile = JSON.parse(rawProfile);
          }
          setUser(parsedUser);
        } catch (e) {
          setToken(null);
          setUser(null);
        }
      }
    }
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
      {isClerkConfigured() && <ClerkSessionBridge onSync={handleClerkSync} />}
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;


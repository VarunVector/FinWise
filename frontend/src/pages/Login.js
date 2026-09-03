import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ClerkOtpLogin from '../components/ClerkOtpLogin';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiAlertCircle, FiSmartphone, FiShield } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

// Detect if a real Clerk publishable key is configured.
const isClerkConfigured = () => {
  const key = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
  return !!key && !key.includes('YOUR_CLERK');
};

const Login = () => {
  const navigate = useNavigate();
  const { login, sendLoginOtp, verifyLoginOtp, error, clearError } = useAuth();
  const [authMode, setAuthMode] = useState('password'); // 'password' or 'otp'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [loginError, setLoginError] = useState('');

  // OTP Login state
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpDemo, setOtpDemo] = useState(''); // For demo display

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (loginError) setLoginError('');
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setLoginError('');

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        if (result.user.isOnboarded) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      } else {
        setLoginError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!otpEmail.trim()) {
      setLoginError('Please enter your email');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(otpEmail)) {
      setLoginError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setLoginError('');

    try {
      const result = await sendLoginOtp(otpEmail);
      if (result.success) {
        setOtpSent(true);
        setLoginError('');
        setOtpDemo(result.otp || '');
        setResendTimer(30);
        const timer = setInterval(() => {
          setResendTimer(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setLoginError(result.error || 'Failed to send OTP');
      }
    } catch (err) {
      setLoginError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-login-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-login-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setLoginError('Please enter the complete OTP');
      return;
    }

    setLoading(true);
    setLoginError('');

    try {
      const result = await verifyLoginOtp(otpEmail, otpString);
      if (result.success) {
        if (result.user.isOnboarded) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      } else {
        setLoginError(result.error || 'Invalid OTP');
      }
    } catch (err) {
      setLoginError('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'demo@finwise.ai',
      password: 'Demo@123',
      rememberMe: false
    });
  };

  const switchToPassword = () => {
    setAuthMode('password');
    setLoginError('');
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
  };

  const switchToOtp = () => {
    setAuthMode('otp');
    setLoginError('');
    setValidationErrors({});
  };

  const switchToClerk = () => {
    setAuthMode('clerk');
    setLoginError('');
    setValidationErrors({});
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    navigate('/sign-in');
  };

  const renderPasswordLogin = () => (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-3">
        <div className="form-floating">
          <input
            type="email"
            className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
            id="email"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
          />
          <label htmlFor="email">
            <FiMail className="me-2" style={{ color: 'var(--text-light)' }} />
            Email Address
          </label>
          {validationErrors.email && (
            <div className="invalid-feedback">{validationErrors.email}</div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="form-floating">
          <input
            type={showPassword ? 'text' : 'password'}
            className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <label htmlFor="password">
            <FiLock className="me-2" style={{ color: 'var(--text-light)' }} />
            Password
          </label>
          <button
            type="button"
            className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-decoration-none"
            onClick={() => setShowPassword(!showPassword)}
            style={{ color: 'var(--text-light)', zIndex: 5, padding: '8px 16px' }}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
          {validationErrors.password && (
            <div className="invalid-feedback">{validationErrors.password}</div>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="rememberMe" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Remember me
          </label>
        </div>
        <Link
          to="/forgot-password"
          style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}
        >
          Forgot Password?
        </Link>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100 mb-3"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </button>
    </form>
  );

  const renderOtpLogin = () => (
    <div>
      {!otpSent ? (
        <>
          <div className="text-center mb-4">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: '70px', height: '70px', background: 'rgba(52,152,219,0.1)' }}
            >
              <FiSmartphone style={{ fontSize: '1.8rem', color: 'var(--info)' }} />
            </div>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Enter your email to receive a one-time password
            </p>
          </div>
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              id="otpEmail"
              placeholder="name@example.com"
              value={otpEmail}
              onChange={(e) => {
                setOtpEmail(e.target.value);
                setLoginError('');
              }}
            />
            <label htmlFor="otpEmail">
              <FiMail className="me-2" style={{ color: 'var(--text-light)' }} />
              Email Address
            </label>
          </div>
          <button
            className="btn btn-primary w-100 mb-3"
            onClick={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </button>
        </>
      ) : (
        <>
          <div className="text-center mb-4">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: '70px', height: '70px', background: 'rgba(0,168,107,0.1)' }}
            >
              <FiMail style={{ fontSize: '1.8rem', color: 'var(--primary)' }} />
            </div>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Enter the 6-digit OTP sent to <strong>{otpEmail}</strong>
            </p>
            {otpDemo && (
              <div className="alert alert-info d-flex align-items-center justify-content-center gap-2 py-2 px-3" role="alert" style={{ borderRadius: '8px', fontSize: '0.85rem', maxWidth: '320px', margin: '0 auto 12px' }}>
                🔐 OTP: <strong style={{ fontSize: '1.1rem', letterSpacing: '2px' }}>{otpDemo}</strong>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-center gap-2 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-login-${index}`}
                type="text"
                className="form-control text-center"
                style={{
                  width: '52px',
                  height: '56px',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  border: '2px solid #e8ecef'
                }}
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
              />
            ))}
          </div>

          <button
            className="btn btn-primary w-100 mb-2"
            onClick={handleVerifyOtp}
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Verifying...
              </>
            ) : (
              'Verify & Login'
            )}
          </button>

          <div className="text-center">
            {resendTimer > 0 ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                Resend OTP in {resendTimer}s
              </span>
            ) : (
              <button
                className="btn btn-link text-decoration-none"
                onClick={handleSendOtp}
                disabled={loading}
                style={{ color: 'var(--primary)', fontSize: '0.9rem' }}
              >
                Resend OTP
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button
          className="btn btn-link text-decoration-none p-0 mb-3"
          onClick={() => navigate('/')}
          style={{ color: 'var(--text-secondary)' }}
        >
          <FiArrowLeft className="me-1" /> Back to Home
        </button>

        <div className="auth-logo">
          <div className="brand">Fin<span>Wise</span> AI</div>
          <p>Welcome back! Login to your account</p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="d-flex mb-4" style={{ background: '#f0f2f5', borderRadius: '12px', padding: '4px' }}>
          <button
            className={`btn flex-fill ${authMode === 'password' ? 'btn-primary' : 'btn-light'}`}
            onClick={switchToPassword}
            style={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem' }}
          >
            <FiLock className="me-1" /> Password
          </button>
          <button
            className={`btn flex-fill ${authMode === 'otp' ? 'btn-primary' : 'btn-light'}`}
            onClick={switchToOtp}
            style={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem' }}
          >
            <FiSmartphone className="me-1" /> OTP Login
          </button>
          {isClerkConfigured() && (
            <button
              className={`btn flex-fill ${authMode === 'clerk' ? 'btn-primary' : 'btn-light'}`}
              onClick={switchToClerk}
              style={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem' }}
            >
              <FiShield className="me-1" /> Clerk OTP
            </button>
          )}
        </div>

        {/* Alert Messages */}
        {(loginError || error) && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3" role="alert" style={{ borderRadius: '8px', fontSize: '0.9rem' }}>
            <FiAlertCircle />
            <span>{loginError || error}</span>
          </div>
        )}

        {authMode === 'password' && renderPasswordLogin()}
        {authMode === 'otp' && renderOtpLogin()}
        {authMode === 'clerk' && isClerkConfigured() && <ClerkOtpLogin />}

        {/* Social Login */}
        <div className="auth-divider">or continue with</div>
        <div className="d-flex gap-2 mb-3">
          <button className="btn-social d-flex align-items-center justify-content-center gap-2">
            <FcGoogle size={20} /> Google
          </button>
          <button className="btn-social d-flex align-items-center justify-content-center gap-2">
            <FaFacebook size={20} style={{ color: '#1877F2' }} /> Facebook
          </button>
        </div>

        {/* Demo credentials button (only for password mode) */}
        {authMode === 'password' && (
          <div className="text-center mb-3">
            <button
              type="button"
              className="btn btn-link text-decoration-none"
              onClick={fillDemoCredentials}
              style={{ color: 'var(--accent)', fontSize: '0.9rem' }}
            >
              🔑 Use Demo Credentials
            </button>
          </div>
        )}

        <p className="text-center mb-0" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;


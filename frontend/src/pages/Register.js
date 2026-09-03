import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ClerkOtpRegister from '../components/ClerkOtpRegister';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowLeft, FiAlertCircle, FiCheckCircle, FiShield } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

// Detect if a real Clerk publishable key is configured.
const isClerkConfigured = () => {
  const key = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
  return !!key && !key.includes('YOUR_CLERK');
};

const Register = () => {
  const navigate = useNavigate();
  const { sendRegistrationOtp, verifyRegistrationOtp, error, clearError } = useAuth();
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [registerError, setRegisterError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const [mode, setMode] = useState('standard'); // 'standard' or 'clerk'

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpDemo, setOtpDemo] = useState(''); // For demo display

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,15}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      errors.password = 'Password must include uppercase, lowercase, number & special character';
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeTerms) {
      errors.agreeTerms = 'You must agree to the terms and conditions';
    }
    return errors;
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 25;
    if (/(?=.*[a-z])/.test(password)) score += 15;
    if (/(?=.*[A-Z])/.test(password)) score += 15;
    if (/(?=.*\d)/.test(password)) score += 10;
    if (/(?=.*[@$!%*?&])/.test(password)) score += 10;

    let label, color;
    if (score <= 30) { label = 'Weak'; color = '#E74C3C'; }
    else if (score <= 60) { label = 'Fair'; color = '#F39C12'; }
    else if (score <= 80) { label = 'Good'; color = '#3498DB'; }
    else { label = 'Strong'; color = '#2ECC71'; }

    setPasswordStrength({ score, label, color });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (name === 'password') {
      calculatePasswordStrength(value);
    }

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (registerError) setRegisterError('');
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setRegisterError('');

    try {
      // Use OTP registration flow
      const result = await sendRegistrationOtp({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password
      });

      if (result.success) {
        setStep(2);
        setRegisterError('');
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
        setRegisterError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setRegisterError('An unexpected error occurred. Please try again.');
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
      const nextInput = document.getElementById(`reg-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`reg-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setRegisterError('Please enter the complete OTP');
      return;
    }

    setLoading(true);
    setRegisterError('');

    try {
      const result = await verifyRegistrationOtp(formData.email, otpString);
      if (result.success) {
        navigate('/onboarding');
      } else {
        setRegisterError(result.error || 'Invalid OTP');
      }
    } catch (err) {
      setRegisterError('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setRegisterError('');

    try {
      const result = await sendRegistrationOtp({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password
      });

      if (result.success) {
        setOtp(['', '', '', '', '', '']);
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
        setRegisterError(result.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setRegisterError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderRegisterForm = () => (
    <form onSubmit={handleSubmit} noValidate>
      <div className="row g-2">
        <div className="col-12">
          <div className="form-floating">
            <input
              type="text"
              className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
              id="name"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
            />
            <label htmlFor="name">
              <FiUser className="me-2" style={{ color: 'var(--text-light)' }} />
              Full Name
            </label>
            {validationErrors.name && (
              <div className="invalid-feedback">{validationErrors.name}</div>
            )}
          </div>
        </div>

        <div className="col-md-6">
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
              Email
            </label>
            {validationErrors.email && (
              <div className="invalid-feedback">{validationErrors.email}</div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-floating">
            <input
              type="tel"
              className={`form-control ${validationErrors.phone ? 'is-invalid' : ''}`}
              id="phone"
              name="phone"
              placeholder="+91-9876543210"
              value={formData.phone}
              onChange={handleChange}
            />
            <label htmlFor="phone">
              <FiPhone className="me-2" style={{ color: 'var(--text-light)' }} />
              Phone Number
            </label>
            {validationErrors.phone && (
              <div className="invalid-feedback">{validationErrors.phone}</div>
            )}
          </div>
        </div>

        <div className="col-md-6">
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
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-1">
              <div className="progress" style={{ height: '4px' }}>
                <div
                  className="progress-bar"
                  style={{ width: `${passwordStrength.score}%`, background: passwordStrength.color, transition: 'all 0.3s' }}
                ></div>
              </div>
              <small style={{ color: passwordStrength.color, fontWeight: 500 }}>
                {passwordStrength.label}
              </small>
            </div>
          )}
        </div>

        <div className="col-md-6">
          <div className="form-floating">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className={`form-control ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <label htmlFor="confirmPassword">
              <FiLock className="me-2" style={{ color: 'var(--text-light)' }} />
              Confirm Password
            </label>
            <button
              type="button"
              className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-decoration-none"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ color: 'var(--text-light)', zIndex: 5, padding: '8px 16px' }}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
            {validationErrors.confirmPassword && (
              <div className="invalid-feedback">{validationErrors.confirmPassword}</div>
            )}
          </div>
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <div className="mt-1" style={{ color: 'var(--success)', fontSize: '0.85rem' }}>
              <FiCheckCircle className="me-1" /> Passwords match
            </div>
          )}
        </div>
      </div>

      <div className="form-check mt-3 mb-3">
        <input
          type="checkbox"
          className={`form-check-input ${validationErrors.agreeTerms ? 'is-invalid' : ''}`}
          id="agreeTerms"
          name="agreeTerms"
          checked={formData.agreeTerms}
          onChange={handleChange}
        />
        <label className="form-check-label" htmlFor="agreeTerms" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          I agree to the <Link to="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Terms of Service</Link> and <Link to="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Privacy Policy</Link>
        </label>
        {validationErrors.agreeTerms && (
          <div className="invalid-feedback d-block">{validationErrors.agreeTerms}</div>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100 mb-3"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );

  const renderOtpVerification = () => (
    <div>
      <div className="text-center mb-4">
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
          style={{ width: '80px', height: '80px', background: 'rgba(52,152,219,0.1)' }}
        >
          <FiMail style={{ fontSize: '2rem', color: 'var(--info)' }} />
        </div>
        <h4 className="fw-bold mb-2">Verify Your Email</h4>
        <p className="text-muted" style={{ fontSize: '0.95rem' }}>
          Enter the 6-digit OTP sent to <strong>{formData.email}</strong>
        </p>
        {otpDemo && (
          <div className="alert alert-info d-flex align-items-center justify-content-center gap-2 py-2 px-3" role="alert" style={{ borderRadius: '8px', fontSize: '0.85rem', maxWidth: '320px', margin: '0 auto 12px' }}>
            🔐 Demo OTP: <strong style={{ fontSize: '1.1rem', letterSpacing: '2px' }}>{otpDemo}</strong>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-center gap-2 mb-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`reg-otp-${index}`}
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
          'Verify Email'
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
            onClick={handleResendOtp}
            disabled={loading}
            style={{ color: 'var(--primary)', fontSize: '0.9rem' }}
          >
            Resend OTP
          </button>
        )}
      </div>

      <div className="text-center mt-3">
        <button
          className="btn btn-link text-decoration-none"
          onClick={() => {
            setStep(1);
            setOtp(['', '', '', '', '', '']);
            setRegisterError('');
          }}
          style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}
        >
          <FiArrowLeft className="me-1" /> Back to registration form
        </button>
      </div>
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <button
          className="btn btn-link text-decoration-none p-0 mb-3"
          onClick={() => navigate('/')}
          style={{ color: 'var(--text-secondary)' }}
        >
          <FiArrowLeft className="me-1" /> Back to Home
        </button>

        <div className="auth-logo">
          <div className="brand">Fin<span>Wise</span> AI</div>
          <p>{step === 1 ? 'Create your account to get started' : 'Verify your email address'}</p>
        </div>

        {/* Mode Toggle Tabs */}
        {step === 1 && (
          <div className="d-flex mb-4" style={{ background: '#f0f2f5', borderRadius: '12px', padding: '4px' }}>
            <button
              className={`btn flex-fill ${mode === 'standard' ? 'btn-primary' : 'btn-light'}`}
              onClick={() => { setMode('standard'); setRegisterError(''); setStep(1); }}
              style={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem' }}
            >
              <FiUser className="me-1" /> Standard
            </button>
            {isClerkConfigured() && (
              <button
                className={`btn flex-fill ${mode === 'clerk' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => { setMode('clerk'); setRegisterError(''); setStep(1); navigate('/sign-up'); }}
                style={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem' }}
              >
                <FiShield className="me-1" /> Clerk OTP
              </button>
            )}
          </div>
        )}

        {/* Alert Messages */}
        {(registerError || error) && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3" role="alert" style={{ borderRadius: '8px', fontSize: '0.9rem' }}>
            <FiAlertCircle />
            <span>{registerError || error}</span>
          </div>
        )}

        {mode === 'standard' && step === 1 && renderRegisterForm()}
        {mode === 'standard' && step === 2 && renderOtpVerification()}
        {mode === 'clerk' && isClerkConfigured() && <ClerkOtpRegister />}

        {step === 1 && mode === 'standard' && (
          <>
            <div className="auth-divider">or continue with</div>
            <div className="d-flex gap-2 mb-3">
              <button className="btn-social d-flex align-items-center justify-content-center gap-2">
                <FcGoogle size={20} /> Google
              </button>
              <button className="btn-social d-flex align-items-center justify-content-center gap-2">
                <FaFacebook size={20} style={{ color: '#1877F2' }} /> Facebook
              </button>
            </div>

            <p className="text-center mb-0" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;


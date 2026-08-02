import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiArrowLeft, FiAlertCircle, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, resetPassword } = useAuth();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [otpDemo, setOtpDemo] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(0);

  const validateEmail = () => {
    if (!email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email';
    return '';
  };

  const handleSendOtp = async () => {
    const emailError = validateEmail();
    if (emailError) {
      setValidationErrors({ email: emailError });
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const result = await sendOtp(email);
      if (result.success) {
        setOtpDemo(result.otp || '123456');
        setStep(2);
        setMessage(`OTP sent to ${email}`);
        setIsError(false);
        // Start resend timer
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
        setMessage(result.error || 'Failed to send OTP');
        setIsError(true);
      }
    } catch (err) {
      setMessage('An unexpected error occurred');
      setIsError(true);
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

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setMessage('Please enter the complete OTP');
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await verifyOtp(email, otpString);
      if (result.success) {
        setStep(3);
        setMessage('');
      } else {
        setMessage(result.error || 'Invalid OTP');
        setIsError(true);
      }
    } catch (err) {
      setMessage('Failed to verify OTP');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = () => {
    const errors = {};
    if (!newPassword) {
      errors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
      errors.newPassword = 'Must include uppercase, lowercase, number & special character';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleResetPassword = async () => {
    const errors = validatePassword();
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setMessage('');

    try {
      const result = await resetPassword(email, newPassword);
      if (result.success) {
        setStep(4);
        setMessage('Password reset successful!');
        setIsError(false);
      } else {
        setMessage(result.error || 'Failed to reset password');
        setIsError(true);
      }
    } catch (err) {
      setMessage('An unexpected error occurred');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <>
      <div className="text-center mb-4">
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
          style={{ width: '80px', height: '80px', background: 'rgba(0,168,107,0.1)' }}
        >
          <FiLock style={{ fontSize: '2rem', color: 'var(--primary)' }} />
        </div>
        <h4 className="fw-bold mb-2">Forgot Password?</h4>
        <p className="text-muted" style={{ fontSize: '0.95rem' }}>
          No worries! Enter your email and we'll send you an OTP to reset your password.
        </p>
      </div>

      <div className="form-floating mb-3">
        <input
          type="email"
          className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
          id="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setValidationErrors({});
            setMessage('');
          }}
        />
        <label htmlFor="email">
          <FiMail className="me-2" style={{ color: 'var(--text-light)' }} />
          Email Address
        </label>
        {validationErrors.email && (
          <div className="invalid-feedback">{validationErrors.email}</div>
        )}
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
  );

  const renderOtpStep = () => (
    <>
      <div className="text-center mb-4">
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
          style={{ width: '80px', height: '80px', background: 'rgba(52,152,219,0.1)' }}
        >
          <FiMail style={{ fontSize: '2rem', color: 'var(--info)' }} />
        </div>
        <h4 className="fw-bold mb-2">Verify OTP</h4>
        <p className="text-muted" style={{ fontSize: '0.95rem' }}>
          Enter the 6-digit OTP sent to <strong>{email}</strong>
        </p>
      </div>

      <div className="d-flex justify-content-center gap-2 mb-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
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

      {/* Demo only - show OTP */}
      {otpDemo && (
        <div className="alert alert-info text-center py-2" style={{ fontSize: '0.85rem', borderRadius: '8px' }}>
          Demo OTP: <strong>{otpDemo}</strong>
        </div>
      )}

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
          'Verify OTP'
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
  );

  const renderNewPasswordStep = () => (
    <>
      <div className="text-center mb-4">
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
          style={{ width: '80px', height: '80px', background: 'rgba(0,168,107,0.1)' }}
        >
          <FiLock style={{ fontSize: '2rem', color: 'var(--primary)' }} />
        </div>
        <h4 className="fw-bold mb-2">Set New Password</h4>
        <p className="text-muted" style={{ fontSize: '0.95rem' }}>
          Create a strong password for your account
        </p>
      </div>

      <div className="form-floating mb-3">
        <input
          type="password"
          className={`form-control ${validationErrors.newPassword ? 'is-invalid' : ''}`}
          id="newPassword"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setValidationErrors({});
          }}
        />
        <label htmlFor="newPassword">
          <FiLock className="me-2" style={{ color: 'var(--text-light)' }} />
          New Password
        </label>
        {validationErrors.newPassword && (
          <div className="invalid-feedback">{validationErrors.newPassword}</div>
        )}
      </div>

      <div className="form-floating mb-3">
        <input
          type="password"
          className={`form-control ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
          id="confirmPassword"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setValidationErrors({});
          }}
        />
        <label htmlFor="confirmPassword">
          <FiLock className="me-2" style={{ color: 'var(--text-light)' }} />
          Confirm New Password
        </label>
        {validationErrors.confirmPassword && (
          <div className="invalid-feedback">{validationErrors.confirmPassword}</div>
        )}
      </div>

      {newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 && (
        <div className="mb-3" style={{ color: 'var(--success)', fontSize: '0.9rem' }}>
          <FiCheckCircle className="me-1" /> Passwords match and meet requirements
        </div>
      )}

      <button
        className="btn btn-primary w-100"
        onClick={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Resetting...
          </>
        ) : (
          'Reset Password'
        )}
      </button>
    </>
  );

  const renderSuccessStep = () => (
    <div className="text-center">
      <div
        className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
        style={{ width: '100px', height: '100px', background: 'rgba(46,204,113,0.1)' }}
      >
        <FiCheckCircle style={{ fontSize: '3rem', color: 'var(--success)' }} />
      </div>
      <h4 className="fw-bold mb-3">Password Reset Successful!</h4>
      <p className="text-muted mb-4">
        Your password has been successfully reset. You can now login with your new password.
      </p>
      <button
        className="btn btn-primary px-5 d-flex align-items-center gap-2 mx-auto"
        onClick={() => navigate('/login')}
      >
        Go to Login <FiArrowRight />
      </button>
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button
          className="btn btn-link text-decoration-none p-0 mb-3"
          onClick={() => step === 1 ? navigate('/login') : setStep(step - 1)}
          style={{ color: 'var(--text-secondary)' }}
        >
          <FiArrowLeft className="me-1" /> {step === 1 ? 'Back to Login' : 'Back'}
        </button>

        <div className="auth-logo">
          <div className="brand">Fin<span>Wise</span> AI</div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`alert d-flex align-items-center gap-2 py-2 px-3 ${isError ? 'alert-danger' : 'alert-success'}`} role="alert" style={{ borderRadius: '8px', fontSize: '0.9rem' }}>
            {isError ? <FiAlertCircle /> : <FiCheckCircle />}
            <span>{message}</span>
          </div>
        )}

        {step === 1 && renderEmailStep()}
        {step === 2 && renderOtpStep()}
        {step === 3 && renderNewPasswordStep()}
        {step === 4 && renderSuccessStep()}
      </div>
    </div>
  );
};

export default ForgotPassword;


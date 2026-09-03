import React from 'react';
import { SignInButton } from '@clerk/clerk-react';
import { FiAlertCircle, FiShield } from 'react-icons/fi';

/**
 * Clerk Email OTP / Magic Link Login
 *
 * Uses Clerk's official <SignInButton> modal (the same approach as Clerk's
 * official template). Clicking it opens Clerk's built-in sign-in modal, which
 * handles CAPTCHA / bot detection, email OTP verification, and session
 * creation automatically.
 *
 * This lets users sign in reliably with the Clerk account created at
 * registration (same email).
 */
const ClerkOtpLogin = () => {
  return (
    <div className="clerk-auth-centered">
      <div className="text-center mb-4">
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
          style={{ width: '70px', height: '70px', background: 'rgba(52,152,219,0.1)' }}
        >
          <FiShield style={{ fontSize: '1.8rem', color: 'var(--info)' }} />
        </div>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          Sign in securely with email verification via Clerk
        </p>
      </div>

      <SignInButton
        mode="modal"
        fallbackRedirectUrl="/onboarding"
        signUpFallbackRedirectUrl="/onboarding"
        appearance={{
          elements: {
            formButtonPrimary: {
              background: 'var(--primary)',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 600,
            },
            formFieldInput: {
              borderRadius: '10px',
              padding: '0.9rem 1rem',
            },
            footerActionLink: {
              color: 'var(--primary)',
            },
          },
        }}
      >
        <button className="btn btn-primary w-100" type="button">
          <FiShield className="me-2" />
          Sign In with Clerk OTP
        </button>
      </SignInButton>

      <div className="alert alert-info d-flex align-items-center gap-2 py-2 px-3 mt-3" role="alert" style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
        <FiAlertCircle className="flex-shrink-0" />
        <span>
          Click the button above to open Clerk's secure sign-in form. Use the email you registered with.
        </span>
      </div>
    </div>
  );
};

export default ClerkOtpLogin;

import React from 'react';
import { useClerk } from '@clerk/clerk-react';
import { FiLogOut } from 'react-icons/fi';

/**
 * Renders a logout button that signs the user out of Clerk.
 * This component must only be rendered when a <ClerkProvider> is present.
 * Accepts an optional onSignOut callback to run after signing out.
 */
const ClerkSignOutButton = ({ onSignOut }) => {
  const clerk = useClerk();

  const handleSignOut = async () => {
    try {
      await clerk.signOut();
    } catch (e) {
      // Ignore sign-out errors
    }
    if (onSignOut) {
      onSignOut();
    }
  };

  return (
    <button
      className="dropdown-item text-danger"
      onClick={handleSignOut}
      style={{ borderRadius: '8px', padding: '8px 16px' }}
    >
      <FiLogOut className="me-2" /> Logout
    </button>
  );
};

export default ClerkSignOutButton;

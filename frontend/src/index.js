import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';
import { ClerkProvider } from '@clerk/clerk-react';

// Clerk publishable key from .env
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

const root = ReactDOM.createRoot(document.getElementById('root'));

// If a real Clerk key is configured, wrap the app with ClerkProvider.
// Otherwise, fall back to the existing (mock) auth system.
const hasValidClerkKey = !!clerkPubKey && !clerkPubKey.includes('YOUR_CLERK');

root.render(
  <React.StrictMode>
    {hasValidClerkKey ? (
      <ClerkProvider publishableKey={clerkPubKey}>
        <App />
      </ClerkProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>
);


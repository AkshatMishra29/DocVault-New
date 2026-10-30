import React from 'react';
import { AuthProvider } from '../features/auth/context/AuthContext';

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}


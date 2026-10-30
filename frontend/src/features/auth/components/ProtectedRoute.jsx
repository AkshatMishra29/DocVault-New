import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, isVaultUnlocked, pendingEmail } = useAuth();

  // If no user session is present, go to login
  if (!user && !pendingEmail) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in with password but vault PIN is locked, go to PIN entry screen
  if (!isVaultUnlocked) {
    return <Navigate to="/enter-pin" replace />;
  }

  return children;
}

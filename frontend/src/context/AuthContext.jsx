import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('docvault_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('docvault_token') || null);
  
  // Track if vault PIN is currently unlocked for this active session
  // Default to false so on reopen it requires the quick-unlock PIN
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(() => {
    return sessionStorage.getItem('docvault_unlocked') === 'true';
  });

  const [pendingEmail, setPendingEmail] = useState(() => {
    const saved = localStorage.getItem('docvault_user');
    const u = saved ? JSON.parse(saved) : null;
    return sessionStorage.getItem('docvault_pending_email') || u?.email || '';
  });

  const [pinLength, setPinLength] = useState(() => {
    const saved = localStorage.getItem('docvault_user');
    const u = saved ? JSON.parse(saved) : null;
    return parseInt(sessionStorage.getItem('docvault_pin_length') || u?.pinLength || '4', 10);
  });

  // Step 1 Login Success -> Prompt for PIN
  const handleLoginSuccess = (userData, requiresPin = true) => {
    setUser(userData);
    setPendingEmail(userData.email);
    const len = userData.pinLength || 4;
    setPinLength(len);
    sessionStorage.setItem('docvault_pin_length', len.toString());
    sessionStorage.setItem('docvault_pending_email', userData.email);
    localStorage.setItem('docvault_user', JSON.stringify(userData));
    setIsVaultUnlocked(false);
    sessionStorage.removeItem('docvault_unlocked');
  };

  // Step 2 PIN Verification Success (or post-register) -> Unlock App
  const handlePinSuccess = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    setPendingEmail(userData.email);
    if (userData.pinLength) {
      setPinLength(userData.pinLength);
      sessionStorage.setItem('docvault_pin_length', userData.pinLength.toString());
    }
    setIsVaultUnlocked(true);
    localStorage.setItem('docvault_token', authToken);
    localStorage.setItem('docvault_user', JSON.stringify(userData));
    sessionStorage.setItem('docvault_unlocked', 'true');
    sessionStorage.setItem('docvault_pending_email', userData.email);
  };

  // Lock Vault (keeps user credentials saved, requires PIN to re-enter)
  const lockVault = () => {
    setIsVaultUnlocked(false);
    sessionStorage.removeItem('docvault_unlocked');
  };

  // Full Logout (clears all session & remembered credentials, returns to email/pass login)
  const logout = () => {
    setUser(null);
    setToken(null);
    setPendingEmail('');
    setIsVaultUnlocked(false);
    localStorage.removeItem('docvault_user');
    localStorage.removeItem('docvault_token');
    sessionStorage.removeItem('docvault_unlocked');
    sessionStorage.removeItem('docvault_pending_email');
    sessionStorage.removeItem('docvault_pin_length');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isVaultUnlocked,
        pendingEmail,
        pinLength,
        setPinLength,
        setPendingEmail,
        handleLoginSuccess,
        handlePinSuccess,
        lockVault,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

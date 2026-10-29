import { API_BASE_URL } from "../config.js";
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, KeyRound, ArrowRight, AlertCircle, Delete, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function EnterPinPage() {
  const navigate = useNavigate();
  const { pendingEmail, user, pinLength, setPinLength, handlePinSuccess, logout } = useAuth();

  const activeEmail = pendingEmail || user?.email || '';
  const targetLength = pinLength || user?.pinLength || 4;

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKeypadPress = useCallback((val) => {
    setPin((prev) => (prev.length < targetLength ? prev + val : prev));
  }, [targetLength]);

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const handleVerifyPin = async (e) => {
    if (e) e.preventDefault();
    if (pin.length !== targetLength) {
      setError(`Please enter your complete ${targetLength}-digit PIN.`);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: activeEmail, pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Incorrect Vault PIN.');
      }

      // Step 2 Success: Unlock application and enter
      handlePinSuccess(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  // Keyboard and PC Numpad listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Numbers from top row (0-9) and PC Numpad (Numpad0 - Numpad9)
      if (/^[0-9]$/.test(e.key)) {
        handleKeypadPress(e.key);
      } else if (e.code && e.code.startsWith('Numpad') && /^[0-9]$/.test(e.key)) {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        setPin('');
      } else if (e.key === 'Enter') {
        if (pin.length === targetLength && !loading) {
          handleVerifyPin();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, targetLength, loading, handleKeypadPress, handleDelete]);

  return (
    <div className="auth-page">
      <div className="auth-card pin-screen-card">
        <div className="auth-header">
          <div className="auth-logo-box pin-logo">
            <Lock size={28} color="#fff" />
          </div>
          <h2 className="auth-title">
            {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Enter Vault PIN'}
          </h2>
          <p className="auth-subtitle">
            {activeEmail ? (
              <span>Locked vault for <strong>{activeEmail}</strong></span>
            ) : (
              <span>Enter your <strong>{targetLength}-digit</strong> personal unlock code</span>
            )}
          </p>
        </div>

        {/* Clean PIN prompt without confusing manual length toggle */}
        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* PIN Dots Indicator - dynamically renders exact dots for 4 or 6 */}
        <div className="pin-indicator-row">
          {Array.from({ length: targetLength }).map((_, idx) => (
            <div
              key={idx}
              className={`pin-dot ${idx < pin.length ? 'filled' : ''}`}
            ></div>
          ))}
        </div>

        {/* Numeric Keypad for Mobile-First Usage */}
        <div className="numeric-keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              className="keypad-digit"
              onClick={() => handleKeypadPress(num.toString())}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            className="keypad-digit action-key"
            onClick={() => setPin('')}
          >
            Clear
          </button>
          <button
            type="button"
            className="keypad-digit"
            onClick={() => handleKeypadPress('0')}
          >
            0
          </button>
          <button
            type="button"
            className="keypad-digit action-key"
            onClick={handleDelete}
          >
            <Delete size={20} />
          </button>
        </div>

        <button
          type="button"
          className="btn-primary auth-btn"
          disabled={pin.length !== targetLength || loading}
          onClick={handleVerifyPin}
        >
          <span>{loading ? 'Decrypting Vault...' : 'Unlock Application'}</span>
          <ArrowRight size={18} />
        </button>

        <div className="auth-footer" style={{ marginTop: '16px' }}>
          <button 
            type="button"
            className="switch-user-btn" 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              cursor: 'pointer',
              padding: '8px 12px',
              textDecoration: 'underline'
            }}
            onClick={() => { logout(); navigate('/login'); }}
          >
            Not {user?.name || 'you'}? Sign in as another user
          </button>
        </div>
      </div>
    </div>
  );
}

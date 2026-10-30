import { API_BASE_URL } from '../../../services/api';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, isVaultUnlocked, handleLoginSuccess, logout } = useAuth();

  React.useEffect(() => {
    // If user is already fully authenticated with valid PIN unlocked:
    if (user && isVaultUnlocked) {
      navigate('/', { replace: true });
    }
  }, [user, isVaultUnlocked, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Login failed. Please check your credentials.');
      }

      // Step 1 Success: Route to Enter PIN screen
      handleLoginSuccess(data.user, true);
      navigate('/enter-pin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header Branding */}
        <div className="auth-header">
          <div className="auth-logo-box">
            <ShieldCheck size={28} color="#fff" />
          </div>
          <h2 className="auth-title">Welcome to DocVault</h2>
          <p className="auth-subtitle">Enter your email & master password to begin</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="auth-form" onSubmit={handleSubmit} method="post" autoComplete="on">
          <div className="form-group">
            <label className="input-label" htmlFor="login-email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="login-email"
                type="email"
                name="email"
                autoComplete="username email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="login-password">Master Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            <span>{loading ? 'Authenticating...' : 'Continue to Vault PIN'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <span>Don't have a secure vault?</span>
          <Link to="/register" className="auth-link">Create Account & PIN</Link>
        </div>
      </div>
    </div>
  );
}

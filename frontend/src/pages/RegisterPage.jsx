import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, KeyRound, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { handlePinSuccess } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    pin: '',
    confirmPin: '',
  });

  const [pinType, setPinType] = useState(4); // 4 or 6 digits
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinTypeChange = (type) => {
    setPinType(type);
    setFormData((prev) => ({ ...prev, pin: '', confirmPin: '' }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.pin !== formData.confirmPin) {
      setError('Vault PINs do not match. Please re-enter.');
      return;
    }

    if (formData.pin.length !== pinType) {
      setError(`PIN must be exactly ${pinType} numeric digits.`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          pin: formData.pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to create vault account.');
      }

      // Automatically unlock application after registration
      handlePinSuccess(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-box">
            <ShieldCheck size={28} color="#fff" />
          </div>
          <h2 className="auth-title">Create Encrypted Vault</h2>
          <p className="auth-subtitle">Set up your credentials and personal quick-unlock PIN</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} method="post" autoComplete="on">
          <div className="form-group">
            <label className="input-label" htmlFor="register-name">Full Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="register-name"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Akshat Mishra"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="register-email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="register-email"
                type="email"
                name="email"
                autoComplete="username email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="register-password">Master Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
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

          {/* PIN Format Toggle Selector */}
          <div className="pin-format-toggle-group">
            <label className="input-label">Select PIN Format</label>
            <div className="pin-type-toggle">
              <button
                type="button"
                className={`pin-toggle-btn ${pinType === 4 ? 'active' : ''}`}
                onClick={() => handlePinTypeChange(4)}
              >
                4-Digit PIN (Standard)
              </button>
              <button
                type="button"
                className={`pin-toggle-btn ${pinType === 6 ? 'active' : ''}`}
                onClick={() => handlePinTypeChange(6)}
              >
                6-Digit PIN (Enhanced Security)
              </button>
            </div>
          </div>

          {/* Login PIN Creation Row */}
          <div className="pin-creation-grid">
            <div className="form-group">
              <label className="input-label" htmlFor="register-pin">
                Set {pinType}-Digit PIN
              </label>
              <div className="input-wrapper">
                <KeyRound size={18} className="input-icon" />
                <input
                  id="register-pin"
                  type="password"
                  name="pin"
                  placeholder={pinType === 4 ? "• • • •" : "• • • • • •"}
                  maxLength={pinType}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={formData.pin}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label" htmlFor="register-confirm-pin">
                Confirm {pinType}-Digit PIN
              </label>
              <div className="input-wrapper">
                <KeyRound size={18} className="input-icon" />
                <input
                  id="register-confirm-pin"
                  type="password"
                  name="confirmPin"
                  placeholder={pinType === 4 ? "• • • •" : "• • • • • •"}
                  maxLength={pinType}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={formData.confirmPin}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            <span>{loading ? 'Creating Vault...' : 'Create Vault & Activate'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have a vault?</span>
          <Link to="/login" className="auth-link">Login Here</Link>
        </div>
      </div>
    </div>
  );
}

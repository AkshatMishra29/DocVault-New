import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import logoImg from "../../../assets/logoDV.png";
import "./Auth.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.requiresPin) {
        navigate("/enter-pin", { state: { email } });
      } else {
        navigate("/dashboard");
      }
    } else {
      setError(result.error || "Authentication failed. Please check your credentials.");
    }
  };

  return (
    <div className="arcana-auth-page">
      <div className="arcana-auth-wrapper">
        {/* Left Side: Clean Minimalist Sign In Form */}
        <div className="arcana-form-side">
          <div className="arcana-form-content">
            {/* Top Logo */}
            <Link to="/" className="arcana-brand-logo">
              <img src={logoImg} alt="DocVault" className="arcana-brand-logo__img" />
              <span className="arcana-brand-logo__text">DocVault</span>
            </Link>

            <h1 className="arcana-title">Sign in</h1>

            {error && (
              <div className="arcana-alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="arcana-form">
              <div className="arcana-field">
                <label className="arcana-label">Email Address</label>
                <div className="arcana-input-wrap">
                  <Mail size={16} className="arcana-input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="johndoe@gmail.com"
                    required
                  />
                </div>
              </div>

              <div className="arcana-field">
                <label className="arcana-label">Password</label>
                <div className="arcana-input-wrap">
                  <Lock size={16} className="arcana-input-icon" />
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    required
                  />
                </div>
              </div>

              <div className="arcana-remember-wrap">
                <label className="arcana-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="arcana-custom-checkbox"></span>
                  <span className="arcana-checkbox-text">Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                className="arcana-submit-btn"
                disabled={loading}
              >
                <span>{loading ? "Signing in..." : "Sign In"}</span>
              </button>
            </form>

            <div className="arcana-links-row">
              <span className="arcana-links-text">Don't have an account? </span>
              <Link to="/register" className="arcana-link-bold">Sign up</Link>
            </div>
            <div className="arcana-links-row forgot">
              <Link to="/login" className="arcana-link-muted">Forgot Password</Link>
            </div>

            {/* Social Logins */}
            <div className="arcana-socials">
              {/* Google */}
              <button type="button" className="arcana-social-btn" aria-label="Google sign in">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>

              {/* GitHub */}
              <button type="button" className="arcana-social-btn" aria-label="GitHub sign in">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0F172A">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </button>

              {/* Facebook / Alternate */}
              <button type="button" className="arcana-social-btn" aria-label="Facebook sign in">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Sleek Deep Pitch Black Card with 3D Monolith Emblem */}
        <div className="arcana-hero-side">
          <div className="arcana-black-card">
            {/* Top Light Streaks */}
            <div className="arcana-light-streak"></div>

            {/* 3D Geometric Monolith Emblem */}
            <div className="arcana-monolith-wrap">
              <svg className="arcana-monolith-svg" viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="facetLeft" x1="160" y1="20" x2="60" y2="240" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#4B5563" />
                    <stop offset="40%" stop-color="#374151" />
                    <stop offset="100%" stop-color="#1F2937" />
                  </linearGradient>
                  <linearGradient id="facetRight" x1="160" y1="20" x2="260" y2="240" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#374151" />
                    <stop offset="60%" stop-color="#1F2937" />
                    <stop offset="100%" stop-color="#111827" />
                  </linearGradient>
                  <linearGradient id="facetInner" x1="160" y1="130" x2="160" y2="200" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#9CA3AF" stop-opacity="0.2" />
                    <stop offset="100%" stop-color="#0F172A" stop-opacity="0.8" />
                  </linearGradient>
                  <filter id="monolithGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.8" />
                  </filter>
                </defs>
                <g filter="url(#monolithGlow)">
                  {/* Left Facet */}
                  <path d="M160 20L45 220H108L160 115L160 20Z" fill="url(#facetLeft)" />
                  {/* Right Facet */}
                  <path d="M160 20L275 220H212L160 115L160 20Z" fill="url(#facetRight)" />
                  {/* Crossbar Platform */}
                  <path d="M88 185H232L212 220H108L88 185Z" fill="#1A222F" />
                  {/* Inner Triangle Core Glow */}
                  <polygon points="160,115 118,185 202,185" fill="url(#facetInner)" />
                  {/* Inner Accent Spark */}
                  <polygon points="160,150 145,185 175,185" fill="#38BDF8" fill-opacity="0.25" />
                </g>
              </svg>
            </div>

            {/* Middle Copy */}
            <div className="arcana-card-copy">
              <span className="arcana-brand-pill">DocVault</span>
              <h2 className="arcana-welcome-heading">Welcome to DocVault</h2>
              <p className="arcana-welcome-desc">
                DocVault helps individuals & teams build organized and bank-grade encrypted vaults full of automated OCR modules. Join us and start securing your documents today.
              </p>
              <span className="arcana-stats-line">More than 17k people joined us, it’s your turn</span>
            </div>

            {/* Bottom Floating Rounded Dark Bubble */}
            <div className="arcana-bottom-bubble">
              <div className="arcana-bubble-left">
                <h3>Get your private vault and right place for documents</h3>
                <p>Be among the first custodians to experience the easiest way to organize a life.</p>
              </div>

              {/* Stacked Member Avatars */}
              <div className="arcana-avatar-stack">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Member" className="arcana-avatar-img" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Member" className="arcana-avatar-img" />
                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80" alt="Member" className="arcana-avatar-img" />
                <div className="arcana-avatar-badge">+2</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

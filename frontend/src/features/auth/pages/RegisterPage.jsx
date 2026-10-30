import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, Phone, KeyRound, AlertCircle, ArrowRight } from "lucide-react";
import DocVaultLogo from "../../../components/common/DocVaultLogo/DocVaultLogo";
import "./Auth.css";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    pin: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password || !formData.pin) {
      setError("Please fill out all required fields.");
      return;
    }

    if (formData.pin.length < 4 || formData.pin.length > 6 || !/^\d+$/.test(formData.pin)) {
      setError("Vault Security PIN must be between 4 and 6 numeric digits.");
      return;
    }

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="arcana-auth-page">
      <div className="arcana-auth-wrapper">
        {/* Left Side: Clean Minimalist Sign Up Form */}
        <div className="arcana-form-side">
          <div className="arcana-form-content">
            {/* Top Logo */}
            <Link to="/" className="arcana-brand-logo">
              <DocVaultLogo height={38} />
            </Link>

            <h1 className="arcana-title">Create account</h1>

            {error && (
              <div className="arcana-alert-error">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="arcana-form">
              <div className="arcana-form-row">
                <div className="arcana-field">
                  <label className="arcana-label">Full Name</label>
                  <div className="arcana-input-wrap">
                    <User size={15} className="arcana-input-icon" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Alex Hunter"
                      required
                    />
                  </div>
                </div>

                <div className="arcana-field">
                  <label className="arcana-label">Phone Number</label>
                  <div className="arcana-input-wrap">
                    <Phone size={15} className="arcana-input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="arcana-field">
                <label className="arcana-label">Email Address</label>
                <div className="arcana-input-wrap">
                  <Mail size={15} className="arcana-input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="alex.hunter@example.com"
                    required
                  />
                </div>
              </div>

              <div className="arcana-form-row">
                <div className="arcana-field">
                  <label className="arcana-label">Master Password</label>
                  <div className="arcana-input-wrap">
                    <Lock size={15} className="arcana-input-icon" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="••••••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="arcana-field">
                  <label className="arcana-label">Security PIN (4-6)</label>
                  <div className="arcana-input-wrap">
                    <KeyRound size={15} className="arcana-input-icon" />
                    <input
                      type="password"
                      name="pin"
                      maxLength={6}
                      value={formData.pin}
                      onChange={(e) => handleChange("pin", e.target.value.replace(/\D/g, ""))}
                      placeholder="••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="arcana-submit-btn"
                disabled={loading}
              >
                <span>{loading ? "Creating Vault..." : "Create Free Vault"}</span>
                <ArrowRight size={15} />
              </button>
            </form>

            <div className="arcana-links-row">
              <span className="arcana-links-text">Already have an account? </span>
              <Link to="/login" className="arcana-link-bold">Sign in</Link>
            </div>

            {/* Social Logins */}
            <div className="arcana-socials">
              <button type="button" className="arcana-social-btn" aria-label="Google sign up">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>

              <button type="button" className="arcana-social-btn" aria-label="GitHub sign up">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0F172A">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </button>

              <button type="button" className="arcana-social-btn" aria-label="Facebook sign up">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Deep Emerald & Slate Black Card with 3D Security Shield & Stepped Folder */}
        <div className="arcana-hero-side">
          <div className="arcana-black-card">
            {/* Ambient Lighting */}
            <div className="arcana-light-streak"></div>

            {/* 3D Bank-Grade Security Shield & Lock Artwork */}
            <div className="arcana-monolith-wrap">
              <svg className="arcana-monolith-svg" viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="regShieldEmeraldLeft" x1="160" y1="20" x2="60" y2="240" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#047857" />
                    <stop offset="50%" stop-color="#015A47" />
                    <stop offset="100%" stop-color="#064E3B" />
                  </linearGradient>
                  <linearGradient id="regShieldEmeraldRight" x1="160" y1="20" x2="260" y2="240" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#015A47" />
                    <stop offset="60%" stop-color="#064E3B" />
                    <stop offset="100%" stop-color="#022C22" />
                  </linearGradient>
                  <linearGradient id="regLockGold" x1="140" y1="120" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#34D399" />
                    <stop offset="100%" stop-color="#059669" />
                  </linearGradient>
                  <filter id="regShieldGlowGreen" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="14" stdDeviation="20" flood-color="#01362B" flood-opacity="0.85" />
                  </filter>
                </defs>
                <g filter="url(#regShieldGlowGreen)">
                  {/* Outer Shield Left Half */}
                  <path d="M160 20L60 62V145C60 205 102 248 160 262V20Z" fill="url(#regShieldEmeraldLeft)" />
                  {/* Outer Shield Right Half */}
                  <path d="M160 20L260 62V145C260 205 218 248 160 262V20Z" fill="url(#regShieldEmeraldRight)" />
                  {/* Inner Shield Inset */}
                  <path d="M160 38L78 72V142C78 192 113 230 160 244C207 230 242 192 242 142V72L160 38Z" fill="#031F19" fill-opacity="0.75" />
                  {/* Shield Center Divider */}
                  <path d="M160 38V244" stroke="rgba(52, 211, 153, 0.25)" stroke-width="2" />
                  {/* Floating Lock Shackle */}
                  <path d="M136 128V106C136 93 146.5 82 160 82C173.5 82 184 93 184 106V128" stroke="url(#regLockGold)" stroke-width="9" stroke-linecap="round" fill="none" />
                  {/* Lock Body */}
                  <rect x="124" y="124" width="72" height="58" rx="14" fill="url(#regLockGold)" />
                  {/* Lock Keyhole */}
                  <circle cx="160" cy="148" r="5" fill="#022C22" />
                  <path d="M157.5 151L156 166H164L162.5 151H157.5Z" fill="#022C22" />
                </g>
              </svg>
            </div>

            {/* Middle Copy */}
            <div className="arcana-card-copy">
              <span className="arcana-brand-pill">DocVault Sovereignty</span>
              <h2 className="arcana-welcome-heading">Create your safe vault</h2>
              <p className="arcana-welcome-desc">
                Provision your zero-knowledge personal vault. End-to-end encrypted storage with automated deadline extraction.
              </p>
              <span className="arcana-stats-line">More than 17k people joined us, it’s your turn</span>
            </div>

            {/* Authentic Stepped Folder Silhouette */}
            <div className="arcana-authentic-folder">
              <div className="arcana-folder-content">
                <div className="arcana-folder-left">
                  <h3>Get your private vault and right place for documents</h3>
                  <p>Be among the first custodians to experience sovereign file organization.</p>
                </div>

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
    </div>
  );
}

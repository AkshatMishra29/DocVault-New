import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import DocVaultLogo from "../../../components/common/DocVaultLogo/DocVaultLogo";
import { signInWithGoogle, sendEmailLoginLink, verifyEmailLinkSignIn } from "../../../services/firebase";
import "./Auth.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, loginWithFirebaseToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Listen for Email Link verification if returning from email inbox
  useEffect(() => {
    if (searchParams.get("emailLink") === "true") {
      (async () => {
        try {
          setLoading(true);
          const cred = await verifyEmailLinkSignIn();
          if (cred && cred.idToken) {
            const result = await loginWithFirebaseToken(cred.idToken);
            if (result.success) {
              navigate("/enter-pin", { state: { email: cred.email } });
              return;
            }
          }
        } catch (err) {
          setError(err.message || "Failed to verify email sign-in link.");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.requiresPin) {
        navigate("/enter-pin", { state: { email, pinLength: result.user?.pinLength || 4 } });
      } else {
        navigate("/enter-pin", { state: { email, pinLength: result.user?.pinLength || 4 } });
      }
    } else {
      setError(result.error || "Authentication failed. Please check your credentials.");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setInfoMessage("");
    setGoogleLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      if (googleUser && googleUser.idToken) {
        const result = await loginWithFirebaseToken(googleUser.idToken);
        if (result.success) {
          // ALWAYS ask for the PIN security challenge after Google OAuth
          navigate("/enter-pin", { state: { email: googleUser.email, pinLength: result.user?.pinLength || 4 } });
        } else {
          setError(result.error || "Google sign-in succeeded, but vault sync failed.");
        }
      }
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google authentication was cancelled or failed.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendEmailLink = async () => {
    if (!email) {
      setError("Please enter your email above before requesting an instant sign-in link.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await sendEmailLoginLink(email);
      setInfoMessage(`A secure magic login link has been sent to ${email}. Check your inbox!`);
    } catch (err) {
      setError(err.message || "Failed to send email login link.");
    } finally {
      setLoading(false);
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
              <DocVaultLogo height={38} />
            </Link>

            <h1 className="arcana-title">Sign in</h1>

            {error && (
              <div className="arcana-alert-error">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {infoMessage && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#10b981",
                fontSize: "13px",
                marginBottom: "16px"
              }}>
                <Sparkles size={16} />
                <span>{infoMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="arcana-form">
              <div className="arcana-field">
                <label className="arcana-label">Email Address</label>
                <div className="arcana-input-wrap">
                  <Mail size={15} className="arcana-input-icon" />
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
                  <Lock size={15} className="arcana-input-icon" />
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
                disabled={loading || googleLoading}
              >
                <span>{loading ? "Signing in..." : "Sign In to Vault"}</span>
                <ArrowRight size={15} />
              </button>
            </form>

            <div className="arcana-links-row">
              <span className="arcana-links-text">Don't have an account? </span>
              <Link to="/register" className="arcana-link-bold">Sign up</Link>
            </div>
            <div className="arcana-links-row forgot">
              <button
                type="button"
                onClick={handleSendEmailLink}
                style={{ background: "none", border: "none", color: "#64748b", fontSize: "12px", cursor: "pointer", textDecoration: "underline", padding: 0 }}
              >
                Forgot Password? Email me magic login link
              </button>
            </div>

            {/* Social Logins */}
            <div className="arcana-socials">
              <button
                type="button"
                className="arcana-social-btn"
                aria-label="Google sign in"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{googleLoading ? "Connecting..." : "Continue with Google"}</span>
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
                  <linearGradient id="shieldEmeraldLeft" x1="160" y1="20" x2="60" y2="240" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#047857" />
                    <stop offset="50%" stop-color="#015A47" />
                    <stop offset="100%" stop-color="#064E3B" />
                  </linearGradient>
                  <linearGradient id="shieldEmeraldRight" x1="160" y1="20" x2="260" y2="240" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#015A47" />
                    <stop offset="60%" stop-color="#064E3B" />
                    <stop offset="100%" stop-color="#022C22" />
                  </linearGradient>
                  <linearGradient id="lockGold" x1="140" y1="120" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#34D399" />
                    <stop offset="100%" stop-color="#059669" />
                  </linearGradient>
                  <filter id="shieldGlowGreen" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="14" stdDeviation="20" flood-color="#01362B" flood-opacity="0.85" />
                  </filter>
                </defs>
                <g filter="url(#shieldGlowGreen)">
                  {/* Outer Shield Left Half */}
                  <path d="M160 20L60 62V145C60 205 102 248 160 262V20Z" fill="url(#shieldEmeraldLeft)" />
                  {/* Outer Shield Right Half */}
                  <path d="M160 20L260 62V145C260 205 218 248 160 262V20Z" fill="url(#shieldEmeraldRight)" />
                  {/* Inner Shield Inset */}
                  <path d="M160 38L78 72V142C78 192 113 230 160 244C207 230 242 192 242 142V72L160 38Z" fill="#031F19" fill-opacity="0.75" />
                  {/* Shield Center Divider */}
                  <path d="M160 38V244" stroke="rgba(52, 211, 153, 0.25)" stroke-width="2" />
                  {/* Floating Lock Shackle */}
                  <path d="M136 128V106C136 93 146.5 82 160 82C173.5 82 184 93 184 106V128" stroke="url(#lockGold)" stroke-width="9" stroke-linecap="round" fill="none" />
                  {/* Lock Body */}
                  <rect x="124" y="124" width="72" height="58" rx="14" fill="url(#lockGold)" />
                  {/* Lock Keyhole */}
                  <circle cx="160" cy="148" r="5" fill="#022C22" />
                  <path d="M157.5 151L156 166H164L162.5 151H157.5Z" fill="#022C22" />
                </g>
              </svg>
            </div>

            {/* Middle Copy */}
            <div className="arcana-card-copy">
              <span className="arcana-brand-pill">DocVault Sovereignty</span>
              <h2 className="arcana-welcome-heading">Welcome to DocVault</h2>
              <p className="arcana-welcome-desc">
                DocVault helps individuals & teams build organized, bank-grade encrypted vaults with automated OCR extraction.
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

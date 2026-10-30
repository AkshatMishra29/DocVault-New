import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Mail, Lock, ArrowRight, AlertCircle, Sparkles, 
  CheckCircle2, ShieldCheck, KeyRound 
} from "lucide-react";
import logoImg from "../../../assets/logoDV.png";
import "./Auth.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="dv-auth-page">
      <div className="dv-auth-split">
        {/* Left Side: Brand Panel */}
        <div className="brand-panel">
          <div className="brand-panel__header">
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none" }}>
              <div className="dv-logo-icon">
                <img src={logoImg} alt="DocVault Logo" />
              </div>
              <span className="dv-logo-text">
                Doc<span>Vault</span>
              </span>
            </Link>
          </div>

          <div className="brand-content">
            <div className="brand-content__badge">
              <Sparkles size={15} /> Intelligent Document Security & AI
            </div>

            <h1>
              Your documents.<br />
              <span>Decrypted only for you.</span>
            </h1>

            <p>
              Log in to access your biometric PIN-protected documents, automated OCR extraction, and grounded AI assistant.
            </p>

            <div className="brand-features">
              <div className="brand-feature">
                <div className="brand-feature__icon">
                  <CheckCircle2 size={18} />
                </div>
                <span>End-to-end encrypted storage powered by Cloudflare R2</span>
              </div>
              <div className="brand-feature">
                <div className="brand-feature__icon">
                  <CheckCircle2 size={18} />
                </div>
                <span>Zero Hallucination AI citations straight from your docs</span>
              </div>
              <div className="brand-feature">
                <div className="brand-feature__icon">
                  <CheckCircle2 size={18} />
                </div>
                <span>Automated deadline tracking with calendar integration</span>
              </div>
            </div>
          </div>

          <div className="brand-footer">
            DocVault Platform © 2026. Zero-Knowledge Sovereignty.
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="form-panel">
          <div className="login-card">
            <div className="form-heading">
              <div className="form-heading-top">
                <div className="form-icon">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h2>Welcome Back</h2>
                  <p>Enter your master credentials to decrypt vault</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="dv-auth-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-field-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.hunter@example.com"
                    required
                  />
                </div>
              </div>

              <div className="input-field-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label>Master Password</label>
                </div>
                <div className="input-wrapper">
                  <Lock size={18} />
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                <span>{loading ? "Decrypting..." : "Verify Credentials"}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="form-footer">
              <span>New to DocVault?</span>
              <Link to="/register">Create a free vault</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

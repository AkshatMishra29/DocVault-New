import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, ShieldCheck, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import logoLight from "../../../assets/brand/docvault-logo.svg";
import logoDark from "../../../assets/brand/docvault-logo-dark.svg";
import Button from "../../../components/common/Button/Button";
import Input from "../../../components/common/Input/Input";
import Card from "../../../components/common/Card/Card";
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
        {/* Left Side: Brand Experience */}
        <div className="dv-auth-banner">
          <div className="dv-auth-banner__header">
            <Link to="/">
              <img src={logoDark} alt="DocVault" height="42" />
            </Link>
          </div>

          <div className="dv-auth-banner__content">
            <div className="dv-auth-banner__badge">
              <Sparkles size={14} /> Zero-Knowledge Security & AI
            </div>
            <h1 className="dv-auth-banner__title">
              Your documents.<br />
              <span className="dv-auth-banner__title-accent">Decrypted only for you.</span>
            </h1>
            <p className="dv-auth-banner__desc">
              Log in to access your biometric PIN-protected documents, intelligent OCR extraction, and grounded AI assistant.
            </p>

            <div className="dv-auth-banner__features">
              <div className="dv-auth-banner__feature">
                <div className="dv-auth-banner__feature-icon">
                  <CheckCircle2 size={16} />
                </div>
                <span>End-to-end encrypted storage powered by Cloudflare R2</span>
              </div>
              <div className="dv-auth-banner__feature">
                <div className="dv-auth-banner__feature-icon">
                  <CheckCircle2 size={16} />
                </div>
                <span>Zero Hallucination AI citations straight from your docs</span>
              </div>
              <div className="dv-auth-banner__feature">
                <div className="dv-auth-banner__feature-icon">
                  <CheckCircle2 size={16} />
                </div>
                <span>Automated deadline tracking with .ICS calendar export</span>
              </div>
            </div>
          </div>

          <div className="dv-auth-banner__footer">
            DocVault Platform © 2026. Enterprise grade document intelligence.
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="dv-auth-main">
          <div className="dv-auth-box">
            <div className="dv-auth-box__mobile-header">
              <Link to="/">
                <img src={logoLight} alt="DocVault" height="38" />
              </Link>
            </div>

            <Card padding="lg" className="dv-auth-card">
              <div className="dv-auth-card__header">
                <h2 className="dv-auth-card__title">Sign In</h2>
                <p className="dv-auth-card__subtitle">Enter your email and master password to proceed</p>
              </div>

              {error && (
                <div className="dv-auth-error">
                  <AlertCircle size={16} className="dv-auth-error__icon" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="dv-auth-form">
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.hunter@example.com"
                  icon={Mail}
                  required
                />

                <Input
                  label="Master Password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  icon={Lock}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Verify Credentials
                </Button>
              </form>

              <div className="dv-auth-card__footer">
                <span>New to DocVault?</span>
                <Link to="/register" className="dv-auth-link">
                  Create a free vault
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

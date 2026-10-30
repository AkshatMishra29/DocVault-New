import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import logoLight from "../../../assets/brand/docvault-logo.svg";
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
      <div className="dv-auth-container">
        <div className="dv-auth-brand">
          <Link to="/">
            <img src={logoLight} alt="DocVault" height="38" />
          </Link>
          <p className="dv-auth-tagline">Access your private document vault</p>
        </div>

        <Card padding="lg" className="dv-auth-card">
          <div className="dv-auth-card__header">
            <h2 className="dv-auth-card__title">Welcome Back</h2>
            <p className="dv-auth-card__subtitle">Step 1: Enter your registered credentials</p>
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
              icon={Mail}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
              className="dv-auth-submit-btn"
            >
              Continue to PIN Unlock
            </Button>
          </form>

          <div className="dv-auth-footer">
            <p>
              Don't have a vault yet?{" "}
              <Link to="/register" className="dv-auth-link">
                Create Account
              </Link>
            </p>
          </div>
        </Card>

        <div className="dv-auth-security-notice">
          <ShieldCheck size={16} color="#059669" />
          <span>Strict Tenant Isolation • Password & Personal Vault PIN Protected</span>
        </div>
      </div>
    </div>
  );
}

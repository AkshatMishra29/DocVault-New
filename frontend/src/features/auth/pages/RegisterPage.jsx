import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, Phone, KeyRound, ShieldCheck, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import DocVaultLogo from "../../../components/common/DocVaultLogo/DocVaultLogo";
import Button from "../../../components/common/Button/Button";
import Input from "../../../components/common/Input/Input";
import Card from "../../../components/common/Card/Card";
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
    <div className="dv-auth-page">
      <div className="dv-auth-split">
        {/* Left Side: Brand Value Proposition */}
        <div className="dv-auth-banner">
          <div className="dv-auth-banner__header">
            <Link to="/">
              <DocVaultLogo height={38} variant="light" />
            </Link>
          </div>

          <div className="dv-auth-banner__content">
            <div className="dv-auth-banner__badge">
              <Sparkles size={14} /> Instant Smart Provisioning
            </div>
            <h1 className="dv-auth-banner__title">
              Your AI Custodian<br />
              <span className="dv-auth-banner__title-accent">Ready in under 2 minutes.</span>
            </h1>
            <p className="dv-auth-banner__desc">
              Create your sovereign personal vault. Organize legal certificates, tax forms, passports, and warranties with automated expiry alerts.
            </p>

            <div className="dv-auth-banner__features">
              <div className="dv-auth-banner__feature">
                <div className="dv-auth-banner__feature-icon">
                  <CheckCircle2 size={16} />
                </div>
                <span>Two-factor vault architecture with secondary unlock PIN</span>
              </div>
              <div className="dv-auth-banner__feature">
                <div className="dv-auth-banner__feature-icon">
                  <CheckCircle2 size={16} />
                </div>
                <span>Auto-indexing OCR pipeline using Tesseract & Sharp</span>
              </div>
              <div className="dv-auth-banner__feature">
                <div className="dv-auth-banner__feature-icon">
                  <CheckCircle2 size={16} />
                </div>
                <span>Semantic AI Q&A powered by Groq LLaMA 3.3 70B</span>
              </div>
            </div>
          </div>

          <div className="dv-auth-banner__footer">
            DocVault Platform © 2026. AES-256 encrypted at rest & in transit.
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="dv-auth-main">
          <div className="dv-auth-box dv-auth-box--wide">
            <div className="dv-auth-box__mobile-header">
              <Link to="/">
                <DocVaultLogo height={36} />
              </Link>
            </div>

            <Card padding="lg" className="dv-auth-card">
              <div className="dv-auth-card__header">
                <h2 className="dv-auth-card__title">Create Account</h2>
                <p className="dv-auth-card__subtitle">Set up your credentials and secondary security PIN</p>
              </div>

              {error && (
                <div className="dv-auth-error">
                  <AlertCircle size={16} className="dv-auth-error__icon" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="dv-auth-form">
                <div className="dv-auth-form-row">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Alex Hunter"
                    icon={User}
                    required
                  />

                  <Input
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    icon={Phone}
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="alex.hunter@example.com"
                  icon={Mail}
                  required
                />

                <Input
                  label="Master Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Min 8 characters"
                  icon={Lock}
                  required
                />

                <Input
                  label="Vault Security PIN (4-6 Digits)"
                  type="password"
                  name="pin"
                  maxLength={6}
                  value={formData.pin}
                  onChange={(e) => handleChange("pin", e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  icon={KeyRound}
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
                  Create Secure Vault
                </Button>
              </form>

              <div className="dv-auth-card__footer">
                <span>Already have an account?</span>
                <Link to="/login" className="dv-auth-link">
                  Sign In
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, Phone, KeyRound, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import logoLight from "../../../assets/brand/docvault-logo.svg";
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
      <div className="dv-auth-container">
        <div className="dv-auth-brand">
          <Link to="/">
            <img src={logoLight} alt="DocVault" height="38" />
          </Link>
          <p className="dv-auth-tagline">Create your private document vault</p>
        </div>

        <Card padding="lg" className="dv-auth-card">
          <div className="dv-auth-card__header">
            <h2 className="dv-auth-card__title">Create Your Vault</h2>
            <p className="dv-auth-card__subtitle">Zero-knowledge document management with dual-tier security</p>
          </div>

          {error && (
            <div className="dv-auth-error">
              <AlertCircle size={16} className="dv-auth-error__icon" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="dv-auth-form">
            <Input
              label="Full Name"
              type="text"
              icon={User}
              placeholder="Alex Henderson"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="alex@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />

            <Input
              label="Vault Unlock PIN (4 to 6 Digits)"
              type="password"
              inputMode="numeric"
              maxLength={6}
              icon={KeyRound}
              placeholder="••••"
              value={formData.pin}
              onChange={(e) => handleChange("pin", e.target.value.replace(/\D/g, ""))}
              required
            />

            <Input
              label="Phone Number (Optional)"
              type="tel"
              icon={Phone}
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
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
              Initialize Vault
            </Button>
          </form>

          <div className="dv-auth-footer">
            <p>
              Already registered?{" "}
              <Link to="/login" className="dv-auth-link">
                Sign In
              </Link>
            </p>
          </div>
        </Card>

        <div className="dv-auth-security-notice">
          <ShieldCheck size={16} color="#059669" />
          <span>Your PIN encrypts your quick-unlock session and is never stored in plain text.</span>
        </div>
      </div>
    </div>
  );
}

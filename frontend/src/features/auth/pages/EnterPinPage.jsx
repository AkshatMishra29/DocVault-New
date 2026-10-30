import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Delete, AlertCircle, ArrowLeft } from "lucide-react";
import logoLight from "../../../assets/brand/docvault-logo.svg";
import Card from "../../../components/common/Card/Card";
import Button from "../../../components/common/Button/Button";
import "./Auth.css";

export default function EnterPinPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { verifyPin, user } = useAuth();

  const email = location.state?.email || user?.email || localStorage.getItem("pending_pin_email") || "";

  useEffect(() => {
    if (email) {
      localStorage.setItem("pending_pin_email", email);
    } else {
      navigate("/login");
    }
  }, [email, navigate]);

  // Physical keyboard and PC Numpad listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape") {
        handleClear();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin]);

  const handleDigit = (digit) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError("");
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin("");
  };

  const handleUnlock = async () => {
    if (pin.length < 4) {
      setError("Please enter your complete 4 to 6 digit PIN.");
      return;
    }

    setLoading(true);
    setError("");
    const result = await verifyPin(email, pin);
    setLoading(false);

    if (result.success) {
      localStorage.removeItem("pending_pin_email");
      navigate("/dashboard");
    } else {
      setError(result.error || "Incorrect Security PIN. Please try again.");
      setPin("");
    }
  };

  return (
    <div className="dv-auth-page">
      <div className="dv-auth-container dv-auth-container--pin">
        <div className="dv-auth-brand">
          <Link to="/">
            <img src={logoLight} alt="DocVault" height="38" />
          </Link>
          <p className="dv-auth-tagline">Vault Security Challenge</p>
        </div>

        <Card padding="lg" className="dv-auth-card">
          <div className="dv-pin-header">
            <div className="dv-pin-shield">
              <ShieldCheck size={28} color="#2563EB" />
            </div>
            <h2 className="dv-auth-card__title">Enter Vault PIN</h2>
            <p className="dv-auth-card__subtitle">
              Authenticating session for <strong className="dv-pin-email">{email}</strong>
            </p>
          </div>

          {error && (
            <div className="dv-auth-error">
              <AlertCircle size={16} className="dv-auth-error__icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Masked PIN Slot Indicators */}
          <div className="dv-pin-slots" aria-label="PIN Slots">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className={`dv-pin-dot ${idx < pin.length ? "dv-pin-dot--filled" : ""} ${idx === pin.length ? "dv-pin-dot--active" : ""}`}
              />
            ))}
          </div>

          {/* On-Screen Hardware Keypad */}
          <div className="dv-keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                className="dv-keypad-btn"
                onClick={() => handleDigit(String(num))}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              className="dv-keypad-btn dv-keypad-btn--action"
              onClick={handleClear}
            >
              Clear
            </button>
            <button
              type="button"
              className="dv-keypad-btn"
              onClick={() => handleDigit("0")}
            >
              0
            </button>
            <button
              type="button"
              className="dv-keypad-btn dv-keypad-btn--action"
              onClick={handleBackspace}
              aria-label="Backspace"
            >
              <Delete size={20} />
            </button>
          </div>

          <Button
            variant="primary"
            size="lg"
            loading={loading}
            disabled={pin.length < 4}
            onClick={handleUnlock}
            className="dv-auth-submit-btn"
          >
            Unlock My Vault
          </Button>

          <div className="dv-auth-footer">
            <Link to="/login" className="dv-auth-link-back">
              <ArrowLeft size={14} /> Sign in as different user
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

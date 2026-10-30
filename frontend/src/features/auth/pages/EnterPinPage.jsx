import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Delete, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
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
      setError("Please enter your full PIN (4-6 digits).");
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
      setError(result.error || "Incorrect PIN. Please try again.");
      setPin("");
    }
  };

  return (
    <div className="dv-auth-page-centered">
      <div className="dv-auth-container--pin">
        <div className="dv-auth-brand" style={{ textAlign: "center", marginBottom: "24px" }}>
          <Link to="/">
            <img src={logoLight} alt="DocVault" height="42" />
          </Link>
          <p className="dv-auth-tagline" style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "8px" }}>
            Step 2: Vault Security Challenge
          </p>
        </div>

        <Card padding="lg" className="dv-auth-card">
          <div className="dv-auth-card__header" style={{ textAlign: "center" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "var(--color-primary)"
            }}>
              <KeyRound size={24} />
            </div>
            <h2 className="dv-auth-card__title">Enter Security PIN</h2>
            <p className="dv-auth-card__subtitle">
              Authenticating vault for <strong style={{ color: "var(--color-text-primary)" }}>{email}</strong>
            </p>
          </div>

          {error && (
            <div className="dv-auth-error">
              <AlertCircle size={16} className="dv-auth-error__icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Glowing Pin Slot Indicator */}
          <div className="dv-pin-display">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className={`dv-pin-slot ${pin.length > index ? "dv-pin-slot--filled" : ""}`}
              />
            ))}
          </div>

          {/* Interactive Numpad */}
          <div className="dv-pin-keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                className="dv-keypad-btn"
                onClick={() => handleDigit(digit.toString())}
              >
                {digit}
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
            >
              <Delete size={20} />
            </button>
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={pin.length < 4}
            onClick={handleUnlock}
            icon={ShieldCheck}
            iconPosition="right"
          >
            Decrypt & Unlock Vault
          </Button>

          <div className="dv-auth-card__footer">
            <Link to="/login" className="dv-auth-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

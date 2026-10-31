import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Delete, AlertCircle, ArrowLeft, KeyRound, Fingerprint } from "lucide-react";
import DocVaultLogo from "../../../components/common/DocVaultLogo/DocVaultLogo";
import Card from "../../../components/common/Card/Card";
import Button from "../../../components/common/Button/Button";
import "./Auth.css";

export default function EnterPinPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  const { verifyPin, unlockWithBiometrics } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || localStorage.getItem("pending_pin_email") || "";

  // Check if this device has registered biometrics
  const hasBiometrics = Boolean(email && localStorage.getItem(`dv_bio_cred_${email}`));

  // Check stored lockout state
  useEffect(() => {
    if (email) {
      const storedLock = localStorage.getItem(`dv_lock_until_${email}`);
      if (storedLock) {
        const remaining = Math.ceil((new Date(storedLock).getTime() - Date.now()) / 1000);
        if (remaining > 0) {
          setLockoutRemaining(remaining);
        } else {
          localStorage.removeItem(`dv_lock_until_${email}`);
        }
      }
    }
  }, [email]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (email) localStorage.removeItem(`dv_lock_until_${email}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining, email]);

  useEffect(() => {
    if (email) {
      localStorage.setItem("pending_pin_email", email);
    }
  }, [email]);

  // Keyboard support for physical numpads and standard digits
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lockoutRemaining > 0) return;

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (pin.length >= 4) {
          handleUnlock();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, lockoutRemaining]);

  const handleDigit = (digit) => {
    if (lockoutRemaining > 0) return;
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError("");
    }
  };

  const handleBackspace = () => {
    if (lockoutRemaining > 0) return;
    setPin((prev) => prev.slice(0, -1));
    setError("");
  };

  const handleClear = () => {
    if (lockoutRemaining > 0) return;
    setPin("");
  };

  const formatLockoutTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleUnlock = async () => {
    if (lockoutRemaining > 0) return;

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
      if (email) localStorage.removeItem(`dv_lock_until_${email}`);
      navigate("/dashboard");
    } else {
      setPin("");
      if (result.remainingSeconds || result.lockUntil) {
        const secs = result.remainingSeconds || 300;
        setLockoutRemaining(secs);
        if (email && result.lockUntil) {
          localStorage.setItem(`dv_lock_until_${email}`, result.lockUntil);
        }
        setError(result.error || "Vault is locked for 5 minutes due to too many failed attempts.");
      } else {
        setError(result.error || "Incorrect Security PIN. Please try again.");
      }
    }
  };

  const handleBiometricUnlock = async () => {
    if (lockoutRemaining > 0 || bioLoading) return;
    setError("");
    setBioLoading(true);
    const result = await unlockWithBiometrics(email);
    setBioLoading(false);

    if (result.success) {
      localStorage.removeItem("pending_pin_email");
      if (email) localStorage.removeItem(`dv_lock_until_${email}`);
      navigate("/dashboard");
    } else {
      if (result.remainingSeconds || result.lockUntil) {
        setLockoutRemaining(result.remainingSeconds || 300);
      }
      setError(result.error || "Biometric authentication failed. Please enter your PIN.");
    }
  };

  const isLocked = lockoutRemaining > 0;

  return (
    <div className="dv-auth-page-centered">
      <div className="dv-auth-container--pin">
        <div className="dv-auth-brand" style={{ textAlign: "center", marginBottom: "24px" }}>
          <Link to="/">
            <DocVaultLogo height={42} />
          </Link>
          <p className="dv-auth-tagline" style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "8px" }}>
            Step 2: Vault Security Challenge
          </p>
        </div>

        <Card padding="lg" className="dv-auth-card">
          <div className="dv-auth-card__header" style={{ textAlign: "center" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "var(--color-primary)",
              }}
            >
              <KeyRound size={24} />
            </div>
            <h2 className="dv-auth-card__title">
              {isLocked ? "Vault Temporarily Locked" : "Enter Security PIN"}
            </h2>
            <p className="dv-auth-card__subtitle">
              {isLocked ? (
                <span>
                  Security lockout active. Try again in{" "}
                  <strong>{formatLockoutTime(lockoutRemaining)}</strong>
                </span>
              ) : (
                <>
                  Authenticating session for{" "}
                  <strong className="dv-pin-email" style={{ color: "var(--color-primary)" }}>
                    {email || "User"}
                  </strong>
                </>
              )}
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
                style={isLocked ? { opacity: 0.4 } : {}}
              />
            ))}
          </div>

          {/* Interactive Numpad */}
          <div
            className="dv-pin-keypad"
            style={isLocked ? { opacity: 0.5, pointerEvents: "none" } : {}}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                className="dv-keypad-btn"
                disabled={isLocked}
                onClick={() => handleDigit(digit.toString())}
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              className="dv-keypad-btn dv-keypad-btn--action"
              disabled={isLocked}
              onClick={handleClear}
            >
              C
            </button>
            <button
              type="button"
              className="dv-keypad-btn"
              disabled={isLocked}
              onClick={() => handleDigit("0")}
            >
              0
            </button>
            <button
              type="button"
              className="dv-keypad-btn dv-keypad-btn--action"
              disabled={isLocked}
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
            disabled={pin.length < 4 || isLocked}
            onClick={handleUnlock}
            icon={ShieldCheck}
            iconPosition="right"
          >
            {isLocked ? `Locked (${formatLockoutTime(lockoutRemaining)})` : "Decrypt & Unlock Vault"}
          </Button>

          {/* Quick Biometric Fingerprint Button (Visible if enrolled on this device) */}
          {hasBiometrics && !isLocked && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              loading={bioLoading}
              icon={Fingerprint}
              onClick={handleBiometricUnlock}
              style={{
                width: "100%",
                marginTop: "12px",
                borderColor: "var(--color-primary-blue, #3b82f6)",
                color: "var(--color-primary-blue, #3b82f6)",
              }}
            >
              Touch ID / Fingerprint Unlock
            </Button>
          )}

          <div className="dv-auth-card__footer">
            <Link
              to="/login"
              className="dv-auth-link"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </Card>

        <div className="dv-auth-security-notice">
          <ShieldCheck size={16} color="var(--color-primary)" />
          <span>Strict Tenant Isolation • Password & Personal Vault PIN Protected</span>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  Lock,
  Sparkles,
  Info,
  CheckCircle2,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import AppHeader from "../../components/layout/AppHeader/AppHeader";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Badge from "../../components/common/Badge/Badge";
import { analyzePasswordStrength } from "./services/passwordStrengthService";
import { checkPasswordPwned } from "./services/hibpService";
import {
  generatePassword,
  generatePassphrase,
} from "./services/passwordGeneratorService";
import { analyzePinSecurity } from "./services/pinSecurityService";
import "./DocVaultShieldPage.css";

export default function DocVaultShieldPage() {
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, password, pin, generator, recommendations

  // --- Password Checker State ---
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pwdAnalysis, setPwdAnalysis] = useState(null);
  const [hibpLoading, setHibpLoading] = useState(false);
  const [hibpResult, setHibpResult] = useState(null);
  const [breachCheckCount, setBreachCheckCount] = useState(() => {
    return parseInt(localStorage.getItem("dv_shield_breach_checks") || "0", 10);
  });
  const [copiedPwd, setCopiedPwd] = useState(false);

  // Live password strength analysis
  useEffect(() => {
    if (!passwordInput) {
      setPwdAnalysis(null);
      setHibpResult(null);
      return;
    }
    const result = analyzePasswordStrength(passwordInput);
    setPwdAnalysis(result);
  }, [passwordInput]);

  // Clean memory on unmount
  useEffect(() => {
    return () => {
      setPasswordInput("");
      setPwdAnalysis(null);
      setHibpResult(null);
    };
  }, []);

  const handleCheckBreach = async () => {
    if (!passwordInput) return;
    setHibpLoading(true);
    setHibpResult(null);
    try {
      const res = await checkPasswordPwned(passwordInput);
      setHibpResult(res);
      const newCount = breachCheckCount + 1;
      setBreachCheckCount(newCount);
      localStorage.setItem("dv_shield_breach_checks", String(newCount));
    } catch {
      setHibpResult({
        status: "unverified",
        message: "Network or HIBP service currently unavailable.",
      });
    } finally {
      setHibpLoading(false);
    }
  };

  // --- PIN Security State ---
  const [pinInput, setPinInput] = useState("");
  const [pinLengthMode, setPinLengthMode] = useState(4); // 4 or 6
  const [pinAnalysis, setPinAnalysis] = useState(null);

  useEffect(() => {
    if (!pinInput) {
      setPinAnalysis(null);
      return;
    }
    const cleanPin = pinInput.replace(/\D/g, "").slice(0, pinLengthMode);
    if (cleanPin !== pinInput) {
      setPinInput(cleanPin);
      return;
    }
    const result = analyzePinSecurity(cleanPin, pinLengthMode);
    setPinAnalysis(result);
  }, [pinInput, pinLengthMode]);

  // --- Generator State ---
  const [genMode, setGenMode] = useState("password"); // 'password' | 'passphrase'
  const [genLength, setGenLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [passphraseWordCount, setPassphraseWordCount] = useState(4);
  const [generatedResult, setGeneratedResult] = useState("");
  const [generatorStrength, setGeneratorStrength] = useState(null);
  const [copiedGen, setCopiedGen] = useState(false);

  const handleGenerate = () => {
    let result = "";
    if (genMode === "password") {
      result = generatePassword({
        length: genLength,
        uppercase: includeUpper,
        lowercase: includeLower,
        numbers: includeNumbers,
        symbols: includeSymbols,
        excludeAmbiguous,
      });
    } else {
      result = generatePassphrase({
        wordCount: passphraseWordCount,
        separator: "-",
        capitalize: true,
        includeNumber: true,
      });
    }
    setGeneratedResult(result);
    setGeneratorStrength(analyzePasswordStrength(result));
    setCopiedGen(false);
  };

  useEffect(() => {
    handleGenerate();
  }, [
    genMode,
    genLength,
    includeUpper,
    includeLower,
    includeNumbers,
    includeSymbols,
    excludeAmbiguous,
    passphraseWordCount,
  ]);

  const handleCopyGenerated = async () => {
    if (!generatedResult) return;
    try {
      await navigator.clipboard.writeText(generatedResult);
      setCopiedGen(true);
      setTimeout(() => setCopiedGen(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyInputPwd = async () => {
    if (!passwordInput) return;
    try {
      await navigator.clipboard.writeText(passwordInput);
      setCopiedPwd(true);
      setTimeout(() => setCopiedPwd(false), 2000);
    } catch {
      // Fallback
    }
  };

  const getScoreColorClass = (score) => {
    switch (score) {
      case 0:
        return "active-very-weak";
      case 1:
        return "active-weak";
      case 2:
        return "active-good";
      case 3:
      case 4:
        return "active-strong";
      default:
        return "";
    }
  };

  return (
    <div className="dv-shield-page">
      <AppHeader
        title="DocVault Shield"
        subtitle="Privacy-First Password & PIN Security Architecture"
      />

      {/* Hero Badge */}
      <div className="dv-shield-hero">
        <div className="dv-shield-hero__info">
          <div className="dv-shield-hero__icon">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="dv-shield-hero__title">
              DocVault Shield Security Center
            </h2>
            <p className="dv-shield-hero__subtitle">
              Client-side cryptographic entropy analysis & k-Anonymity breach detection
            </p>
          </div>
        </div>
        <div className="dv-shield-hero__privacy-badge">
          <Lock size={14} />
          100% Zero-Knowledge Device Local
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dv-shield-tabs">
        <button
          className={`dv-shield-tab ${activeTab === "dashboard" ? "dv-shield-tab--active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <ShieldCheck size={16} />
          Dashboard
        </button>
        <button
          className={`dv-shield-tab ${activeTab === "password" ? "dv-shield-tab--active" : ""}`}
          onClick={() => setActiveTab("password")}
        >
          <KeyRound size={16} />
          Password Checker
        </button>
        <button
          className={`dv-shield-tab ${activeTab === "pin" ? "dv-shield-tab--active" : ""}`}
          onClick={() => setActiveTab("pin")}
        >
          <Lock size={16} />
          PIN Security
        </button>
        <button
          className={`dv-shield-tab ${activeTab === "generator" ? "dv-shield-tab--active" : ""}`}
          onClick={() => setActiveTab("generator")}
        >
          <Sparkles size={16} />
          Password Generator
        </button>
        <button
          className={`dv-shield-tab ${activeTab === "recommendations" ? "dv-shield-tab--active" : ""}`}
          onClick={() => setActiveTab("recommendations")}
        >
          <Info size={16} />
          Recommendations
        </button>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="dv-shield-content">
          <div className="dv-shield-grid">
            <Card>
              <div className="dv-shield-card-header">
                <h3><KeyRound size={18} color="#38bdf8" /> Password Health</h3>
                <Badge variant={pwdAnalysis?.score >= 2 ? "success" : "info"}>
                  {pwdAnalysis ? pwdAnalysis.level.label : "Ready"}
                </Badge>
              </div>
              <p className="dv-shield-stat-label">Entropy Score</p>
              <div className="dv-shield-stat">
                {pwdAnalysis ? `${pwdAnalysis.entropy} bits` : "—"}
              </div>
              <p style={{ fontSize: "0.8125rem", color: "#94a3b8", margin: 0 }}>
                {pwdAnalysis
                  ? `Strength: ${pwdAnalysis.level.label} (${pwdAnalysis.length} chars)`
                  : "Enter a password in the checker to inspect entropy."}
              </p>
              <Button
                variant="secondary"
                size="sm"
                style={{ marginTop: "1rem", width: "100%" }}
                onClick={() => setActiveTab("password")}
              >
                Open Password Checker <ArrowRight size={14} style={{ marginLeft: 4 }} />
              </Button>
            </Card>

            <Card>
              <div className="dv-shield-card-header">
                <h3><Lock size={18} color="#10b981" /> PIN Protection</h3>
                <Badge variant={pinAnalysis ? (pinAnalysis.isBlocked ? "danger" : "success") : "neutral"}>
                  {pinAnalysis ? (pinAnalysis.isBlocked ? "Flagged" : pinAnalysis.riskLevel.label) : "Configured"}
                </Badge>
              </div>
              <p className="dv-shield-stat-label">Device Lockout Shield</p>
              <div className="dv-shield-stat">Active</div>
              <p style={{ fontSize: "0.8125rem", color: "#94a3b8", margin: 0 }}>
                5-attempt lockout, 10-min auto-lock, and WebAuthn Biometrics active.
              </p>
              <Button
                variant="secondary"
                size="sm"
                style={{ marginTop: "1rem", width: "100%" }}
                onClick={() => setActiveTab("pin")}
              >
                Evaluate PIN Security <ArrowRight size={14} style={{ marginLeft: 4 }} />
              </Button>
            </Card>

            <Card>
              <div className="dv-shield-card-header">
                <h3><ShieldAlert size={18} color="#f59e0b" /> HIBP Range Checks</h3>
                <Badge variant="info">k-Anonymity</Badge>
              </div>
              <p className="dv-shield-stat-label">Breach Inquiries Performed</p>
              <div className="dv-shield-stat">{breachCheckCount}</div>
              <p style={{ fontSize: "0.8125rem", color: "#94a3b8", margin: 0 }}>
                Queries transmit only a 5-char SHA-1 prefix over HTTPS with zero full hashes sent.
              </p>
              <Button
                variant="secondary"
                size="sm"
                style={{ marginTop: "1rem", width: "100%" }}
                onClick={() => setActiveTab("generator")}
              >
                Generate Secure Password <ArrowRight size={14} style={{ marginLeft: 4 }} />
              </Button>
            </Card>
          </div>

          <div className="dv-privacy-banner">
            <Info size={20} color="#38bdf8" style={{ flexShrink: 0 }} />
            <div>
              <strong>DocVault Shield Privacy Guarantee:</strong>
              <p style={{ margin: "0.25rem 0 0" }}>
                All password and PIN analyses are conducted entirely in your browser's local memory.
                No passwords, PINs, or SHA-1 hashes are ever transmitted to DocVault backend servers
                or saved to any database. Have I Been Pwned checks adhere strictly to k-Anonymity standards.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PASSWORD CHECKER */}
      {activeTab === "password" && (
        <div className="dv-shield-content">
          <Card>
            <div className="dv-shield-card-header">
              <h3><KeyRound size={18} color="#38bdf8" /> Analyze Password Strength & Breaches</h3>
              <Badge variant="neutral">In-Memory Only</Badge>
            </div>

            <div className="dv-shield-input-group">
              <label className="dv-shield-input-label">
                <span>Enter Password to Inspect</span>
                {pwdAnalysis && (
                  <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                    Length: {pwdAnalysis.length} chars
                  </span>
                )}
              </label>
              <div className="dv-shield-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="dv-shield-input"
                  placeholder="Type a password to test..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoComplete="off"
                  spellCheck="false"
                />
                <button
                  type="button"
                  className="dv-shield-input-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {pwdAnalysis && (
              <div style={{ marginTop: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#f8fafc" }}>
                    Strength: {pwdAnalysis.level.label}
                  </span>
                  <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                    Entropy: ~{pwdAnalysis.entropy} bits
                  </span>
                </div>

                <div className="dv-strength-meter">
                  {[0, 1, 2, 3].map((step) => {
                    const isActive = pwdAnalysis.score >= step;
                    const colorClass = isActive ? getScoreColorClass(pwdAnalysis.score) : "";
                    return <div key={step} className={`dv-strength-segment ${colorClass}`} />;
                  })}
                </div>

                {/* Recommendations */}
                {pwdAnalysis.recommendations && pwdAnalysis.recommendations.length > 0 && (
                  <ul className="dv-recommendations-list">
                    {pwdAnalysis.recommendations.map((tip, idx) => (
                      <li key={idx} className="dv-recommendations-item">
                        <AlertTriangle size={14} color="#f59e0b" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* HIBP Breach Checker Trigger */}
                <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={hibpLoading}
                    onClick={handleCheckBreach}
                  >
                    <ShieldCheck size={16} style={{ marginRight: 6 }} />
                    Check Have I Been Pwned Breaches
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyInputPwd}
                  >
                    {copiedPwd ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                    <span style={{ marginLeft: 6 }}>{copiedPwd ? "Copied" : "Copy"}</span>
                  </Button>
                </div>

                {/* HIBP Status Result */}
                {hibpResult && (
                  <div
                    className={`dv-hibp-box ${
                      hibpResult.status === "compromised"
                        ? "dv-hibp-box--compromised"
                        : hibpResult.status === "safe"
                        ? "dv-hibp-box--safe"
                        : "dv-hibp-box--unverified"
                    }`}
                  >
                    <div className="dv-hibp-box__header">
                      {hibpResult.status === "compromised" ? (
                        <>
                          <AlertTriangle size={18} />
                          <span>Compromised in Known Data Breaches!</span>
                        </>
                      ) : hibpResult.status === "safe" ? (
                        <>
                          <CheckCircle2 size={18} />
                          <span>No Known Breaches Found</span>
                        </>
                      ) : (
                        <>
                          <Info size={18} />
                          <span>Breach Status Unverified</span>
                        </>
                      )}
                    </div>
                    <p className="dv-hibp-box__desc">
                      {hibpResult.status === "compromised" && (
                        <>
                          This password was seen <strong>{hibpResult.count.toLocaleString()}</strong> times in public data breaches.
                          Attackers frequently use credential stuffing bots with this string. You should not use this password.
                        </>
                      )}
                      {hibpResult.status === "safe" && (
                        <>
                          This password does not appear in any known Have I Been Pwned breach archives (out of 900M+ pwned passwords).
                        </>
                      )}
                      {hibpResult.status === "unverified" && (
                        <>{hibpResult.message || "Unable to reach Have I Been Pwned servers right now."}</>
                      )}
                    </p>
                    <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>
                      Queried prefix: <code>{hibpResult.prefix || "Local"}</code> (k-Anonymity preserved)
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 3: PIN SECURITY */}
      {activeTab === "pin" && (
        <div className="dv-shield-content">
          <Card>
            <div className="dv-shield-card-header">
              <h3><Lock size={18} color="#38bdf8" /> 4-Digit & 6-Digit PIN Security Evaluator</h3>
              <div className="dv-pin-length-toggle">
                <button
                  type="button"
                  className={`dv-pin-toggle-btn ${pinLengthMode === 4 ? "dv-pin-toggle-btn--active" : ""}`}
                  onClick={() => {
                    setPinLengthMode(4);
                    setPinInput("");
                  }}
                >
                  4 Digits
                </button>
                <button
                  type="button"
                  className={`dv-pin-toggle-btn ${pinLengthMode === 6 ? "dv-pin-toggle-btn--active" : ""}`}
                  onClick={() => {
                    setPinLengthMode(6);
                    setPinInput("");
                  }}
                >
                  6 Digits
                </button>
              </div>
            </div>

            <p style={{ fontSize: "0.875rem", color: "#94a3b8", marginTop: 0 }}>
              Test your Vault Unlock PIN against empirical attacker dictionaries, date combinations, and sequential patterns.
            </p>

            <div className="dv-shield-input-group">
              <label className="dv-shield-input-label">
                <span>Enter {pinLengthMode}-Digit PIN to Test</span>
                <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                  {pinInput.length}/{pinLengthMode}
                </span>
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={pinLengthMode}
                className="dv-shield-input"
                placeholder={`${pinLengthMode === 4 ? "e.g. 8492" : "e.g. 839174"}`}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                autoComplete="off"
              />
            </div>

            {pinAnalysis && (
              <div style={{ marginTop: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <Badge variant={!pinAnalysis.isBlocked && pinAnalysis.riskLevel.label.includes('Good') ? "success" : "danger"}>
                    {pinAnalysis.riskLevel.label}
                  </Badge>
                </div>

                {pinAnalysis.warnings && pinAnalysis.warnings.length > 0 ? (
                  <ul className="dv-recommendations-list">
                    {pinAnalysis.warnings.map((reason, idx) => (
                      <li key={idx} className="dv-recommendations-item" style={{ color: "#fca5a5" }}>
                        <AlertTriangle size={14} color="#ef4444" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: "0.8125rem", color: "#86efac", margin: "0.5rem 0" }}>
                    ✓ This PIN does not match common dictionary sequences or predictable repetition patterns.
                  </p>
                )}

                {pinAnalysis.suggestions && pinAnalysis.suggestions.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#cbd5e1" }}>
                      Security Suggestions:
                    </span>
                    <ul className="dv-recommendations-list">
                      {pinAnalysis.suggestions.map((sug, idx) => (
                        <li key={idx} className="dv-recommendations-item">
                          <CheckCircle2 size={14} color="#38bdf8" />
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 4: PASSWORD GENERATOR */}
      {activeTab === "generator" && (
        <div className="dv-shield-content">
          <Card>
            <div className="dv-shield-card-header">
              <h3><Sparkles size={18} color="#38bdf8" /> Cryptographically Secure Generator</h3>
              <div className="dv-pin-length-toggle">
                <button
                  type="button"
                  className={`dv-pin-toggle-btn ${genMode === "password" ? "dv-pin-toggle-btn--active" : ""}`}
                  onClick={() => setGenMode("password")}
                >
                  Password
                </button>
                <button
                  type="button"
                  className={`dv-pin-toggle-btn ${genMode === "passphrase" ? "dv-pin-toggle-btn--active" : ""}`}
                  onClick={() => setGenMode("passphrase")}
                >
                  Passphrase
                </button>
              </div>
            </div>

            <div className="dv-generated-display">
              <span>{generatedResult || "Click generate"}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyGenerated}
                title="Copy to clipboard"
              >
                {copiedGen ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                <span style={{ marginLeft: 6 }}>{copiedGen ? "Copied" : "Copy"}</span>
              </Button>
            </div>

            {generatorStrength && (
              <div style={{ marginTop: "0.75rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                  Strength: <strong style={{ color: "#38bdf8" }}>{generatorStrength.level.label}</strong>
                </span>
                <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                  Entropy: <strong>~{generatorStrength.entropy} bits</strong>
                </span>
                <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                  Length: <strong>{generatorStrength.length} chars</strong>
                </span>
              </div>
            )}

            {/* Config Options */}
            {genMode === "password" ? (
              <>
                <div style={{ marginTop: "1.25rem" }}>
                  <label className="dv-shield-input-label">
                    <span>Length: {genLength} characters</span>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Recommended ≥ 16</span>
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={genLength}
                    onChange={(e) => setGenLength(parseInt(e.target.value, 10))}
                    style={{ width: "100%", accentColor: "#38bdf8", cursor: "pointer" }}
                  />
                </div>

                <div className="dv-generator-options">
                  <label className="dv-checkbox-label">
                    <input
                      type="checkbox"
                      checked={includeUpper}
                      onChange={(e) => setIncludeUpper(e.target.checked)}
                    />
                    <span>Uppercase (A-Z)</span>
                  </label>
                  <label className="dv-checkbox-label">
                    <input
                      type="checkbox"
                      checked={includeLower}
                      onChange={(e) => setIncludeLower(e.target.checked)}
                    />
                    <span>Lowercase (a-z)</span>
                  </label>
                  <label className="dv-checkbox-label">
                    <input
                      type="checkbox"
                      checked={includeNumbers}
                      onChange={(e) => setIncludeNumbers(e.target.checked)}
                    />
                    <span>Numbers (0-9)</span>
                  </label>
                  <label className="dv-checkbox-label">
                    <input
                      type="checkbox"
                      checked={includeSymbols}
                      onChange={(e) => setIncludeSymbols(e.target.checked)}
                    />
                    <span>Special Characters (!@#$%...)</span>
                  </label>
                  <label className="dv-checkbox-label">
                    <input
                      type="checkbox"
                      checked={excludeAmbiguous}
                      onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                    />
                    <span>Exclude Ambiguous (l, 1, I, O, 0)</span>
                  </label>
                </div>
              </>
            ) : (
              <div style={{ marginTop: "1.25rem" }}>
                <label className="dv-shield-input-label">
                  <span>Passphrase Words: {passphraseWordCount} words</span>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Diceware Style</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={passphraseWordCount}
                  onChange={(e) => setPassphraseWordCount(parseInt(e.target.value, 10))}
                  style={{ width: "100%", accentColor: "#38bdf8", cursor: "pointer" }}
                />
              </div>
            )}

            <div className="dv-generator-actions">
              <Button variant="primary" onClick={handleGenerate}>
                <RefreshCw size={16} style={{ marginRight: 6 }} />
                Regenerate Secure Key
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: RECOMMENDATIONS */}
      {activeTab === "recommendations" && (
        <div className="dv-shield-content">
          <Card>
            <div className="dv-shield-card-header">
              <h3><FileCheck size={18} color="#10b981" /> DocVault Security Best Practices</h3>
              <Badge variant="success">Hardening Guide</Badge>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ padding: "0.75rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "0.5rem" }}>
                <h4 style={{ margin: "0 0 0.25rem", color: "#f8fafc", fontSize: "0.9375rem" }}>
                  1. Prefer Multi-Word Passphrases Over Obfuscation
                </h4>
                <p style={{ margin: 0, fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.45 }}>
                  A 4-word random passphrase (e.g. <code>Galaxy-Breeze-Castle-Pebble-42</code>) yields over 65 bits of entropy,
                  making it mathematically impervious to brute force while remaining effortlessly memorable.
                </p>
              </div>

              <div style={{ padding: "0.75rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "0.5rem" }}>
                <h4 style={{ margin: "0 0 0.25rem", color: "#f8fafc", fontSize: "0.9375rem" }}>
                  2. Never Reuse PINs Across Devices
                </h4>
                <p style={{ margin: 0, fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.45 }}>
                  Avoid using your banking PIN or ATM PIN for your DocVault PIN screen. Even with our 5-attempt lockout,
                  an attacker who knows your phone PIN should not immediately gain access to your critical documents.
                </p>
              </div>

              <div style={{ padding: "0.75rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "0.5rem" }}>
                <h4 style={{ margin: "0 0 0.25rem", color: "#f8fafc", fontSize: "0.9375rem" }}>
                  3. Enable Biometric Touch/Face Unlock
                </h4>
                <p style={{ margin: 0, fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.45 }}>
                  Under <em>Settings & Audit</em>, activate WebAuthn TouchID / Windows Hello / Android Biometrics.
                  Biometric signatures utilize hardware-backed enclave keys (Secure Enclave / TPM) that never leave the device.
                </p>
              </div>

              <div style={{ padding: "0.75rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "0.5rem" }}>
                <h4 style={{ margin: "0 0 0.25rem", color: "#f8fafc", fontSize: "0.9375rem" }}>
                  4. Keep Single Session & 10-Minute Auto-Lock Enabled
                </h4>
                <p style={{ margin: 0, fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.45 }}>
                  Single-session enforcement automatically terminates concurrent sessions across devices,
                  while the 10-minute resting timer protects against unauthorized physical access when your device is left unattended.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

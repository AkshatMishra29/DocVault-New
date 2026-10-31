import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/context/AuthContext";
import { apiRequest } from "../../services/api";
import { 
  FileText, UploadCloud, Calendar, Sparkles, Layers, ArrowRight,
  ShieldCheck, AlertTriangle, Clock, ChevronRight, Lock, KeyRound, Eye, EyeOff
} from "lucide-react";

import AppHeader from "../../components/layout/AppHeader/AppHeader";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Badge from "../../components/common/Badge/Badge";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import { analyzePasswordStrength } from "../shield/services/passwordStrengthService";
import { analyzePinSecurity } from "../shield/services/pinSecurityService";

import "./HomePage.css";

export default function HomePage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Security Copilot Advisor State
  const [testPassword, setTestPassword] = useState("");
  const [showTestPwd, setShowTestPwd] = useState(false);
  const [pwdAdvice, setPwdAdvice] = useState(null);
  const [testPin, setTestPin] = useState("");
  const [pinAdvice, setPinAdvice] = useState(null);

  useEffect(() => {
    if (testPassword) {
      setPwdAdvice(analyzePasswordStrength(testPassword));
    } else {
      setPwdAdvice(null);
    }
  }, [testPassword]);

  useEffect(() => {
    if (testPin) {
      setPinAdvice(analyzePinSecurity(testPin, testPin.length >= 5 ? 6 : 4));
    } else {
      setPinAdvice(null);
    }
  }, [testPin]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [docsRes, deadRes, assetsRes] = await Promise.all([
          apiRequest("/api/documents"),
          apiRequest("/api/deadlines"),
          apiRequest("/api/assets"),
        ]);

        if (docsRes.data) setDocuments(docsRes.data);
        if (deadRes.data) setDeadlines(deadRes.data);
        if (assetsRes.data) setAssets(assetsRes.data);
      } catch (err) {
        console.warn("[Dashboard] Error loading data:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const urgentDeadlines = deadlines.filter((d) => d.severity === "urgent" || (d.daysLeft && d.daysLeft <= 15));
  const recentDocs = documents.slice(0, 4);

  return (
    <div className="dv-dashboard">
      <AppHeader
        title={`Good morning, ${user?.name ? user.name.split(" ")[0] : "Vault Custodian"}`}
        subtitle="Here is your personal document repository and active policy status."
      />

      <div className="dv-dashboard__content">
        {/* Urgent Renewal Alert Banner */}
        {urgentDeadlines.length > 0 && (
          <div className="dv-alert-banner">
            <div className="dv-alert-banner__icon-box">
              <AlertTriangle size={20} color="#DC2626" />
            </div>
            <div className="dv-alert-banner__text">
              <h4>Renewal Attention Required</h4>
              <p>You have {urgentDeadlines.length} critical policy deadline(s) expiring within 15 days.</p>
            </div>
            <Link to="/deadlines">
              <Button variant="danger" size="sm">Review Deadlines</Button>
            </Link>
          </div>
        )}

        {/* Core Vault Metrics */}
        <div className="dv-stats-grid">
          <Card padding="md" className="dv-stat-card">
            <div className="dv-stat-card__icon-box dv-stat-card__icon-box--indigo">
              <FileText size={22} color="#6366F1" />
            </div>
            <div className="dv-stat-card__meta">
              <span className="dv-stat-card__label">Total Documents</span>
              <span className="dv-stat-card__value">{loading ? "..." : documents.length}</span>
            </div>
          </Card>

          <Card padding="md" className="dv-stat-card">
            <div className="dv-stat-card__icon-box dv-stat-card__icon-box--amber">
              <Calendar size={22} color="#F59E0B" />
            </div>
            <div className="dv-stat-card__meta">
              <span className="dv-stat-card__label">Active Deadlines</span>
              <span className="dv-stat-card__value">{loading ? "..." : deadlines.length}</span>
            </div>
          </Card>

          <Card padding="md" className="dv-stat-card">
            <div className="dv-stat-card__icon-box dv-stat-card__icon-box--emerald">
              <Layers size={22} color="#10B981" />
            </div>
            <div className="dv-stat-card__meta">
              <span className="dv-stat-card__label">Tracked Assets</span>
              <span className="dv-stat-card__value">{loading ? "..." : assets.length}</span>
            </div>
          </Card>

          <Card padding="md" className="dv-stat-card">
            <div className="dv-stat-card__icon-box dv-stat-card__icon-box--purple">
              <Sparkles size={22} color="#8B5CF6" />
            </div>
            <div className="dv-stat-card__meta">
              <span className="dv-stat-card__label">AI Assistant</span>
              <Link to="/ask-ai" style={{ fontSize: "13px", color: "var(--color-primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                Ask Copilot <ArrowRight size={14} />
              </Link>
            </div>
          </Card>
        </div>

        {/* AI Copilot Highlight Banner */}
        <div className="dv-ai-quick-query">
          <div className="dv-ai-quick-query__content">
            <div className="dv-ai-quick-query__icon-pulse">
              <Sparkles size={24} />
            </div>
            <div className="dv-ai-quick-query__text">
              <h3>Have a question about your policies or contracts?</h3>
              <p>Ask DocVault Copilot anything. Grounded strictly in your indexed documents.</p>
            </div>
          </div>
          <Link to="/ask-ai">
            <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
              Start Conversation
            </Button>
          </Link>
        </div>

        {/* Security Password & PIN Copilot Advisor (Non-blocking Guidance) */}
        <Card padding="lg" style={{ marginBottom: "24px", background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(1, 90, 71, 0.12)", color: "#015A47", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--color-text-primary)" }}>
                  Security Copilot Advisor
                </h3>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary)" }}>
                  Test passwords and PINs for rule compliance and vulnerabilities. Does not generate or save anything.
                </p>
              </div>
            </div>
            <Badge variant="info">Live Heuristic Copilot</Badge>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {/* Password Advisor */}
            <div style={{ padding: "14px", borderRadius: "8px", background: "var(--color-surface-secondary)", border: "1px solid var(--color-border-subtle)" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)", display: "block", marginBottom: "6px" }}>
                Evaluate a Password
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type={showTestPwd ? "text" : "password"}
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="Type any password to test..."
                  style={{
                    width: "100%",
                    padding: "8px 36px 8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    fontSize: "13px"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowTestPwd(!showTestPwd)}
                  style={{ position: "absolute", right: "8px", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
                >
                  {showTestPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwdAdvice && (
                <div style={{ marginTop: "10px", fontSize: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, color: pwdAdvice.score >= 2 ? "#10b981" : "#ef4444" }}>
                      Rating: {pwdAdvice.level.label}
                    </span>
                    <span style={{ color: "var(--color-text-muted)" }}>~{pwdAdvice.entropy} bits entropy</span>
                  </div>
                  {pwdAdvice.recommendations && pwdAdvice.recommendations.length > 0 && (
                    <ul style={{ margin: "6px 0 0", paddingLeft: "16px", color: "var(--color-text-secondary)" }}>
                      {pwdAdvice.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* PIN Advisor */}
            <div style={{ padding: "14px", borderRadius: "8px", background: "var(--color-surface-secondary)", border: "1px solid var(--color-border-subtle)" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)", display: "block", marginBottom: "6px" }}>
                Evaluate a PIN (4 or 6 Digits)
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={testPin}
                onChange={(e) => setTestPin(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 1234 or 8492"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  fontSize: "13px"
                }}
              />
              {pinAdvice && (
                <div style={{ marginTop: "10px", fontSize: "12px" }}>
                  <span style={{ fontWeight: 600, color: pinAdvice.isBlocked ? "#ef4444" : "#10b981" }}>
                    {pinAdvice.isBlocked ? "⚠️ Notice: Vulnerable / Predictable Pattern" : "✓ Acceptable Resistance Pattern"}
                  </span>
                  {pinAdvice.warnings && pinAdvice.warnings.length > 0 && (
                    <ul style={{ margin: "6px 0 0", paddingLeft: "16px", color: "#f87171" }}>
                      {pinAdvice.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Dual Layout: Recent Documents & Upcoming Deadlines */}
        <div className="dv-dash-dual-grid">
          {/* Left: Recent Documents */}
          <div className="dv-dash-pane">
            <div className="dv-dash-pane__header">
              <h2 className="dv-dash-pane__title">Recent Vault Documents</h2>
              <Link to="/documents" className="dv-dash-pane__action">
                View All <ChevronRight size={16} />
              </Link>
            </div>

            {loading ? (
              <Card padding="lg"><p className="dv-text-muted">Loading vault documents...</p></Card>
            ) : recentDocs.length === 0 ? (
              <EmptyState
                
                title="Your vault is currently empty"
                description="Upload your insurance policies, warranty cards, or identity proofs to enable automated OCR extraction."
                actionLabel="Upload First Document"
                onAction={() => window.location.href = "/upload"}
              />
            ) : (
              <div className="dv-doc-table-card">
                {recentDocs.map((doc) => (
                  <div key={doc._id} className="dv-doc-row">
                    <div className="dv-doc-row__icon-box">
                      <FileText size={18} color="#6366F1" />
                    </div>
                    <div className="dv-doc-row__details">
                      <span className="dv-doc-row__title">{doc.title || doc.filename || "Untitled"}</span>
                      <span className="dv-doc-row__meta">
                        {doc.documentType || "Standard Document"} • {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : "Stored"}
                      </span>
                    </div>
                    <Badge variant={doc.status === "ready" ? "success" : "default"} size="sm">
                      {doc.status || "ready"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Upcoming Deadlines */}
          <div className="dv-dash-pane">
            <div className="dv-dash-pane__header">
              <h2 className="dv-dash-pane__title">Upcoming Deadlines</h2>
              <Link to="/deadlines" className="dv-dash-pane__action">
                View Calendar <ChevronRight size={16} />
              </Link>
            </div>

            {loading ? (
              <Card padding="lg"><p className="dv-text-muted">Checking deadlines...</p></Card>
            ) : deadlines.length === 0 ? (
              <Card padding="lg" className="dv-empty-card">
                <Clock size={32} color="#94A3B8" />
                <p>No pending renewal deadlines</p>
                <span>Upload contracts or bills to automatically extract expiry schedules.</span>
              </Card>
            ) : (
              <div className="dv-deadline-list">
                {deadlines.slice(0, 4).map((d) => (
                  <div key={d._id} className="dv-deadline-row">
                    <div className="dv-deadline-row__left">
                      <span className="dv-deadline-row__title">{d.title || d.documentTitle}</span>
                      <span className="dv-deadline-row__date">
                        Due: {new Date(d.dueDate || d.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge 
                      variant={d.severity === "urgent" ? "danger" : d.severity === "warning" ? "warning" : "primary"}
                      size="sm"
                    >
                      {d.daysLeft !== undefined ? `${d.daysLeft}d left` : "Scheduled"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Launchpad Strip */}
        <div className="dv-launchpad">
          <Link to="/upload" className="dv-launchpad__item">
            <div className="dv-launchpad__icon dv-launchpad__icon--blue">
              <UploadCloud size={20} />
            </div>
            <div>
              <h5>Upload Document</h5>
              <p>Upload PDF, JPEG, or PNG for automatic text extraction</p>
            </div>
          </Link>

          <Link to="/assets" className="dv-launchpad__item">
            <div className="dv-launchpad__icon dv-launchpad__icon--emerald">
              <Layers size={20} />
            </div>
            <div>
              <h5>Track Asset</h5>
              <p>Record warranties, vehicles, electronics & bills</p>
            </div>
          </Link>

          <Link to="/ask-ai" className="dv-launchpad__item">
            <div className="dv-launchpad__icon dv-launchpad__icon--purple">
              <Sparkles size={20} />
            </div>
            <div>
              <h5>Query Copilot</h5>
              <p>Natural language Q&A across your complete vault</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

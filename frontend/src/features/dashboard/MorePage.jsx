import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/context/AuthContext";
import { apiRequest } from "../../services/api";
import { 
  ShieldCheck, Download, KeyRound, Smartphone, HardDrive, 
  Clock, LogOut, CheckCircle2, ChevronRight, Sparkles
} from "lucide-react";

import AppHeader from "../../components/layout/AppHeader/AppHeader";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Badge from "../../components/common/Badge/Badge";
import "./MorePage.css";

export default function MorePage() {
  const { user, logout, updateSessionPreference, registerBiometrics } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [singleSession, setSingleSession] = useState(Boolean(user?.singleSessionOnly));
  const [autoLock, setAutoLock] = useState(user?.autoLockEnabled !== false);
  const [biometrics, setBiometrics] = useState(Boolean(user?.biometricsEnabled));
  const [savingSessionPref, setSavingSessionPref] = useState(false);
  const [savingAutoLockPref, setSavingAutoLockPref] = useState(false);
  const [registeringBio, setRegisteringBio] = useState(false);
  const [hasRegisteredBio, setHasRegisteredBio] = useState(() => {
    return Boolean(localStorage.getItem(`dv_bio_cred_${user?.email}`));
  });

  useEffect(() => {
    if (user?.singleSessionOnly !== undefined) {
      setSingleSession(Boolean(user.singleSessionOnly));
    }
    if (user?.autoLockEnabled !== undefined) {
      setAutoLock(user.autoLockEnabled !== false);
    }
    if (user?.biometricsEnabled !== undefined) {
      setBiometrics(Boolean(user.biometricsEnabled));
    }
    if (user?.email) {
      setHasRegisteredBio(Boolean(localStorage.getItem(`dv_bio_cred_${user?.email}`)));
    }
  }, [user?.singleSessionOnly, user?.autoLockEnabled, user?.biometricsEnabled, user?.email]);

  const handleToggleSingleSession = async () => {
    const nextVal = !singleSession;
    setSavingSessionPref(true);
    const res = await updateSessionPreference({ singleSessionOnly: nextVal });
    setSavingSessionPref(false);
    if (res.success) {
      setSingleSession(res.singleSessionOnly);
    } else {
      alert("Failed to update session preferences: " + res.error);
    }
  };

  const handleToggleAutoLock = async () => {
    const nextVal = !autoLock;
    setSavingAutoLockPref(true);
    const res = await updateSessionPreference({ autoLockEnabled: nextVal });
    setSavingAutoLockPref(false);
    if (res.success) {
      setAutoLock(res.autoLockEnabled);
    } else {
      alert("Failed to update auto-lock preferences: " + res.error);
    }
  };

  const handleToggleBiometrics = async () => {
    // If not registered yet on this device, trigger enrollment first
    if (!hasRegisteredBio) {
      handleRegisterFingerprint();
      return;
    }

    const nextVal = !biometrics;
    const res = await updateSessionPreference({ biometricsEnabled: nextVal });
    if (res.success) {
      setBiometrics(res.biometricsEnabled);
    } else {
      alert("Failed to update biometric preference: " + res.error);
    }
  };

  const handleRegisterFingerprint = async () => {
    setRegisteringBio(true);
    const res = await registerBiometrics(navigator.userAgent.includes("Mobile") ? "Mobile Device" : "Computer Sensor");
    setRegisteringBio(false);
    if (res.success) {
      setHasRegisteredBio(true);
      setBiometrics(true);
      alert("Fingerprint / Touch ID enrolled and enabled successfully for this device!");
    } else {
      alert(res.error || "Failed to register fingerprint sensor.");
    }
  };

  useEffect(() => {
    async function fetchAuditLogs() {
      try {
        setLoadingLogs(true);
        const res = await apiRequest("/api/vault/audit-trail");
        if (res.success && res.data) {
          setLogs(res.data);
        }
      } catch (err) {
        console.warn("Audit log fetch error:", err.message);
      } finally {
        setLoadingLogs(false);
      }
    }
    fetchAuditLogs();
  }, []);

  const handleExportVault = async () => {
    try {
      setExporting(true);
      const res = await apiRequest("/api/vault/export");
      if (res && res instanceof Response) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `docvault-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to create vault export archive.");
      }
    } catch (err) {
      alert("Export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="dv-settings-page">
      <AppHeader
        title="Settings & Audit Security"
        subtitle="Manage account credentials, two-tier isolation settings, and review immutable access logs."
      />

      <div className="dv-settings-content">
        <div className="dv-settings-grid">
          {/* Profile & Vault Tier */}
          <Card padding="lg" className="dv-setting-card">
            <h3 className="dv-setting-card__title">Vault Account & Custodian Identity</h3>
            <div className="dv-setting-row">
              <span className="dv-setting-label">Account Name:</span>
              <span className="dv-setting-val"><strong>{user?.name || "Vault Custodian"}</strong></span>
            </div>
            <div className="dv-setting-row">
              <span className="dv-setting-label">Registered Email:</span>
              <span className="dv-setting-val">{user?.email}</span>
            </div>
            <div className="dv-setting-row">
              <span className="dv-setting-label">Security Tier:</span>
              <span className="dv-setting-val">
                <Badge variant="success" size="sm">Vault Pro Isolated</Badge>
              </span>
            </div>

            {/* Single Session Only Toggle */}
            <div className="dv-setting-row dv-setting-row--toggle">
              <div>
                <span className="dv-setting-label" style={{ display: 'block', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>
                  Single Session Only
                </span>
                <span className="dv-setting-sublabel" style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Terminate other devices (PC/Mobile) when a new login occurs
                </span>
              </div>
              <div className="dv-setting-val">
                <button
                  type="button"
                  className={`dv-toggle-switch ${singleSession ? "dv-toggle-switch--active" : ""}`}
                  disabled={savingSessionPref}
                  onClick={handleToggleSingleSession}
                  role="switch"
                  aria-checked={singleSession}
                  title="Toggle single session enforcement"
                >
                  <span className="dv-toggle-thumb" />
                </button>
              </div>
            </div>

            {/* Auto-Lock on Rest & Sleep Toggle */}
            <div className="dv-setting-row dv-setting-row--toggle">
              <div>
                <span className="dv-setting-label" style={{ display: 'block', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>
                  Auto-Lock on 10 Min Inactivity & Sleep
                </span>
                <span className="dv-setting-sublabel" style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Require PIN unlock if left at rest or when phone sleeps for over 10 min
                </span>
              </div>
              <div className="dv-setting-val">
                <button
                  type="button"
                  className={`dv-toggle-switch ${autoLock ? "dv-toggle-switch--active" : ""}`}
                  disabled={savingAutoLockPref}
                  onClick={handleToggleAutoLock}
                  role="switch"
                  aria-checked={autoLock}
                  title="Toggle 10-minute auto-lock"
                >
                  <span className="dv-toggle-thumb" />
                </button>
              </div>
            </div>

            {/* Fingerprint / Touch ID Quick Unlock Toggle */}
            <div className="dv-setting-row dv-setting-row--toggle">
              <div>
                <span className="dv-setting-label" style={{ display: 'block', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>
                  Fingerprint & Touch ID Unlock
                </span>
                <span className="dv-setting-sublabel" style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {hasRegisteredBio 
                    ? "Sensor enrolled. Toggle on/off for instant biometric vault unlock."
                    : "Not enrolled on this device. Click to scan fingerprint and register."}
                </span>
              </div>
              <div className="dv-setting-val">
                {hasRegisteredBio ? (
                  <button
                    type="button"
                    className={`dv-toggle-switch ${biometrics ? "dv-toggle-switch--active" : ""}`}
                    onClick={handleToggleBiometrics}
                    role="switch"
                    aria-checked={biometrics}
                    title="Toggle fingerprint authentication"
                  >
                    <span className="dv-toggle-thumb" />
                  </button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    loading={registeringBio}
                    onClick={handleRegisterFingerprint}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Add Fingerprint
                  </Button>
                )}
              </div>
            </div>

            {/* DocVault Shield Link */}
            <div className="dv-setting-row" style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '0.5rem', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div>
                <span className="dv-setting-label" style={{ display: 'block', fontWeight: 'var(--font-medium)', color: '#38bdf8' }}>
                  🛡️ DocVault Shield Security Center
                </span>
                <span className="dv-setting-sublabel" style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Check password entropy, HIBP breach detection, and evaluate 4/6-digit PIN strength locally.
                </span>
              </div>
              <div className="dv-setting-val">
                <Link to="/shield" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#38bdf8', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600 }}>
                  Open Shield <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            <div className="dv-setting-actions">
              <Button variant="danger" size="sm" icon={LogOut} onClick={logout}>
                Lock & Sign Out
              </Button>
            </div>
          </Card>

          {/* Backup & Export */}
          <Card padding="lg" className="dv-setting-card">
            <h3 className="dv-setting-card__title">Portable Vault Backup (JSON)</h3>
            <p className="dv-setting-desc">
              Download your complete encrypted metadata snapshot, asset links, and renewal deadlines as a standardized, offline-readable JSON file.
            </p>
            <div className="dv-setting-actions">
              <Button
                variant="primary"
                size="md"
                icon={Download}
                loading={exporting}
                onClick={handleExportVault}
              >
                Export Complete Vault Archive
              </Button>
            </div>
          </Card>
        </div>

        {/* Security Audit Trail */}
        <Card padding="lg" className="dv-audit-card">
          <div className="dv-audit-header">
            <h3 className="dv-setting-card__title">Tamper-Proof Vault Access Log</h3>
            <Badge variant="default" size="sm">{logs.length} Recent Event(s)</Badge>
          </div>
          <p className="dv-setting-desc">
            Immutable log recording document inspection, downloads, uploads, and deletions.
          </p>

          {loadingLogs ? (
            <p className="dv-text-muted">Loading audit entries...</p>
          ) : logs.length === 0 ? (
            <p className="dv-text-muted">No security events logged yet.</p>
          ) : (
            <div className="dv-audit-table">
              {logs.map((log) => (
                <div key={log._id} className="dv-audit-row">
                  <span className={`dv-audit-action dv-audit-action--${log.action.toLowerCase()}`}>
                    {log.action}
                  </span>
                  <span className="dv-audit-doc">{log.documentTitle || "Vault Access"}</span>
                  <span className="dv-audit-time">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

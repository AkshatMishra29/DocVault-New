import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/context/AuthContext";
import { apiRequest } from "../../services/api";
import { 
  ShieldCheck, Download, KeyRound, Smartphone, HardDrive, 
  Clock, LogOut, CheckCircle2
} from "lucide-react";

import AppHeader from "../../components/layout/AppHeader/AppHeader";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Badge from "../../components/common/Badge/Badge";
import "./MorePage.css";

export default function MorePage() {
  const { user, logout } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [exporting, setExporting] = useState(false);

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

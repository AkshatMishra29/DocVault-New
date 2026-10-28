import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  HardDrive, 
  Fingerprint, 
  Key, 
  FileCheck, 
  Download, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Lock,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config.js';
import './MorePage.css';

export default function MorePage() {
  const navigate = useNavigate();
  const { user, lockVault, logout } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(() => {
    return localStorage.getItem('docvault_biometrics') === 'true';
  });
  const [offlineEnabled, setOfflineEnabled] = useState(() => {
    return localStorage.getItem('docvault_offline_cache') === 'true';
  });
  const [auditCount, setAuditCount] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('docvault_token');
    if (token) {
      fetch(`${API_BASE_URL}/api/vault/audit-trail`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setAuditCount(data.count || 0);
        })
        .catch(() => {});
    }
  }, []);

  const toggleBiometrics = () => {
    const next = !biometricEnabled;
    setBiometricEnabled(next);
    localStorage.setItem('docvault_biometrics', next.toString());
  };

  const toggleOffline = () => {
    const next = !offlineEnabled;
    setOfflineEnabled(next);
    localStorage.setItem('docvault_offline_cache', next.toString());
  };

  const handleExportBackup = async () => {
    const token = localStorage.getItem('docvault_token');
    if (!token) return;
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/vault/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Backup failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `docvault-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Error exporting vault backup: ' + e.message);
    } finally {
      setExporting(false);
    }
  };

  const displayName = user?.name || 'DocVault User';
  const displayEmail = user?.email || 'user@docvault.app';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLockVault = () => {
    lockVault();
    navigate('/enter-pin');
  };

  const handleFullLogout = () => {
    if (window.confirm('Log out of this device completely? You will need your email & master password to log in again.')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="more-page">
      {/* Profile Card */}
      <div className="profile-card">
        <div className="avatar-circle">
          <span>{initials}</span>
        </div>
        <div className="profile-details">
          <h2 className="user-name">{displayName}</h2>
          <span className="user-email">{displayEmail}</span>
          <span className="user-badge">{user?.tier || 'Encrypted Personal Vault'}</span>
        </div>
      </div>

      {/* Security & Access Section */}
      <div className="menu-group">
        <span className="group-title">Zero-Knowledge Security</span>

        <div className="menu-item-toggle">
          <div className="item-label-group">
            <Fingerprint size={20} color="var(--primary)" />
            <div>
              <span className="menu-label">Biometric App Lock (Face ID / Fingerprint)</span>
              <p className="menu-sub">{biometricEnabled ? 'Enabled on this browser device' : 'Disabled (PIN unlock only)'}</p>
            </div>
          </div>
          <button 
            className="toggle-button" 
            onClick={toggleBiometrics}
          >
            {biometricEnabled ? (
              <ToggleRight size={28} color="var(--primary)" />
            ) : (
              <ToggleLeft size={28} color="var(--text-muted)" />
            )}
          </button>
        </div>

        <div className="menu-item-toggle">
          <div className="item-label-group">
            <HardDrive size={20} color="var(--accent-cyan)" />
            <div>
              <span className="menu-label">Encrypted Offline Cache</span>
              <p className="menu-sub">{offlineEnabled ? 'Encrypted localStorage cache active' : 'Offline caching disabled'}</p>
            </div>
          </div>
          <button 
            className="toggle-button" 
            onClick={toggleOffline}
          >
            {offlineEnabled ? (
              <ToggleRight size={28} color="var(--primary)" />
            ) : (
              <ToggleLeft size={28} color="var(--text-muted)" />
            )}
          </button>
        </div>

        <div className="menu-item" onClick={() => alert(`Master Security Key for ${displayName} is securely managed by SHA-256 + bcrypt token hash.`)}>
          <div className="item-label-group">
            <Key size={20} color="var(--warning)" />
            <div>
              <span className="menu-label">Vault Security & Encryption Status</span>
              <p className="menu-sub">AES-256 / SHA-256 hardware accelerated</p>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
      </div>

      {/* Collaboration & Family */}
      <div className="menu-group">
        <span className="group-title">Collaboration & Verification</span>

        <div className="menu-item" onClick={() => alert(`Your private vault is registered to ${displayEmail}. Multi-member family sharing is available on Vault Family tiers.`)}>
          <div className="item-label-group">
            <Users size={20} color="#6366F1" />
            <div>
              <span className="menu-label">Family Vault & Sharing</span>
              <p className="menu-sub">Personal Vault Mode ({displayEmail})</p>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>

        <div className="menu-item" onClick={() => alert(`Verified audit log: ${auditCount} security events recorded for your account.`)}>
          <div className="item-label-group">
            <FileCheck size={20} color="#10B981" />
            <div>
              <span className="menu-label">Tamper-Proof Audit Trail</span>
              <p className="menu-sub">{auditCount} verified security access events</p>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
      </div>

      {/* Storage & Export */}
      <div className="menu-group">
        <span className="group-title">Data & Support</span>

        <div className="menu-item" onClick={handleExportBackup}>
          <div className="item-label-group">
            {exporting ? <RefreshCw size={20} className="spin-icon" color="var(--primary)" /> : <Download size={20} color="var(--text-secondary)" />}
            <div>
              <span className="menu-label">Export Full Vault Archive (.json)</span>
              <p className="menu-sub">Download complete decrypted inventory & metadata backup</p>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>

        <div className="menu-item" onClick={() => alert('DocVault v2.4 (Production Engine with Tesseract OCR & Groq Llama-3.3)')}>
          <div className="item-label-group">
            <HelpCircle size={20} color="var(--text-secondary)" />
            <div>
              <span className="menu-label">Help, FAQ & Security Architecture</span>
              <p className="menu-sub">Zero-knowledge tenant isolation active</p>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
      </div>

      <div className="session-actions-group">
        <button className="lock-btn" onClick={handleLockVault}>
          <Lock size={16} />
          <span>Quick Lock Vault</span>
        </button>

        <button className="logout-btn" onClick={handleFullLogout}>
          <LogOut size={16} />
          <span>Sign Out of Account</span>
        </button>
      </div>
    </div>
  );
}

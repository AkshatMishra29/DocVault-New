import React, { useState } from 'react';
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
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockUser } from '../mockData';
import './MorePage.css';

export default function MorePage() {
  const navigate = useNavigate();
  const { user, lockVault, logout } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(mockUser.biometricsEnabled);
  const [offlineEnabled, setOfflineEnabled] = useState(mockUser.offlineAccessEnabled);

  const currentUser = user || mockUser;
  const displayName = currentUser.name || 'DocVault User';
  const displayEmail = currentUser.email || 'user@docvault.app';
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
          <span className="user-badge">{currentUser.tier || 'Encrypted Vault'}</span>
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
              <p className="menu-sub">Require biometrics on every app reopen</p>
            </div>
          </div>
          <button 
            className="toggle-button" 
            onClick={() => setBiometricEnabled(!biometricEnabled)}
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
              <p className="menu-sub">Access starred IDs without internet connectivity</p>
            </div>
          </div>
          <button 
            className="toggle-button" 
            onClick={() => setOfflineEnabled(!offlineEnabled)}
          >
            {offlineEnabled ? (
              <ToggleRight size={28} color="var(--primary)" />
            ) : (
              <ToggleLeft size={28} color="var(--text-muted)" />
            )}
          </button>
        </div>

        <div className="menu-item" onClick={() => alert('Recovery key backup modal')}>
          <div className="item-label-group">
            <Key size={20} color="var(--warning)" />
            <div>
              <span className="menu-label">Master Recovery Seed Key</span>
              <p className="menu-sub">Backed up & verified on 2026-01-05</p>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
      </div>

      {/* Family Sharing & Vaults */}
      <div className="menu-group">
        <span className="group-title">Collaboration & Family</span>

        <div className="menu-item" onClick={() => alert('Sharma Family Vault: 2 Members (Ramesh & Sunita)')}>
          <div className="item-label-group">
            <Users size={20} color="#6366F1" />
            <div>
              <span className="menu-label">Sharma Family Vault</span>
              <p className="menu-sub">Shared vehicle and property papers</p>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>

        <div className="menu-item" onClick={() => alert('Audit logs: 48 operations securely hashed')}>
          <div className="item-label-group">
            <FileCheck size={20} color="#10B981" />
            <div>
              <span className="menu-label">Tamper-Proof Audit Trail</span>
              <p className="menu-sub">{mockUser.auditLogsCount} verified access events recorded</p>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
      </div>

      {/* Storage & Export */}
      <div className="menu-group">
        <span className="group-title">Data & Support</span>

        <div className="menu-item" onClick={() => alert('Downloading encrypted .docvault bundle...')}>
          <div className="item-label-group">
            <Download size={20} color="var(--text-secondary)" />
            <div>
              <span className="menu-label">Export Full Encrypted Archive</span>
              <p className="menu-sub">Self-custody backup of your entire vault</p>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>

        <div className="menu-item" onClick={() => alert('DocVault v2.4 (Production Engine)')}>
          <div className="item-label-group">
            <HelpCircle size={20} color="var(--text-secondary)" />
            <div>
              <span className="menu-label">Help, FAQ & Security Whitepaper</span>
              <p className="menu-sub">Learn how client-side encryption works</p>
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

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import DocVaultLogo from '../../common/DocVaultLogo/DocVaultLogo';
import { 
  ArrowRight, Lock, LayoutDashboard, 
  Menu, X
} from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import './PublicNavbar.css';

export default function PublicNavbar() {
  const { user, isVaultUnlocked, lockVault } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleManualLock = () => {
    lockVault();
    navigate('/enter-pin', { state: { email: user?.email } });
  };

  return (
    <header className={`dv-public-navbar ${scrolled ? 'dv-public-navbar--scrolled' : ''}`} role="banner">
      <div className="dv-public-navbar__inner">
        {/* Left Cluster: Pure Text Wordmark */}
        <div className="dv-nav-left-cluster">
          <Link to="/" className="dv-nav-brand" title="DocVault - Sovereign Document Vault">
            <DocVaultLogo height={28} />
          </Link>
        </div>

        {/* Center Desktop Navigation: macOS Segmented Capsule */}
        <nav className="dv-nav-menu" aria-label="Primary Navigation">
          <a href="#features" className="dv-nav-link">
            <span>Features</span>
          </a>
          <a href="#intelligence" className="dv-nav-link">
            <span>Intelligence</span>
          </a>
          <a href="#how-it-works" className="dv-nav-link">
            <span>Workflow</span>
          </a>
          <a href="#security" className="dv-nav-link">
            <span>Security</span>
          </a>
          <a href="#faq" className="dv-nav-link">
            <span>FAQ</span>
          </a>
        </nav>

        {/* Right Actions: macOS Glass Pill Actions */}
        <div className="dv-nav-actions">
          {user && isVaultUnlocked ? (
            <div className="dv-nav-user-actions">
              <button
                type="button"
                onClick={handleManualLock}
                className="dv-nav-btn-lock"
                title="Lock vault session immediately"
              >
                <Lock size={12} />
                <span>Lock</span>
              </button>

              <Link to="/dashboard" className="dv-nav-btn-primary">
                <LayoutDashboard size={13} />
                <span>Vault</span>
              </Link>
            </div>
          ) : (
            <div className="dv-nav-auth-actions">
              <Link to="/login" className="dv-nav-btn-ghost">
                Sign In
              </Link>

              <Link to="/register" className="dv-nav-btn-primary">
                <span>Open Vault</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="dv-nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Glass Sheet Dropdown */}
      {mobileMenuOpen && (
        <div className="dv-nav-mobile-sheet">
          <nav className="dv-nav-mobile-links">
            <a href="#features" className="dv-nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              Features
            </a>
            <a href="#intelligence" className="dv-nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              Intelligence
            </a>
            <a href="#how-it-works" className="dv-nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              Workflow
            </a>
            <a href="#security" className="dv-nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              Security
            </a>
            <a href="#faq" className="dv-nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </a>
          </nav>

          <div className="dv-nav-mobile-sheet-actions">
            {!user ? (
              <>
                <Link to="/login" className="dv-nav-mobile-btn-ghost">
                  Sign In
                </Link>
                <Link to="/register" className="dv-nav-btn-primary dv-nav-mobile-btn-primary">
                  <span>Open Vault</span>
                  <ArrowRight size={14} />
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="dv-nav-btn-primary dv-nav-mobile-btn-primary">
                <span>Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

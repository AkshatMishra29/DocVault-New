import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import MobileAppAuthView from './MobileAppAuthView';
import PublicNavbar from '../../components/layout/PublicNavbar/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter/PublicFooter';
import { useAuth } from '../auth/context/AuthContext';

import { 
  ArrowRight, ShieldCheck, Sparkles, Clock, 
  FolderLock, HardDrive, FileCheck, CheckCircle2, 
  UploadCloud, Cpu, Layers, Search, Lock, Shield,
  KeyRound, ChevronRight, FileSpreadsheet,
  FileText, LayoutDashboard, Fingerprint, AlertCircle,
  ChevronDown, FileCheck2, ShieldAlert, Smartphone, HelpCircle,
  MessageSquare, Mail, Terminal
} from 'lucide-react';
import './LandingPage.css';

const FAQ_ITEMS = [
  {
    id: 1,
    tag: "Security Protocol",
    category: "security",
    icon: KeyRound,
    question: "How does the Two-Tier Vault PIN defense operate?",
    answer: "DocVault establishes a two-stage barrier. Tier 1 authenticates your master account credentials or verified Google OAuth session. Tier 2 strictly requires your personal 4 or 6-digit cryptographic Vault PIN or hardware biometrics (Touch ID / Face ID) to unlock the document workspace. Without the second-tier PIN, document content remains locked in restricted custody."
  },
  {
    id: 2,
    tag: "OCR & Processing",
    category: "intelligence",
    icon: FileCheck2,
    question: "What document formats and files are supported by automated extraction?",
    answer: "DocVault natively processes multi-page PDFs, scanned paperwork, camera captures, and high-resolution images (PNG, JPG, WebP). The ingestion pipeline applies Sharp contrast conditioning and noise reduction before deterministic rules extract Indian GSTINs, invoice totals, document dates, and policy identifiers."
  },
  {
    id: 3,
    tag: "Brute-Force Defense",
    category: "security",
    icon: ShieldAlert,
    question: "What happens if an unauthorized party attempts to guess my Vault PIN?",
    answer: "DocVault enforces an automated anti-tamper protocol: after 5 consecutive incorrect PIN entries, an immediate 5-minute cooldown lockout activates. Keypad interactions are disabled, and the security attempt is committed to your tamper-evident security audit log."
  },
  {
    id: 4,
    tag: "Device Hygiene",
    category: "session",
    icon: Smartphone,
    question: "Does the vault lock automatically when the device sleeps or stays idle?",
    answer: "Yes. To protect against physical intrusion on shared or unattended devices, the background inactivity monitor automatically relocks the vault whenever your device sleeps, the browser tab remains idle for over 10 minutes, or you switch workspaces."
  },
  {
    id: 5,
    tag: "Data Privacy",
    category: "security",
    icon: ShieldCheck,
    question: "How does DocVault handle sensitive national identity cards like Aadhaar or PAN?",
    answer: "Our centralized Privacy Policy Gate automatically identifies Indian National IDs (Aadhaar, PAN, Voter IDs) upon ingestion and routes them to a strict STORAGE_ONLY mode. These sensitive records are stored under client encryption keys and are never dispatched to external OCR APIs."
  },
  {
    id: 6,
    tag: "AI Intelligence",
    category: "intelligence",
    icon: Sparkles,
    question: "How does the AI Copilot prevent hallucinations when answering questions?",
    answer: "The DocVault Copilot operates on strict Retrieval-Augmented Generation (RAG) grounding gates. Every answer must reference an exact, verified text snippet from your uploaded documents. If the requested information is absent or ambiguous, the copilot explicitly declines rather than inventing details."
  }
];

export default function LandingPage() {
  const { user, isVaultUnlocked } = useAuth();
  const [openFaq, setOpenFaq] = useState(1);
  const [faqFilter, setFaqFilter] = useState('all');
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 1024;
    }
    return false;
  });
  const [forceDesktopWeb, setForceDesktopWeb] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (user && isVaultUnlocked) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isMobileOrTablet && !forceDesktopWeb) {
    return <MobileAppAuthView onSwitchToDesktopWeb={() => setForceDesktopWeb(true)} />;
  }

  const toggleFaq = (id) => {
    setOpenFaq(prev => prev === id ? null : id);
  };

  const filteredFaqs = faqFilter === 'all' 
    ? FAQ_ITEMS 
    : FAQ_ITEMS.filter(item => item.category === faqFilter);

  return (
    <div className="dv-landing-root">
      <PublicNavbar />

      {/* 1. PROFESSIONAL HERO SECTION (EXECUTIVE TYPOGRAPHIC ENCLAVE) */}
      <section className="dv-lp-hero" aria-labelledby="hero-title">
        <div className="dv-lp-hero__glow-orb" />
        
        <div className="dv-lp-hero__content">


          {/* Master Headline */}
          <h1 id="hero-title" className="dv-lp-hero__title">
            Your critical records.<br />
            <span className="dv-lp-hero__title-accent">Zero-knowledge custody.</span>
          </h1>

          {/* Subtitle Description */}
          <p className="dv-lp-hero__desc">
            End-to-end client-encrypted vaults, deterministic OCR intelligence, proactive renewal schedules, and a grounded AI copilot — built for individuals and family offices requiring sovereign privacy.
          </p>

          {/* Action CTAs */}
          <div className="dv-lp-hero__cta-row">
            {user && isVaultUnlocked ? (
              <Link to="/dashboard" className="dv-lp-btn-primary">
                <span>Go to Secure Dashboard</span>
                <LayoutDashboard size={15} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="dv-lp-btn-primary">
                  <span>Create Private Vault</span>
                  <ArrowRight size={15} />
                </Link>
                <Link to="/login" className="dv-lp-btn-secondary">
                  <Lock size={14} />
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>


        </div>

        {/* 4 Professional Pillar Cards */}
        <div className="dv-lp-pillars-wrapper">
          <div className="dv-lp-pillars-grid">
            <div className="dv-lp-pillar-card">
              <div className="dv-lp-pillar-icon">
                <Lock size={18} />
              </div>
              <div>
                <h5>Dual-Tier PIN Isolation</h5>
                <p>Master authentication backed by personal 4 or 6-digit cryptographic PIN challenge.</p>
              </div>
            </div>

            <div className="dv-lp-pillar-card">
              <div className="dv-lp-pillar-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <h5>Automated OCR Extraction</h5>
                <p>Deterministic parsing of invoice totals, Indian GSTINs, policies, and identifiers.</p>
              </div>
            </div>

            <div className="dv-lp-pillar-card">
              <div className="dv-lp-pillar-icon">
                <Clock size={18} />
              </div>
              <div>
                <h5>Proactive Renewal Guard</h5>
                <p>Automated timeline notifications delivered well before warranties or policies lapse.</p>
              </div>
            </div>

            <div className="dv-lp-pillar-card">
              <div className="dv-lp-pillar-icon">
                <FolderLock size={18} />
              </div>
              <div>
                <h5>Grounded AI Copilot</h5>
                <p>Query coverage details with citations strictly verified from your authenticated files.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE ARCHITECTURE STRIP */}
      <section id="features" className="dv-lp-section dv-lp-features">
        <div className="dv-lp-container">
          <div className="dv-lp-section-header">
            <span className="dv-lp-section-kicker">Core System Architecture</span>
            <h2 className="dv-lp-section-title">Built with defense-in-depth principles.</h2>
            <p className="dv-lp-section-desc">
              Every document is treated as highly sensitive data. DocVault protects your records at rest, in transit, and during AI interaction.
            </p>
          </div>

          <div className="dv-lp-features-grid">
            <div className="dv-lp-feature-card">
              <div className="dv-lp-feature-card__top">
                <div className="dv-lp-feat-icon dv-lp-feat-icon--emerald">
                  <ShieldCheck size={22} />
                </div>
                <span className="dv-lp-feat-badge">Layer 1</span>
              </div>
              <h3 className="dv-lp-feat-title">Zero-Knowledge Storage</h3>
              <p className="dv-lp-feat-desc">
                Your vault encryption keys never leave your device unencrypted. Even database administrators cannot inspect or read your documents.
              </p>
            </div>

            <div className="dv-lp-feature-card">
              <div className="dv-lp-feature-card__top">
                <div className="dv-lp-feat-icon dv-lp-feat-icon--copper">
                  <KeyRound size={22} />
                </div>
                <span className="dv-lp-feat-badge">Layer 2</span>
              </div>
              <h3 className="dv-lp-feat-title">Hardware Biometrics & PIN</h3>
              <p className="dv-lp-feat-desc">
                Unlock instantly via Touch ID, Face ID, or Windows Hello WebAuthn alongside your secondary PIN key.
              </p>
            </div>

            <div className="dv-lp-feature-card">
              <div className="dv-lp-feature-card__top">
                <div className="dv-lp-feat-icon dv-lp-feat-icon--taupe">
                  <FileCheck size={22} />
                </div>
                <span className="dv-lp-feat-badge">Layer 3</span>
              </div>
              <h3 className="dv-lp-feat-title">Deterministic OCR</h3>
              <p className="dv-lp-feat-desc">
                Sharp image enhancement cleans low-light phone captures before deterministic rule parsing extracts dates, amounts, and GSTINs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FAQ SECTION */}
      <section id="faq" className="dv-lp-section dv-lp-faq">
        <div className="dv-lp-container dv-lp-container--narrow">
          <div className="dv-lp-section-header">
            <span className="dv-lp-section-kicker">Answers & Documentation</span>
            <h2 className="dv-lp-section-title">Frequently asked questions.</h2>
            <p className="dv-lp-section-desc">
              Everything you need to know about the cryptographic protection and AI intelligence powering DocVault.
            </p>
          </div>

          <div className="dv-lp-faq-list">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              const FaqIcon = faq.icon;
              return (
                <div 
                  key={faq.id} 
                  className={`dv-lp-faq-item ${isOpen ? 'dv-lp-faq-item--open' : ''}`}
                  onClick={() => toggleFaq(faq.id)}
                >
                  <div className="dv-lp-faq-question-row">
                    <div className="dv-lp-faq-q-left">
                      <span className="dv-lp-faq-icon-wrap">
                        <FaqIcon size={16} />
                      </span>
                      <h4 className="dv-lp-faq-q">{faq.question}</h4>
                    </div>
                    <ChevronDown size={18} className="dv-lp-faq-chevron" />
                  </div>
                  {isOpen && (
                    <div className="dv-lp-faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

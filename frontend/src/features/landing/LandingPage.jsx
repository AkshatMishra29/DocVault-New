import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/layout/PublicNavbar/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter/PublicFooter';
import heroVaultGraphic from '../../assets/images/hero-vault-graphic.png';
import dashboardMockup from '../../assets/images/dashboard-preview-mockup.png';
import securityGraphic from '../../assets/images/security-shield-graphic.png';

import { 
  ArrowRight, Play, Shield, Lock, Sparkles, Clock, 
  FolderLock, HardDrive, FileCheck, CheckCircle2, 
  UploadCloud, Cpu, Layers, Search
} from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="dv-landing-modern">
      <PublicNavbar />

      {/* 1. HERO SECTION */}
      <section className="dv-m-hero">
        <div className="dv-m-hero__container">
          {/* Left Column: Copy & CTAs */}
          <div className="dv-m-hero__left">
            <div className="dv-m-hero__pill">
              <span className="dv-m-hero__pill-dot"></span>
              <span>Your personal document vault</span>
            </div>

            <h1 className="dv-m-hero__title">
              Your documents.<br />
              <span className="dv-m-hero__title-highlight">One intelligent vault.</span>
            </h1>

            <p className="dv-m-hero__description">
              Securely organize, manage and understand your important documents. Never miss an expiry date again.
            </p>

            <div className="dv-m-hero__cta-group">
              <Link to="/register" className="dv-m-btn-primary">
                <span>Get Started Free</span>
                <ArrowRight size={16} />
              </Link>
              <a href="#how-it-works" className="dv-m-btn-secondary">
                <Play size={14} className="dv-m-play-icon" />
                <span>Watch Demo</span>
              </a>
            </div>
          </div>

          {/* Right Column: 3D Vault Illustration & Floating Badge */}
          <div className="dv-m-hero__right">
            <div className="dv-m-hero__glow-bg"></div>
            <div className="dv-m-hero__vault-wrap">
              <img 
                src={heroVaultGraphic} 
                alt="Intelligent Document Vault Illustration" 
                className="dv-m-hero__vault-img"
              />
              <div className="dv-m-hero__security-badge">
                <div className="dv-m-security-badge__icon">
                  <Lock size={15} />
                </div>
                <div className="dv-m-security-badge__text">
                  <strong>Your documents</strong>
                  <span>are safe & encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Features Strip (4 Quick Pillars) */}
        <div className="dv-m-hero__strip-container">
          <div className="dv-m-hero__strip">
            <div className="dv-m-strip-item">
              <div className="dv-m-strip-icon">
                <HardDrive size={18} />
              </div>
              <div>
                <h5>Secure Storage</h5>
                <p>Your data, your control</p>
              </div>
            </div>

            <div className="dv-m-strip-item">
              <div className="dv-m-strip-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <h5>AI Powered</h5>
                <p>Smarter document insights</p>
              </div>
            </div>

            <div className="dv-m-strip-item">
              <div className="dv-m-strip-icon">
                <Clock size={18} />
              </div>
              <div>
                <h5>Smart Reminders</h5>
                <p>Never miss a deadline</p>
              </div>
            </div>

            <div className="dv-m-strip-item">
              <div className="dv-m-strip-icon">
                <FileCheck size={18} />
              </div>
              <div>
                <h5>Multi-Format Support</h5>
                <p>PDF, JPG, PNG, DOCX & more</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID SECTION */}
      <section className="dv-m-features" id="features">
        <div className="dv-m-features__container">
          {/* Left Intro Column */}
          <div className="dv-m-features__left">
            <h2 className="dv-m-features__title">
              Powerful features for<br />a smarter document life.
            </h2>
            <p className="dv-m-features__subtitle">
              From organization to insights, DocVault gives you everything you need to stay in control — all in one place.
            </p>
            <Link to="/register" className="dv-m-features__link">
              <span>Explore all features</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Right 2x3 Grid */}
          <div className="dv-m-features__grid">
            {/* Card 1: Document Vault */}
            <div className="dv-m-feature-card">
              <div className="dv-m-card-icon dv-m-card-icon--teal">
                <FolderLock size={18} />
              </div>
              <h4 className="dv-m-card-title">Document Vault</h4>
              <p className="dv-m-card-desc">Store and organize your documents securely.</p>
            </div>

            {/* Card 2: AI Assistant */}
            <div className="dv-m-feature-card">
              <div className="dv-m-card-icon dv-m-card-icon--purple">
                <Sparkles size={18} />
              </div>
              <h4 className="dv-m-card-title">AI Assistant</h4>
              <p className="dv-m-card-desc">Get instant answers and extract insights.</p>
            </div>

            {/* Card 3: Expiry Tracking */}
            <div className="dv-m-feature-card">
              <div className="dv-m-card-icon dv-m-card-icon--amber">
                <Clock size={18} />
              </div>
              <h4 className="dv-m-card-title">Expiry Tracking</h4>
              <p className="dv-m-card-desc">Never miss renewals, warranties or deadlines.</p>
            </div>

            {/* Card 4: Smart Organization */}
            <div className="dv-m-feature-card">
              <div className="dv-m-card-icon dv-m-card-icon--cyan">
                <Layers size={18} />
              </div>
              <h4 className="dv-m-card-title">Smart Organization</h4>
              <p className="dv-m-card-desc">Categorize, tag and find anything in seconds.</p>
            </div>

            {/* Card 5: Assets Management */}
            <div className="dv-m-feature-card">
              <div className="dv-m-card-icon dv-m-card-icon--blue">
                <HardDrive size={18} />
              </div>
              <h4 className="dv-m-card-title">Assets Management</h4>
              <p className="dv-m-card-desc">Track vehicles, electronics, property and more.</p>
            </div>

            {/* Card 6: Secure & Private */}
            <div className="dv-m-feature-card">
              <div className="dv-m-card-icon dv-m-card-icon--emerald">
                <Shield size={18} />
              </div>
              <h4 className="dv-m-card-title">Secure & Private</h4>
              <p className="dv-m-card-desc">Your data stays yours, always.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DASHBOARD SHOWCASE SECTION */}
      <section className="dv-m-showcase">
        <div className="dv-m-showcase__bg-decor"></div>
        <div className="dv-m-showcase__container">
          {/* Left Mockup View */}
          <div className="dv-m-showcase__left">
            <div className="dv-m-mockup-frame">
              <img 
                src={dashboardMockup} 
                alt="DocVault SaaS Dashboard Interface" 
                className="dv-m-mockup-img"
              />
            </div>
          </div>

          {/* Right Highlights */}
          <div className="dv-m-showcase__right">
            <span className="dv-m-tagline">DASHBOARD</span>
            <h2 className="dv-m-showcase__title">
              Everything you need,<br />right at a glance.
            </h2>
            <p className="dv-m-showcase__desc">
              Your personal dashboard gives you a complete overview of your documents, deadlines and important updates. Stay organized, stay ahead.
            </p>

            <ul className="dv-m-check-list">
              <li>
                <CheckCircle2 size={16} className="dv-m-check-icon" />
                <span>Quick stats and insights</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="dv-m-check-icon" />
                <span>Upcoming deadlines</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="dv-m-check-icon" />
                <span>Recent documents</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="dv-m-check-icon" />
                <span>AI assistant preview</span>
              </li>
            </ul>

            <Link to="/login" className="dv-m-btn-primary dv-m-btn-dashboard">
              <span>Explore Dashboard</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="dv-m-process" id="how-it-works">
        <div className="dv-m-process__container">
          <div className="dv-m-process__header">
            <span className="dv-m-tagline">SIMPLE PROCESS</span>
            <h2 className="dv-m-process__title">How it works</h2>
            <p className="dv-m-process__subtitle">
              Get started in minutes. Our simple process helps you secure, organize and manage your documents with ease.
            </p>
          </div>

          <div className="dv-m-process__steps">
            {/* Step 1 */}
            <div className="dv-m-step-card">
              <div className="dv-m-step-icon dv-m-step-icon--green">
                <UploadCloud size={20} />
              </div>
              <span className="dv-m-step-num">01</span>
              <h4 className="dv-m-step-title">Upload</h4>
              <p className="dv-m-step-desc">Add your PDFs, scans, photos and important documents.</p>
            </div>

            {/* Step 2 */}
            <div className="dv-m-step-card">
              <div className="dv-m-step-icon dv-m-step-icon--blue">
                <Cpu size={20} />
              </div>
              <span className="dv-m-step-num">02</span>
              <h4 className="dv-m-step-title">Extract</h4>
              <p className="dv-m-step-desc">AI processes files and identifies key information with high accuracy.</p>
            </div>

            {/* Step 3 */}
            <div className="dv-m-step-card">
              <div className="dv-m-step-icon dv-m-step-icon--teal">
                <Layers size={20} />
              </div>
              <span className="dv-m-step-num">03</span>
              <h4 className="dv-m-step-title">Organize</h4>
              <p className="dv-m-step-desc">Documents are categorized and securely stored in your personal vault.</p>
            </div>

            {/* Step 4 */}
            <div className="dv-m-step-card">
              <div className="dv-m-step-icon dv-m-step-icon--amber">
                <Search size={20} />
              </div>
              <span className="dv-m-step-num">04</span>
              <h4 className="dv-m-step-title">Discover</h4>
              <p className="dv-m-step-desc">Search, track deadlines and ask questions with AI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECURITY & PRIVACY CARD BANNER */}
      <section className="dv-m-security" id="security">
        <div className="dv-m-security__container">
          <div className="dv-m-security-card">
            {/* Left text in dark box */}
            <div className="dv-m-security-card__left">
              <span className="dv-m-security-tag">SECURITY</span>
              <h3 className="dv-m-security-title">
                Built with security<br />and privacy at the core.
              </h3>
              <p className="dv-m-security-desc">
                Your documents are protected with bank-grade encryption, including password authentication, Vault PIN verification and secure cloud storage.
              </p>
              <Link to="/register" className="dv-m-security-btn">
                <span>Learn more about security</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Center: Glowing 3D Shield */}
            <div className="dv-m-security-card__center">
              <img 
                src={securityGraphic} 
                alt="3D Security Shield Protection" 
                className="dv-m-security-shield-img"
              />
            </div>

            {/* Right: 3 Pillars with white cards */}
            <div className="dv-m-security-card__right">
              <div className="dv-m-security-pillar">
                <div className="dv-m-pillar-icon">
                  <Shield size={16} />
                </div>
                <div>
                  <strong>End-to-End Encryption</strong>
                  <p>Your data stays private</p>
                </div>
              </div>

              <div className="dv-m-security-pillar">
                <div className="dv-m-pillar-icon">
                  <Lock size={16} />
                </div>
                <div>
                  <strong>Vault PIN Protection</strong>
                  <p>Second layer security</p>
                </div>
              </div>

              <div className="dv-m-security-pillar">
                <div className="dv-m-pillar-icon">
                  <HardDrive size={16} />
                </div>
                <div>
                  <strong>Secure Cloud Storage</strong>
                  <p>Reliable infrastructure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/layout/PublicNavbar/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter/PublicFooter';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';

import secureVaultImg from '../../assets/illustrations/secure-vault.svg';
import aiAssistantImg from '../../assets/illustrations/ai-assistant.svg';
import smartDeadlinesImg from '../../assets/illustrations/smart-deadlines.svg';
import docUploadImg from '../../assets/illustrations/document-upload.svg';

import { brandCopy, featuresCopy, howItWorksCopy, faqCopy } from '../../content/siteContent';
import { ShieldCheck, Sparkles, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="dv-landing">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="dv-hero">
        <div className="dv-hero__container">
          <Badge variant="primary" size="md" className="dv-hero__badge">
            <Sparkles size={14} /> Intelligent Document Custodian & RAG Copilot
          </Badge>

          <h1 className="dv-hero__title">
            Your documents.<br />
            <span className="dv-hero__highlight">One intelligent vault.</span>
          </h1>

          <p className="dv-hero__subtitle">
            {brandCopy.subheadline}
          </p>

          <div className="dv-hero__cta-group">
            <Link to="/register">
              <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                Create Your Free Vault
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="secondary" size="lg">
                Explore How It Works
              </Button>
            </a>
          </div>

          <div className="dv-hero__preview-wrapper">
            <img src={secureVaultImg} alt="DocVault Secure Dashboard" className="dv-hero__illustration" />
          </div>
        </div>
      </section>

      {/* Trust & Guarantees Strip */}
      <section className="dv-trust-strip">
        <div className="dv-trust-strip__container">
          <div className="dv-trust-item">
            <CheckCircle2 size={18} className="dv-trust-icon" />
            <span>Dual-Factor Vault PIN Lock</span>
          </div>
          <div className="dv-trust-item">
            <CheckCircle2 size={18} className="dv-trust-icon" />
            <span>Groq LPU Bounded Multimodal AI</span>
          </div>
          <div className="dv-trust-item">
            <CheckCircle2 size={18} className="dv-trust-icon" />
            <span>Strict Tenant Query Isolation</span>
          </div>
          <div className="dv-trust-item">
            <CheckCircle2 size={18} className="dv-trust-icon" />
            <span>RFC-5545 iCalendar Sync</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="dv-section">
        <div className="dv-section__container">
          <div className="dv-section__header">
            <h2 className="dv-section__title">Intelligent capabilities designed for real-world documents</h2>
            <p className="dv-section__desc">From handwritten warranties to complex 40-page motor insurance policies, DocVault extracts, classifies, and reminds you before deadlines lapse.</p>
          </div>

          <div className="dv-features-grid">
            {featuresCopy.map((f) => (
              <Card key={f.id} hover padding="lg" className="dv-feature-card">
                <div className="dv-feature-card__icon-box">
                  {f.id === 'vault' && <ShieldCheck size={24} color="#2563EB" />}
                  {f.id === 'ai' && <Sparkles size={24} color="#7C3AED" />}
                  {f.id === 'deadlines' && <CheckCircle2 size={24} color="#059669" />}
                  {f.id === 'ocr' && <ShieldCheck size={24} color="#0D9488" />}
                </div>
                <h3 className="dv-feature-card__title">{f.title}</h3>
                <p className="dv-feature-card__desc">{f.description}</p>
                <p className="dv-feature-card__detail">{f.detail}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Deep-Dive Showcases */}
      <section className="dv-section dv-section--alt">
        <div className="dv-section__container">
          {/* Showcase 1: Ask AI */}
          <div className="dv-showcase">
            <div className="dv-showcase__content">
              <Badge variant="primary" size="sm">Zero-Hallucination AI</Badge>
              <h2 className="dv-showcase__title">Ask your documents anything. Get exact clause citations.</h2>
              <p className="dv-showcase__text">
                DocVault uses a bounded Retrieval-Augmented Generation (RAG) architecture. It creates dense 384-dimensional semantic embeddings for your files, retrieving only relevant paragraphs so you can instantly verify deductibles, claim steps, and warranty coverage.
              </p>
              <ul className="dv-showcase__list">
                <li>Grounds every single response in verified document pages</li>
                <li>Zero cross-tenant data leakage or model training on your private files</li>
                <li>Markdown responses with tables, clauses, and policy numbers</li>
              </ul>
            </div>
            <div className="dv-showcase__media">
              <img src={aiAssistantImg} alt="DocVault AI Assistant Interface" />
            </div>
          </div>

          {/* Showcase 2: Smart Deadlines */}
          <div className="dv-showcase dv-showcase--reversed">
            <div className="dv-showcase__content">
              <Badge variant="warning" size="sm">Automated Renewal Protection</Badge>
              <h2 className="dv-showcase__title">Never miss an insurance expiry or appliance warranty.</h2>
              <p className="dv-showcase__text">
                During document ingestion, DocVault's OCR pipeline automatically detects expiration dates and creates calendar reminders. You can download and subscribe via standard iCalendar feeds in Google Calendar, Apple Calendar, and Microsoft Outlook.
              </p>
              <ul className="dv-showcase__list">
                <li>Severity badges for urgent (&le; 15 days) and upcoming (&le; 45 days) renewals</li>
                <li>1-Click standard RFC-5545 `.ics` subscription URL</li>
                <li>Direct link from reminder card back to original policy document</li>
              </ul>
            </div>
            <div className="dv-showcase__media">
              <img src={smartDeadlinesImg} alt="Smart Deadlines & Calendar Sync" />
            </div>
          </div>

          {/* Showcase 3: OCR Ingestion */}
          <div className="dv-showcase">
            <div className="dv-showcase__content">
              <Badge variant="success" size="sm">Hybrid Multi-Format OCR</Badge>
              <h2 className="dv-showcase__title">High accuracy OCR for native PDFs, scans, and mobile snapshots.</h2>
              <p className="dv-showcase__text">
                Documents captured under poor lighting or tilted angles undergo image conditioning via Sharp (grayscale, normalization, contrast sharpening), local Tesseract.js transcription, and Groq LPU multimodal vision fallback.
              </p>
            </div>
            <div className="dv-showcase__media">
              <img src={docUploadImg} alt="Multi-Format OCR Pipeline" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section id="how-it-works" className="dv-section">
        <div className="dv-section__container">
          <div className="dv-section__header">
            <h2 className="dv-section__title">How DocVault Works</h2>
            <p className="dv-section__desc">From unreadable receipt to structured, indexed knowledge in four seconds.</p>
          </div>

          <div className="dv-steps-grid">
            {howItWorksCopy.map((step) => (
              <div key={step.step} className="dv-step-card">
                <span className="dv-step-card__num">{step.step}</span>
                <h3 className="dv-step-card__title">{step.title}</h3>
                <p className="dv-step-card__desc">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="dv-section dv-section--alt">
        <div className="dv-section__container dv-section__container--narrow">
          <div className="dv-section__header">
            <h2 className="dv-section__title">Frequently Asked Questions</h2>
            <p className="dv-section__desc">Clear answers regarding DocVault's security model, format support, and AI capabilities.</p>
          </div>

          <div className="dv-faq-accordion">
            {faqCopy.map((item, idx) => (
              <div key={idx} className={`dv-faq-item ${openFaq === idx ? 'dv-faq-item--open' : ''}`}>
                <button className="dv-faq-question" onClick={() => toggleFaq(idx)}>
                  <span>{item.q}</span>
                  <ChevronDown size={18} className="dv-faq-icon" />
                </button>
                {openFaq === idx && (
                  <div className="dv-faq-answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="dv-cta-banner">
        <div className="dv-cta-banner__container">
          <h2 className="dv-cta-banner__title">Take control of your documents today.</h2>
          <p className="dv-cta-banner__desc">Create your private vault in less than two minutes. No credit card required.</p>
          <div className="dv-cta-banner__actions">
            <Link to="/register">
              <Button variant="primary" size="lg">Get Started Now</Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

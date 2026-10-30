import React from 'react';
import { Link } from 'react-router-dom';
import brandLogo from '../../../assets/images/docvault-brand-logo.png';
import logoLight from '../../../assets/brand/docvault-logo.svg';
import './PublicFooter.css';

export default function PublicFooter() {
  return (
    <footer className="dv-public-footer">
      <div className="dv-public-footer__container">
        <div className="dv-public-footer__brand">
          <img 
            src={brandLogo} 
            alt="DocVault" 
            height="28" 
            onError={(e) => { e.target.src = logoLight; }} 
          />
          <p className="dv-public-footer__tagline">
            Secure, Organize, Stay Ahead.
          </p>
        </div>

        <div className="dv-public-footer__columns">
          <div className="dv-public-footer__col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
          </div>

          <div className="dv-public-footer__col">
            <h4>Company</h4>
            <a href="#about">About</a>
            <a href="#blog">Blog</a>
            <a href="#careers">Careers</a>
          </div>

          <div className="dv-public-footer__col">
            <h4>Support</h4>
            <a href="#help">Help Center</a>
            <a href="#faq">FAQ</a>
            <a href="#privacy">Privacy Policy</a>
          </div>
        </div>

        <div className="dv-public-footer__socials">
          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>𝕏</span>
          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>in</span>
          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>gh</span>
        </div>
      </div>

      <div className="dv-public-footer__bottom">
        <div className="dv-public-footer__bottom-container">
          <p>© {new Date().getFullYear()} DocVault. All rights reserved.</p>
          <p className="dv-public-footer__made-with">Made with 💚 for a smarter tomorrow.</p>
        </div>
      </div>
    </footer>
  );
}

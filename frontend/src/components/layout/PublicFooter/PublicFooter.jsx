import React from 'react';
import { Link } from 'react-router-dom';
import logoLight from '../../../assets/brand/docvault-logo.svg';
import './PublicFooter.css';

export default function PublicFooter() {
  return (
    <footer className="dv-public-footer">
      <div className="dv-public-footer__container">
        <div className="dv-public-footer__brand">
          <img src={logoLight} alt="DocVault" height="30" />
          <p className="dv-public-footer__tagline">
            Your documents. One intelligent vault. Privacy-first document management and RAG assistant.
          </p>
        </div>

        <div className="dv-public-footer__columns">
          <div className="dv-public-footer__col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#security">Security Model</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="dv-public-footer__col">
            <h4>Application</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Vault</Link>
            <Link to="/enter-pin">Unlock Vault</Link>
          </div>

          <div className="dv-public-footer__col">
            <h4>Technology</h4>
            <span>React 19 & Vite</span>
            <span>Groq Cloud LPU</span>
            <span>Sharp & Tesseract OCR</span>
            <span>MongoDB Atlas</span>
          </div>
        </div>
      </div>

      <div className="dv-public-footer__bottom">
        <p>&copy; {new Date().getFullYear()} DocVault. All rights reserved. Built for security & intelligence.</p>
      </div>
    </footer>
  );
}

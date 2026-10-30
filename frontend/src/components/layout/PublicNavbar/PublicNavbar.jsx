import React from 'react';
import { Link } from 'react-router-dom';
import brandLogo from '../../../assets/images/docvault-brand-logo.png';
import logoLight from '../../../assets/brand/docvault-logo.svg';
import { ArrowRight } from 'lucide-react';
import './PublicNavbar.css';

export default function PublicNavbar() {
  return (
    <header className="dv-public-nav">
      <div className="dv-public-nav__container">
        <Link to="/" className="dv-public-nav__logo">
          <img 
            src={brandLogo} 
            alt="DocVault" 
            height="34" 
            onError={(e) => { e.target.src = logoLight; }} 
          />
        </Link>

        <nav className="dv-public-nav__links">
          <a href="#features" className="dv-public-nav__link">Features</a>
          <a href="#how-it-works" className="dv-public-nav__link">How It Works</a>
          <a href="#security" className="dv-public-nav__link">Security</a>
          <a href="#pricing" className="dv-public-nav__link">Pricing</a>
          <a href="#faq" className="dv-public-nav__link">FAQ</a>
        </nav>

        <div className="dv-public-nav__actions">
          <Link to="/login" className="dv-public-nav__login">
            Login
          </Link>
          <Link to="/register" className="dv-public-nav__btn-primary">
            <span>Get Started</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}

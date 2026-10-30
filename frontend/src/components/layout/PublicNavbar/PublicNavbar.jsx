import React from 'react';
import { Link } from 'react-router-dom';
import DocVaultLogo from '../../common/DocVaultLogo/DocVaultLogo';
import { ArrowRight } from 'lucide-react';
import './PublicNavbar.css';

export default function PublicNavbar() {
  return (
    <header className="dv-public-nav">
      <div className="dv-public-nav__container">
        <Link to="/" className="dv-public-nav__logo">
          <DocVaultLogo height={32} />
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

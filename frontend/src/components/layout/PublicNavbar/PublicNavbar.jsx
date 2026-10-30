import React from 'react';
import { Link } from 'react-router-dom';
import logoLight from '../../../assets/brand/docvault-logo.svg';
import Button from '../../common/Button/Button';
import './PublicNavbar.css';

export default function PublicNavbar() {
  return (
    <header className="dv-public-nav">
      <div className="dv-public-nav__container">
        <Link to="/" className="dv-public-nav__logo">
          <img src={logoLight} alt="DocVault" height="34" />
        </Link>

        <nav className="dv-public-nav__links">
          <a href="#features" className="dv-public-nav__link">Features</a>
          <a href="#how-it-works" className="dv-public-nav__link">How It Works</a>
          <a href="#security" className="dv-public-nav__link">Security</a>
          <a href="#faq" className="dv-public-nav__link">FAQ</a>
        </nav>

        <div className="dv-public-nav__actions">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

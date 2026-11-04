import React from 'react';
import { Link } from 'react-router-dom';
import DocVaultLogo from '../../../components/common/DocVaultLogo/DocVaultLogo';
import './AuthLayout.css';

export default function AuthLayout({ 
  children, 
  cardClassName = ''
}) {
  return (
    <div className="dv-auth-single-layout">
      {/* Top-left brand logo as inline link (no block level header wrapper) */}
      <Link to="/" title="Return to DocVault Home" className="dv-auth-logo-link">
        <DocVaultLogo height={32} />
      </Link>

      {/* Centered Form Viewport */}
      <main className="dv-auth-center-viewport">
        <div className={`dv-auth-form-card ${cardClassName}`}>
          {children}
        </div>
      </main>
    </div>
  );
}

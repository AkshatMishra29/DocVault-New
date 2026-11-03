import React from 'react';
import './DocVaultLogo.css';

export function DocVaultLogoIcon({ size = 38, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`dv-brand-logo__svg ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Obsidian & Titanium Base Plate */}
        <linearGradient id="elitePlateGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#252B36" />
          <stop offset="45%" stopColor="#12151B" />
          <stop offset="100%" stopColor="#080A0D" />
        </linearGradient>

        {/* Cyber Amber Metallic Rim */}
        <linearGradient id="eliteRimGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FD2B06" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#EB6C3B" stopOpacity="0.5" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.18)" />
        </linearGradient>

        {/* Dynamic Glowing Ring */}
        <linearGradient id="eliteRingGlow" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FD2B06" />
          <stop offset="50%" stopColor="#EB6C3B" />
          <stop offset="100%" stopColor="#FF8B54" />
        </linearGradient>

        {/* Central Reactor Core */}
        <radialGradient id="eliteCoreSun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#FFA47D" />
          <stop offset="70%" stopColor="#FD2B06" />
          <stop offset="100%" stopColor="#9C1702" />
        </radialGradient>

        <filter id="eliteLogoShadow" x="-10%" y="0%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.7" />
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FD2B06" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter="url(#eliteLogoShadow)">
        {/* Chamfered Squircle Vault Chamber */}
        <rect x="3" y="3" width="42" height="42" rx="12" fill="url(#elitePlateGrad)" />
        <rect x="3.5" y="3.5" width="41" height="41" rx="11.5" stroke="url(#eliteRimGrad)" strokeWidth="1.2" />

        {/* Calibrated Dial Track Ring */}
        <circle 
          cx="24" 
          cy="24" 
          r="14" 
          stroke="url(#eliteRingGlow)" 
          strokeWidth="1.75" 
          strokeDasharray="4 2.5" 
          strokeOpacity="0.85"
        />

        {/* Folded Document Vault Foil */}
        <path 
          d="M17 14.5C17 13.6716 17.6716 13 18.5 13H25.5L31 18.5V31.5C31 32.3284 30.3284 33 29.5 33H18.5C17.6716 33 17 32.3284 17 31.5V14.5Z" 
          fill="rgba(253, 43, 6, 0.12)" 
          stroke="#EB6C3B" 
          strokeWidth="1.2" 
        />
        <path 
          d="M25.5 13V18.5H31" 
          fill="none" 
          stroke="#FFA47D" 
          strokeWidth="1.2" 
          strokeLinejoin="round" 
        />

        {/* Central Laser Key Node */}
        <circle cx="24" cy="24" r="5" fill="url(#eliteCoreSun)" stroke="#FFFFFF" strokeWidth="0.8" />
        <circle cx="24" cy="24" r="1.8" fill="#0E1015" />

        {/* Precision Cardinal Micro Ticks */}
        <line x1="24" y1="11" x2="24" y2="13.5" stroke="#FD2B06" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="24" y1="34.5" x2="24" y2="37" stroke="#FD2B06" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="11" y1="24" x2="13.5" y2="24" stroke="#FD2B06" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="34.5" y1="24" x2="37" y2="24" stroke="#FD2B06" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default function DocVaultLogo({ 
  height = 42, 
  variant = 'default', // 'default', 'light', 'icon-only'
  className = '',
  useImage = false // default to pure coded SVG asset!
}) {
  if (variant === 'icon-only') {
    return (
      <div className={`dv-brand-logo dv-brand-logo--icon-only ${className}`}>
        <DocVaultLogoIcon size={height} />
      </div>
    );
  }

  return (
    <div className={`dv-brand-logo dv-brand-logo--${variant} ${className}`}>
      <DocVaultLogoIcon size={height} />
      <div className="dv-brand-logo__meta">
        <span className="dv-brand-logo__title" style={{ fontSize: `${Math.round(height * 0.52)}px` }}>
          Doc<span className="dv-brand-logo__accent">Vault</span>
        </span>
        <span className="dv-brand-logo__tagline">SECURE • ORGANIZE • ACCESS</span>
      </div>
    </div>
  );
}

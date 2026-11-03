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
        {/* Forest Noir Deep Chamber */}
        <linearGradient id="dvVaultTileGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#24493B" />
          <stop offset="50%" stopColor="#1D3B30" />
          <stop offset="100%" stopColor="#101A17" />
        </linearGradient>

        {/* Dynamic Beveled Copper Rim */}
        <linearGradient id="dvTileBorderGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E2A67D" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#C47B48" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#287A57" stopOpacity="0.5" />
        </linearGradient>

        {/* Calibrated Dial Track Gradient */}
        <linearGradient id="dvRingForest" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34966D" />
          <stop offset="50%" stopColor="#287A57" />
          <stop offset="100%" stopColor="#C47B48" />
        </linearGradient>

        {/* Holographic Document Foil */}
        <linearGradient id="dvDocGrad" x1="16" y1="12" x2="32" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(40, 122, 87, 0.4)" />
          <stop offset="100%" stopColor="rgba(196, 123, 72, 0.15)" />
        </linearGradient>

        {/* Precision Copper Core Node */}
        <radialGradient id="dvCopperCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#E2A67D" />
          <stop offset="75%" stopColor="#C47B48" />
          <stop offset="100%" stopColor="#1D3B30" />
        </radialGradient>

        {/* Ambient Drop Shadow */}
        <filter id="dvLogoDropShadow" x="0" y="2" width="48" height="46" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#101A17" floodOpacity="0.35" />
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#287A57" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter="url(#dvLogoDropShadow)">
        {/* Base Squircle Vault Chamber */}
        <rect x="3" y="3" width="42" height="42" rx="12" fill="url(#dvVaultTileGrad)" />
        <rect x="3.5" y="3.5" width="41" height="41" rx="11.5" stroke="url(#dvTileBorderGrad)" strokeWidth="1.3" />

        {/* Outer Calibrated Dial Ring */}
        <circle 
          cx="24" 
          cy="24" 
          r="14.5" 
          stroke="url(#dvRingForest)" 
          strokeWidth="1.8" 
          strokeDasharray="4 2.5" 
          strokeOpacity="0.9"
        />

        {/* Dimensional Document Silhouette (Folded Origami Geometry) */}
        <path 
          d="M17 14C17 13.1716 17.6716 12.5 18.5 12.5H25.5L31 18V32.5C31 33.3284 30.3284 34 29.5 34H18.5C17.6716 34 17 33.3284 17 32.5V14Z" 
          fill="url(#dvDocGrad)" 
          stroke="#C47B48" 
          strokeWidth="1.3" 
          strokeOpacity="0.9"
        />
        {/* Precision Folded Document Flap */}
        <path 
          d="M25.5 12.5V18H31" 
          fill="none" 
          stroke="#E2A67D" 
          strokeWidth="1.3" 
          strokeLinejoin="round" 
        />

        {/* Central Luminous Cryptographic Aperture / Vault Lock Wheel */}
        <circle cx="24" cy="24" r="5.5" fill="url(#dvCopperCore)" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.95" />
        <circle cx="24" cy="24" r="2" fill="#101A17" />

        {/* Cardinal Caliper Ticks (Copper & Forest Alignment Nodes) */}
        <line x1="24" y1="12" x2="24" y2="14.5" stroke="#34966D" strokeWidth="2" strokeLinecap="round" />
        <line x1="24" y1="33.5" x2="24" y2="36" stroke="#34966D" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="24" x2="14.5" y2="24" stroke="#C47B48" strokeWidth="2" strokeLinecap="round" />
        <line x1="33.5" y1="24" x2="36" y2="24" stroke="#C47B48" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default function DocVaultLogo({ 
  height = 42, 
  variant = 'default', // 'default' (dark text), 'light' (white text), 'icon-only'
  className = '',
  useImage = false // strictly false: pure coded vector asset!
}) {
  if (variant === 'icon-only') {
    return (
      <div className={`dv-brand-logo dv-brand-logo--icon-only ${className}`}>
        <DocVaultLogoIcon size={height} />
      </div>
    );
  }

  const titleSize = Math.max(16, Math.round(height * 0.48));

  return (
    <div className={`dv-brand-logo dv-brand-logo--${variant} ${className}`}>
      <DocVaultLogoIcon size={height} />
      <div className="dv-brand-logo__meta">
        <span className="dv-brand-logo__title" style={{ fontSize: `${titleSize}px` }}>
          Doc<span className="dv-brand-logo__accent">Vault</span>
        </span>
        <span className="dv-brand-logo__tagline">A PRIVATE SPACE FOR WHAT MATTERS</span>
      </div>
    </div>
  );
}

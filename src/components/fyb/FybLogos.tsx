import React from 'react';

// Crisp vector SVG of the official Christ Apostolic Church (CAC) Logo
export const CacOfficialLogo: React.FC<{ className?: string; size?: number }> = ({ className = 'w-12 h-12', size }) => (
  <svg 
    viewBox="0 0 200 200" 
    className={className} 
    style={size ? { width: size, height: size } : undefined}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer circle seal */}
    <circle cx="100" cy="100" r="96" fill="#FFFFFF" stroke="#0A2540" strokeWidth="6" />
    <circle cx="100" cy="100" r="91" fill="none" stroke="#D4AF37" strokeWidth="2" />
    
    {/* Top Curved Text Path */}
    <path id="cac-text-top" d="M 24,100 A 76,76 0 1,1 176,100" fill="none" />
    <text fontFamily="serif" fontSize="14" fontWeight="900" fill="#0A2540" letterSpacing="2">
      <textPath href="#cac-text-top" startOffset="50%" textAnchor="middle">
        CHRIST APOSTOLIC CHURCH
      </textPath>
    </text>

    {/* Inner Pastoral Scene Circle */}
    <g clipPath="url(#cac-pastoral-clip)">
      <clipPath id="cac-pastoral-clip">
        <circle cx="100" cy="92" r="54" />
      </clipPath>
      {/* Sky */}
      <rect x="40" y="35" width="120" height="120" fill="#7CD6F7" />
      {/* Sun & Mountains */}
      <circle cx="100" cy="80" r="30" fill="#FFF59D" opacity="0.6" />
      <polygon points="40,110 75,70 110,110" fill="#4CAF50" />
      <polygon points="90,110 130,65 160,110" fill="#2E7D32" />
      {/* Green Pasture Grass */}
      <ellipse cx="100" cy="120" rx="60" ry="30" fill="#388E3C" />
      
      {/* Jesus the Good Shepherd Silhouette / Vector figure */}
      <g transform="translate(100, 92) scale(0.65)">
        {/* Head with Halo */}
        <circle cx="0" cy="-45" r="16" fill="#FFF59D" opacity="0.8" />
        <circle cx="0" cy="-45" r="8" fill="#F5D0A9" />
        <path d="M-6,-53 C-6,-56 6,-56 6,-53 C8,-45 -8,-45 -6,-53" fill="#5D4037" />
        
        {/* Robe */}
        <path d="M-10,-37 L10,-37 L18,20 L-18,20 Z" fill="#FFFFFF" stroke="#D32F2F" strokeWidth="3" />
        <path d="M-12,-30 C-18,-15 -22,10 -15,22 C-5,22 15,22 20,20 C10,-10 12,-25 10,-30" fill="#D32F2F" opacity="0.85" />
        
        {/* Little Lamb in Arms */}
        <ellipse cx="2" cy="-24" rx="9" ry="6" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="1" />
        <circle cx="10" cy="-28" r="4.5" fill="#FFFFFF" />
        <ellipse cx="12" cy="-30" rx="1.5" ry="3" fill="#FFFFFF" />

        {/* Flock of sheep at feet */}
        <ellipse cx="-26" cy="16" rx="12" ry="8" fill="#FFFFFF" stroke="#D7CCC8" strokeWidth="1" />
        <ellipse cx="28" cy="18" rx="13" ry="8" fill="#FFFFFF" stroke="#D7CCC8" strokeWidth="1" />
        <ellipse cx="0" cy="22" rx="14" ry="9" fill="#FFFFFF" stroke="#D7CCC8" strokeWidth="1" />
      </g>
    </g>
    <circle cx="100" cy="92" r="54" fill="none" stroke="#0A2540" strokeWidth="2.5" />

    {/* Yellow Golden Banner Ribbon: "ONE FOLD, ONE SHEPHERD" */}
    <g transform="translate(0, 142)">
      <path d="M 16,0 L 184,0 L 184,20 L 16,20 Z" fill="#FDD835" stroke="#0A2540" strokeWidth="1.5" />
      <text x="100" y="14" fontFamily="sans-serif" fontSize="10.5" fontWeight="900" fill="#0A2540" textAnchor="middle" letterSpacing="1">
        ONE FOLD, ONE SHEPHERD
      </text>
    </g>

    {/* Scripture Bottom: JOHN 10:16 */}
    <text x="100" y="180" fontFamily="sans-serif" fontSize="9" fontWeight="800" fill="#0A2540" textAnchor="middle">
      JOHN 10:16
    </text>
  </svg>
);

// Crisp vector SVG of The Federal Polytechnic Ede (FPE) Shield Logo
export const FpeOfficialLogo: React.FC<{ className?: string; size?: number }> = ({ className = 'w-12 h-12', size }) => (
  <svg 
    viewBox="0 0 200 220" 
    className={className} 
    style={size ? { width: size, height: size } : undefined}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shield Base Outline */}
    <path
      d="M 40,20 L 160,20 Q 165,110 100,180 Q 35,110 40,20 Z"
      fill="#FFFFFF"
      stroke="#0A2540"
      strokeWidth="5"
    />
    
    {/* Top Section (Cyan with Book & Crosshair) */}
    <g clipPath="url(#fpe-shield-clip)">
      <clipPath id="fpe-shield-clip">
        <path d="M 40,20 L 160,20 Q 165,110 100,180 Q 35,110 40,20 Z" />
      </clipPath>
      
      {/* Upper Third - Sky Blue */}
      <rect x="20" y="15" width="160" height="60" fill="#0288D1" />
      
      {/* Middle Third - Poly Terra Cotta Red */}
      <rect x="20" y="75" width="160" height="50" fill="#D32F2F" />
      
      {/* Lower Third - Cyan Ocean */}
      <rect x="20" y="125" width="160" height="60" fill="#0288D1" />

      {/* Top Banner Text: THE FEDERAL POLYTECHNIC */}
      <text x="100" y="32" fontFamily="sans-serif" fontSize="7.5" fontWeight="900" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.5">
        THE FEDERAL POLYTECHNIC
      </text>

      {/* Open Book in Top Section */}
      <g transform="translate(100, 52) scale(0.65)">
        <path d="M -30,-12 Q -15,-20 0,-14 Q 15,-20 30,-12 L 30,12 Q 15,4 0,10 Q -15,4 -30,12 Z" fill="#FFFFFF" stroke="#0A2540" strokeWidth="2.5" />
        <line x1="0" y1="-14" x2="0" y2="10" stroke="#0A2540" strokeWidth="2" />
        {/* Crosshair arrow */}
        <line x1="-35" y1="5" x2="35" y2="5" stroke="#0A2540" strokeWidth="1.5" />
        <line x1="0" y1="-22" x2="0" y2="28" stroke="#0A2540" strokeWidth="2" />
      </g>

      {/* Middle Section: Gear & Tower */}
      {/* Gear */}
      <g transform="translate(100, 105)">
        <circle cx="0" cy="0" r="24" fill="#FFFFFF" stroke="#0A2540" strokeWidth="3" />
        <circle cx="0" cy="0" r="14" fill="#D32F2F" stroke="#0A2540" strokeWidth="2" />
        {/* Tower Mast */}
        <polygon points="-3,-35 3,-35 6,20 -6,20" fill="#212121" />
        <line x1="-12" y1="-10" x2="0" y2="-15" stroke="#212121" strokeWidth="2" />
      </g>

      {/* "EDE" in cyan bottom */}
      <text x="100" y="142" fontFamily="sans-serif" fontSize="12" fontWeight="900" fill="#0A2540" textAnchor="middle" letterSpacing="2">
        EDE
      </text>

      {/* Water Waves */}
      <g stroke="#0A2540" strokeWidth="2" fill="none" transform="translate(45, 150)">
        <path d="M 0,0 Q 15,-4 30,0 Q 45,-4 60,0 Q 75,-4 90,0 Q 105,-4 120,0" />
        <path d="M 5,6 Q 20,2 35,6 Q 50,2 65,6 Q 80,2 95,6 Q 110,2 125,6" />
        <path d="M 10,12 Q 25,8 40,12 Q 55,8 70,12 Q 85,8 100,12" />
      </g>
    </g>

    {/* Lower Banner Ribbon: KNOWLEDGE, SKILL AND CHARACTER */}
    <g transform="translate(0, 182)">
      <path d="M 25,12 Q 100,28 175,12 L 185,25 Q 100,42 15,25 Z" fill="#FFFFFF" stroke="#0A2540" strokeWidth="2" />
      <text x="100" y="27" fontFamily="sans-serif" fontSize="7" fontWeight="900" fill="#0A2540" textAnchor="middle" letterSpacing="0.5">
        KNOWLEDGE, SKILL AND CHARACTER
      </text>
    </g>
  </svg>
);

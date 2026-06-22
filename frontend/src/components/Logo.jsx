import React from 'react';

/**
 * GeishaLogo - A stylized SVG representing the classic Geisha with a folding yellow fan.
 */
export const GeishaLogo = ({ size = 200, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      style={{ display: 'block' }}
      aria-label="Hotel Osog Geisha Logo"
    >
      <defs>
        {/* Drop shadow for the portrait box */}
        <filter id="portrait-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
        </filter>
        {/* Subtle gold gradient for the fan */}
        <linearGradient id="fan-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2A3" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#E6A100" />
        </linearGradient>
        {/* Soft shadow for the fan ribs */}
        <filter id="fan-rib-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0.5" dy="1" stdDeviation="0.5" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Main black box with gold/yellow border */}
      <rect
        x="10"
        y="10"
        width="180"
        height="180"
        fill="#000000"
        stroke="#FFD700"
        strokeWidth="5"
        rx="12"
        filter="url(#portrait-shadow)"
      />

      <g transform="translate(10, 10)">
        {/* Geisha Hair (Shimada hairstyle) */}
        <path
          d="M 40,80 C 40,40 60,25 90,25 C 120,25 140,40 140,80 C 140,95 130,105 125,115 C 135,115 145,100 150,90 C 155,95 158,110 145,125 C 135,135 120,140 105,140 C 75,140 40,115 40,80 Z"
          fill="#1A1A1A"
        />
        {/* Hair Bun Top Accent */}
        <ellipse cx="90" cy="25" rx="30" ry="12" fill="#111111" />
        {/* Hair Kanzashi (Ornament) - Gold */}
        <path d="M 65,22 L 50,15 M 115,22 L 130,15" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="15" r="4" fill="#FFD700" />
        <circle cx="130" cy="15" r="4" fill="#FFD700" />

        {/* Geisha Face */}
        <path
          d="M 55,80 C 55,60 65,45 90,45 C 115,45 125,60 125,80 C 125,110 115,130 90,130 C 65,130 55,110 55,80 Z"
          fill="#FFFFFF"
        />

        {/* Face Makeup Neck/Shoulder Line */}
        <path d="M 70,120 C 70,125 75,138 90,138 C 105,138 110,125 110,120" fill="#FFFFFF" />

        {/* Eyebrows (Elegant thin arches) */}
        <path d="M 68,70 Q 75,64 82,70" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 98,70 Q 105,64 112,70" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />

        {/* Eyes (Slanted, partially closed/sleeping look) */}
        <path d="M 66,78 Q 75,76 83,82" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
        <path d="M 97,82 Q 105,76 114,78" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
        {/* Eyelashes detail */}
        <path d="M 81,80 L 84,77 M 99,80 L 96,77" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />

        {/* Red Lips */}
        <path d="M 84,103 Q 90,99 96,103 Q 90,111 84,103 Z" fill="#D31027" />

        {/* Golden Folding Fan (Lower Right, overlapping face) */}
        <g id="folding-fan" transform="translate(10, 0)">
          {/* Fan Background Solid */}
          <path
            d="M 85,145 L 75,135 C 95,110 120,95 155,90 L 165,100 C 135,105 110,120 85,145 Z"
            fill="url(#fan-gold)"
            filter="url(#portrait-shadow)"
          />
          {/* Fan Rib Lines */}
          <line x1="85" y1="145" x2="165" y2="100" stroke="#B8860B" strokeWidth="2" filter="url(#fan-rib-shadow)" />
          <line x1="85" y1="145" x2="152" y2="92" stroke="#B8860B" strokeWidth="2" filter="url(#fan-rib-shadow)" />
          <line x1="85" y1="145" x2="137" y2="90" stroke="#B8860B" strokeWidth="2" filter="url(#fan-rib-shadow)" />
          <line x1="85" y1="145" x2="120" y2="93" stroke="#B8860B" strokeWidth="2" filter="url(#fan-rib-shadow)" />
          <line x1="85" y1="145" x2="105" y2="100" stroke="#B8860B" strokeWidth="2" filter="url(#fan-rib-shadow)" />
          <line x1="85" y1="145" x2="90" y2="112" stroke="#B8860B" strokeWidth="2" filter="url(#fan-rib-shadow)" />
          {/* Pivot point */}
          <circle cx="85" cy="145" r="5" fill="#B8860B" />
          <circle cx="85" cy="145" r="2.5" fill="#FFD700" />
        </g>
      </g>
    </svg>
  );
};

/**
 * OsogWordmark - Interlocking wordmark styled similarly to the Hotel Sogo logo but spelling "OSOG"
 */
export const OsogWordmark = ({ width = '100%', height = 'auto', className = '' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 500 160"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hotel Osog Interlocking Logo"
    >
      <defs>
        {/* Heavy drop shadow for that retro pop-out lettering effect */}
        <filter id="retro-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="5" stdDeviation="0" floodColor="#000000" floodOpacity="1" />
        </filter>
      </defs>

      <g filter="url(#retro-shadow)">
        {/* Interlocking Rings & Shapes for O-S-O-G */}
        {/* Let's draw them using path strokes for thickness */}

        {/* Letter 'O' (First) - Circle centered at (75, 90) */}
        <circle
          cx="80"
          cy="95"
          r="40"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="14"
        />

        {/* Letter 'S' - Interlocking Snake starting from top line and extending right */}
        {/* S centers around (180, 95). Top of S loops right and forms the top banner line. */}
        {/* Bottom of S loops left and forms the bottom banner line. */}
        
        {/* Top extended line of the S going across O, G, O (from x=180 to x=460) */}
        <path
          d="M 180,55 L 460,55"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Bottom extended line of the S going left under first O (from x=180 to x=30) */}
        <path
          d="M 180,135 L 35,135"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* The 'S' body connecting top and bottom */}
        <path
          d="M 180,55 
             C 135,55 130,95 180,95 
             C 230,95 225,135 180,135"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter 'O' (Second) - Circle centered at (280, 95) */}
        <circle
          cx="280"
          cy="95"
          r="40"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="14"
        />

        {/* Letter 'G' - Circle with crossbar at (380, 95) */}
        {/* Arc from 45 deg to 315 deg, then horizontal bar */}
        <path
          d="M 408,67 
             A 40,40 0 1,0 408,123 
             L 375,123 
             L 375,95 
             L 405,95"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

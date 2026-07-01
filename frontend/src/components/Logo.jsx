import React from 'react';


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
        
        <filter id="portrait-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
        </filter>
        
        <linearGradient id="fan-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2A3" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#E6A100" />
        </linearGradient>
        
        <filter id="fan-rib-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0.5" dy="1" stdDeviation="0.5" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>

      
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
        
        <path
          d="M 40,80 C 40,40 60,25 90,25 C 120,25 140,40 140,80 C 140,95 130,105 125,115 C 135,115 145,100 150,90 C 155,95 158,110 145,125 C 135,135 120,140 105,140 C 75,140 40,115 40,80 Z"
          fill="#1A1A1A"
        />
        
        <ellipse cx="90" cy="25" rx="30" ry="12" fill="#111111" />
        
        <path d="M 65,22 L 50,15 M 115,22 L 130,15" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="15" r="4" fill="#FFD700" />
        <circle cx="130" cy="15" r="4" fill="#FFD700" />

        
        <path
          d="M 55,80 C 55,60 65,45 90,45 C 115,45 125,60 125,80 C 125,110 115,130 90,130 C 65,130 55,110 55,80 Z"
          fill="#FFFFFF"
        />

        
        <path d="M 70,120 C 70,125 75,138 90,138 C 105,138 110,125 110,120" fill="#FFFFFF" />

        
        <path d="M 68,70 Q 75,64 82,70" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 98,70 Q 105,64 112,70" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />

        
        <path d="M 66,78 Q 75,76 83,82" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
        <path d="M 97,82 Q 105,76 114,78" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
        
        <path d="M 81,80 L 84,77 M 99,80 L 96,77" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />

        
        <path d="M 84,103 Q 90,99 96,103 Q 90,111 84,103 Z" fill="#D31027" />

        
        <g id="folding-fan" transform="translate(10, 0)">
          
          <path
            d="M 85,145 L 75,135 C 95,110 120,95 155,90 L 165,100 C 135,105 110,120 85,145 Z"
            fill="url(#fan-gold)"
            filter="url(#portrait-shadow)"
          />
          
          <line x1="85" y1="145" x2="165" y2="100" stroke="#B8860B" strokeWidth="2" filter="url(#fan-rib-shadow)" />
          <line x1="85" y1="145" x2="152" y2="92" stroke="#B8860B" strokeWidth="2" filter="url(#fan-rib-shadow)" />
          <line x1="85" y1="145" x2="137" y2="90" stroke="#B8860B" strokeWidth="2" filter="url(#fan-rib-shadow)" />
          <line x1="85" y1="145" x2="120" y2="93" stroke="#B8860B" strokeWidth="2" filter="url(#fan-rib-shadow)" />
          <line x1="85" y1="145" x2="105" y2="100" stroke="#B8860B" strokeWidth="2" filter="url(#fan-rib-shadow)" />
          <line x1="85" y1="145" x2="90" y2="112" stroke="#B8860B" strokeWidth="2" filter="url(#fan-rib-shadow)" />
          
          <circle cx="85" cy="145" r="5" fill="#B8860B" />
          <circle cx="85" cy="145" r="2.5" fill="#FFD700" />
        </g>
      </g>
    </svg>
  );
};


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
        
        <filter id="retro-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="5" stdDeviation="0" floodColor="#000000" floodOpacity="1" />
        </filter>
      </defs>

      <g filter="url(#retro-shadow)">
        
        

        
        <circle
          cx="80"
          cy="95"
          r="40"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="14"
        />

        
        
        
        
        
        <path
          d="M 180,55 L 460,55"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="14"
          strokeLinecap="round"
        />

        
        <path
          d="M 180,135 L 35,135"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="14"
          strokeLinecap="round"
        />

        
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

        
        <circle
          cx="280"
          cy="95"
          r="40"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="14"
        />

        
        
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

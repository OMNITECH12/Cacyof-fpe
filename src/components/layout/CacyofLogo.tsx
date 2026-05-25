interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

export default function CacyofLogo({ size = 'md', theme = 'light' }: LogoProps) {
  // Dimensions adaptation
  const dimensions = {
    sm: { height: 'h-10', textGap: 'space-x-2', titleSize: 'text-sm', subSize: 'text-[8px]' },
    md: { height: 'h-14', textGap: 'space-x-3', titleSize: 'text-lg', subSize: 'text-[10px]' },
    lg: { height: 'h-20', textGap: 'space-x-4', titleSize: 'text-2xl', subSize: 'text-xs' }
  }[size];

  const primaryColor = theme === 'dark' ? 'text-white' : 'text-[#0A2540]';
  const subColor = 'text-[#D4AF37]';

  return (
    <div className={`flex items-center ${dimensions.textGap} group select-none`}>
      {/* Logos Joined Side by Side */}
      <div className="flex items-center space-x-2 scale-90 sm:scale-100 transition-all">
        {/* Left: CAC Logo (Circle) */}
        <div className="relative shrink-0">
          <svg
            className={`${dimensions.height} w-auto`}
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer golden circle outer line */}
            <circle cx="60" cy="55" r="48" stroke="#D4AF37" strokeWidth="2.5" />
            <circle cx="60" cy="55" r="44" stroke="#0A2540" strokeWidth="1" strokeDasharray="3 2" />
            
            {/* Background of inner pasture */}
            <circle cx="60" cy="55" r="38" fill="#E8F5E9" />
            
            {/* Pastoral Green Field Base */}
            <path d="M25 70 C 40 60, 80 62, 95 70 L 95 93 C 80 93, 40 93, 25 93 Z" fill="#81C784" />
            
            {/* Shepherd Character Silhouette */}
            <g transform="translate(48, 28)">
              {/* Shepherd robe & staff */}
              <path d="M12 18 L10 50 L18 50 L16 18 Z" fill="#E53935" /> {/* Red outer robe */}
              <path d="M11 18 L13 50 L15 50 L13 18 Z" fill="#FFFFFF" fillOpacity="0.9" /> {/* Inner white robe */}
              <circle cx="14" cy="12" r="5" fill="#FFCC80" /> {/* Head */}
              {/* Shepherd crook/staff */}
              <path d="M20 14 L20 48 M20 14 C20 10, 15 10, 15 12" stroke="#4E342E" strokeWidth="2" strokeLinecap="round" />
              {/* Lamb being carried in arms */}
              <path d="M7 23 C11 19, 17 19, 21 23 C21 27, 7 27, 7 23" fill="#FFFFFF" stroke="#B0BEC5" strokeWidth="1" />
              <circle cx="9" cy="22" r="1.5" fill="#ECEFF1" />
            </g>
            
            {/* Miniature Sheep grazing around */}
            <g transform="translate(32, 65)">
              <rect x="2" y="5" width="12" height="7" rx="3.5" fill="#FFFFFF" stroke="#CFD8DC" strokeWidth="1" />
              <circle cx="15" cy="6" r="2.5" fill="#FFFFFF" />
              <line x1="5" y1="12" x2="5" y2="15" stroke="#37474F" strokeWidth="1.5" />
              <line x1="11" y1="12" x2="11" y2="15" stroke="#37474F" strokeWidth="1.5" />
            </g>
            <g transform="translate(73, 62)">
              <rect x="2" y="5" width="10" height="6" rx="3" fill="#FFFFFF" stroke="#CFD8DC" strokeWidth="1" />
              <circle cx="1" cy="6" r="2" fill="#FFFFFF" />
              <line x1="4" y1="11" x2="4" y2="14" stroke="#37474F" strokeWidth="1" />
              <line x1="8" y1="11" x2="8" y2="14" stroke="#37474F" strokeWidth="1" />
            </g>

            {/* Circular Text Label: CHRIST APOSTOLIC CHURCH */}
            {/* Curved Path for Text */}
            <path id="cacTextPath" d="M18 55 A42 42 0 1 1 102 55" fill="none" />
            <text fontFamily="Inter, system-ui, sans-serif" fontSize="6.5" fontWeight="900" fill="#0A2540" letterSpacing="0.6">
              <textPath href="#cacTextPath" startOffset="50%" textAnchor="middle">
                CHRIST APOSTOLIC CHURCH
              </textPath>
            </text>

            {/* Bottom Banner Ribbon */}
            <g transform="translate(10, 88)">
              {/* Yellow Banner background */}
              <rect x="5" y="4" width="90" height="15" rx="3" fill="#FFF59D" stroke="#D4AF37" strokeWidth="1" />
              {/* Ribbon Fork fold overlays */}
              <path d="M5 8 L0 12 L5 16 Z" fill="#D4AF37" />
              <path d="M95 8 L100 12 L95 16 Z" fill="#D4AF37" />
              <text x="50" y="14" fontFamily="Inter, system-ui, sans-serif" fontSize="5" fontWeight="bold" fill="#0A2540" textAnchor="middle" letterSpacing="0.2">
                ONE FOLD, ONE SHEPHERD
              </text>
            </g>
            {/* John 10:16 sub scripture */}
            <text x="60" y="115" fontFamily="JetBrains Mono, monospace" fontSize="5.5" fontWeight="bold" fill="#D4AF37" textAnchor="middle">
              JOHN 10:16
            </text>
          </svg>
        </div>

        {/* Right: FPE Logo (Shield) */}
        <div className="relative shrink-0">
          <svg
            className={`${dimensions.height} w-auto`}
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* The Badge Shield Outline */}
            <path
              d="M25 15 C45 12, 75 12, 95 15 C95 45, 95 72, 60 93 C25 72, 25 45, 25 15 Z"
              fill="#FFFFFF"
              stroke="#0A2540"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Shield Internal Content Area Clipping Path */}
            <mask id="shieldMask">
              <path d="M25 15 C45 12, 75 12, 95 15 C95 45, 95 72, 60 93 C25 72, 25 45, 25 15 Z" fill="#FFFFFF" />
            </mask>

            <g mask="url(#shieldMask)">
              {/* Sky Blue Top Chamber */}
              <rect x="20" y="10" width="80" height="28" fill="#29B6F6" />
              {/* Red Middle Chamber */}
              <rect x="20" y="38" width="80" height="30" fill="#E53935" />
              {/* Wavy Sky Blue Bottom Chamber */}
              <rect x="20" y="68" width="80" height="30" fill="#0288D1" />

              {/* Water waves at the bottom */}
              <path d="M20 74 Q 30 71, 40 74 T 60 74 T 80 74 T 100 74" stroke="#003C5C" strokeWidth="2" fill="none" />
              <path d="M20 79 Q 30 76, 40 79 T 60 79 T 80 79 T 100 79" stroke="#003C5C" strokeWidth="2" fill="none" />
              <path d="M20 84 Q 30 81, 40 84 T 60 84 T 80 84 T 100 84" stroke="#003C5C" strokeWidth="2" fill="none" />

              {/* EDE Text Label */}
              <text x="60" y="64" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="900" fill="#0A2540" textAnchor="middle" letterSpacing="1">
                EDE
              </text>

              {/* White Mechanical Gear/Cog Motif (in the middle red band) */}
              <circle cx="60" cy="50" r="16" stroke="#FFFFFF" strokeWidth="4.5" strokeDasharray="6 3.5" fill="none" />
              <circle cx="60" cy="50" r="12" stroke="#0A2540" strokeWidth="2" fill="none" />

              {/* Open Book Academic Motif (in the top blue band) */}
              <g transform="translate(38, 20)">
                <path d="M3 13 C 11 9, 21 9, 22 13" stroke="#0A2540" strokeWidth="2" fill="none" />
                <path d="M41 13 C 33 9, 23 9, 22 13" stroke="#0A2540" strokeWidth="2" fill="none" />
                <rect x="4" y="2" width="16" height="10" rx="1" fill="#FFFFFF" stroke="#0A2540" strokeWidth="1.5" />
                <rect x="24" y="2" width="16" height="10" rx="1" fill="#FFFFFF" stroke="#0A2540" strokeWidth="1.5" />
                <line x1="7" y1="5" x2="17" y2="5" stroke="#CFD8DC" strokeWidth="1" />
                <line x1="7" y1="8" x2="17" y2="8" stroke="#CFD8DC" strokeWidth="1" />
                <line x1="27" y1="5" x2="37" y2="5" stroke="#CFD8DC" strokeWidth="1" />
                <line x1="27" y1="8" x2="37" y2="8" stroke="#CFD8DC" strokeWidth="1" />
              </g>

              {/* Central Black Obelisk/Pointer (Tower running vertical) */}
              <path d="M58 20 L62 20 L60.5 75 L59.5 75 Z" fill="#212121" />
              <polygon points="60,11 63,20 57,20" fill="#212121" />

              {/* Top Banner Label inside shield */}
              <path id="shieldTopTextPath" d="M30 20 C 45 17, 75 17, 90 20" fill="none" />
              <text fontFamily="Inter, sans-serif" fontSize="4.8" fontWeight="bold" fill="#0A2540">
                <textPath href="#shieldTopTextPath" startOffset="50%" textAnchor="middle">
                  THE FEDERAL POLYTECHNIC
                </textPath>
              </text>
            </g>

            {/* Scroll/Ribbon below shield */}
            <g transform="translate(12, 88)">
              {/* White wrap scroll ribbon */}
              <path d="M10 8 L15 2 L25 5 L20 11 Z" fill="#EAEAEA" stroke="#0A2540" strokeWidth="1" />
              <path d="M85 8 L80 2 L70 5 L75 11 Z" fill="#EAEAEA" stroke="#0A2540" strokeWidth="1" />
              <rect x="15" y="4" width="67" height="14" rx="2" fill="#FFFFFF" stroke="#0A2540" strokeWidth="1.5" />
              <text x="48" y="13" fontFamily="Inter, sans-serif" fontSize="4.2" fontWeight="900" fill="#0A2540" textAnchor="middle" letterSpacing="0.1">
                KNOWLEDGE, SKILL & CHARACTER
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Brand Text Suffix: CACYOF FPE */}
      <div className="flex flex-col pl-2 border-l border-gray-200/20">
        <div className="flex items-center space-x-1.5">
          <span className={`font-serif tracking-tight leading-none font-extrabold ${dimensions.titleSize} ${primaryColor}`}>
            CACYOF
          </span>
          <span className={`font-mono tracking-[0.05em] leading-none font-black ${dimensions.titleSize} ${subColor}`}>
            FPE
          </span>
        </div>
        <span className={`uppercase tracking-[0.25em] font-bold ${dimensions.subSize} text-gray-400 mt-1`}>
          Youth Fellowship
        </span>
      </div>
    </div>
  );
}

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
      {/* Circle Logo with Bell, Bible, and Academic Hat */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          className={`${dimensions.height} w-auto overflow-visible`}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Logo Circle (Base) */}
          {/* Filled with deep royal navy, with a golden and double concentric borders */}
          <circle cx="60" cy="65" r="42" fill="#0A2540" stroke="#D4AF37" strokeWidth="2.5" />
          <circle cx="60" cy="65" r="38" stroke="#FFFFFF" strokeWidth="0.8" strokeDasharray="3 2" />

          {/* Golden Rays radiating inside the circle from behind the Bible */}
          <g opacity="0.3">
            <line x1="60" y1="65" x2="35" y2="40" stroke="#D4AF37" strokeWidth="1" />
            <line x1="60" y1="65" x2="85" y2="40" stroke="#D4AF37" strokeWidth="1" />
            <line x1="60" y1="65" x2="60" y2="30" stroke="#D4AF37" strokeWidth="1" />
            <line x1="60" y1="65" x2="30" y2="65" stroke="#D4AF37" strokeWidth="1" />
            <line x1="60" y1="65" x2="90" y2="65" stroke="#D4AF37" strokeWidth="1" />
            <line x1="60" y1="65" x2="45" y2="90" stroke="#D4AF37" strokeWidth="1" />
            <line x1="60" y1="65" x2="75" y2="90" stroke="#D4AF37" strokeWidth="1" />
          </g>

          {/* Academic Hat (Mortarboard Cap) sitting on top of the circle */}
          <g id="academic-hat" className="transition-transform duration-300 group-hover:-translate-y-0.5">
            {/* Cap base (band around the head) */}
            <path
              d="M44 21 V26.5 C44 33, 76 33, 76 26.5 V21 Z"
              fill="#D4AF37"
              stroke="#0A2540"
              strokeWidth="1.2"
            />
            {/* The diamond top of the mortarboard */}
            <polygon
              points="60 9, 88 19, 60 29, 32 19"
              fill="#D4AF37"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            {/* Small center button on cap top */}
            <ellipse cx="60" cy="19" rx="2" ry="1" fill="#FFFFFF" />
            {/* Tassel hanging down the side */}
            <path
              d="M60 19 Q40 21, 38 29"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Tassel dangling fringe */}
            <circle cx="38" cy="30" r="1.8" fill="#D4AF37" stroke="#FFFFFF" strokeWidth="0.8" />
          </g>

          {/* The Open Holy Bible in the lower half of the circle */}
          <g id="open-bible" transform="translate(0, 4)">
            {/* Pages - Left and Right sides */}
            <path
              d="M34 81 C45 77, 57 77, 60 81 C63 77, 75 77, 86 81 L84 65 C73 61, 62 61, 60 65 C58 61, 47 61, 36 65 Z"
              fill="#FFFFFF"
              stroke="#D4AF37"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Bible bookmark ribbon (Trailing red ribbon details) */}
            <path d="M60 76 L60 87 L57 84 Z" fill="#E53935" />
            <path d="M60 76 L60 86 L62 83.5 Z" fill="#C62828" />

            {/* Micro scripture text representative lines */}
            {/* Left page lines */}
            <line x1="40" y1="69" x2="52" y2="69" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
            <line x1="40" y1="73" x2="52" y2="73" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
            <line x1="40" y1="77" x2="50" y2="77" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />

            {/* Right page lines */}
            <line x1="68" y1="69" x2="80" y2="69" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
            <line x1="68" y1="73" x2="80" y2="73" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
            <line x1="68" y1="77" x2="78" y2="77" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />

            {/* Book thick bottom pages depth shadow */}
            <path d="M34 81 L34 82 C45 78, 57 78, 60 82 C63 78, 75 78, 86 82 L86 81 Z" fill="#D4AF37" opacity="0.6" />
          </g>

          {/* The Bell placed on the Bible */}
          <g id="bell" className="transition-transform duration-300 group-hover:rotate-6 origin-[60px_35px]">
            {/* Top Loop/Handle of the Bell */}
            <circle cx="60" cy="39" r="3" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
            
            {/* Bell Crown Cap */}
            <path d="M54 43 C54 39, 66 39, 66 43 Z" fill="#D4AF37" />

            {/* Bell main trumpet cone body */}
            <path
              d="M54 43 L51 55 Q50 58, 44 59 C50 62, 70 62, 76 59 Q70 58, 66 55 L63 43 Z"
              fill="#FFF59D"
              stroke="#D4AF37"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Deep inner shadow highlight representing metallic finish */}
            <path
              d="M55 44 L53 54 Q56 56, 60 56 Q64 56, 67 54 L65 44 Z"
              fill="#FBC02D"
              opacity="0.3"
            />

            {/* Hanging Clapper (Bell striker clinking underneath) */}
            <circle cx="60" cy="61.5" r="2.5" fill="#D4AF37" stroke="#FFFFFF" strokeWidth="0.5" />

            {/* Spiritual Sound Waves (Vibration of prayer & the call of God) */}
            <g stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" opacity="0.8">
              <path d="M39 46 A 8 8 0 0 0 39 56" fill="none" />
              <path d="M35 43 A 12 12 0 0 0 35 59" fill="none" />
              <path d="M81 46 A 8 8 0 0 1 81 56" fill="none" />
              <path d="M85 43 A 12 12 0 0 1 85 59" fill="none" />
            </g>
          </g>

          {/* Small star-like decals for highlights */}
          <g fill="#D4AF37">
            {/* Star left */}
            <path d="M26 62 L27 64 L29 64 L27 65 L28 67 L26 66 L24 67 L25 65 L23 64 L25 64 Z" opacity="0.8" />
            {/* Star right */}
            <path d="M94 62 L95 64 L97 64 L95 65 L96 67 L94 66 L92 67 L93 65 L91 64 L93 64 Z" opacity="0.8" />
          </g>
        </svg>
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

import React from 'react';

interface LogoProps {
  showText?: boolean;
  subtitle?: boolean;
  className?: string;
  lightBg?: boolean;
  iconSize?: number;
  customSubtitle?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  showText = true, 
  subtitle = true, 
  className = '', 
  lightBg = false,
  iconSize = 42,
  customSubtitle
}) => {
  return (
    <div 
      className={`flex items-start gap-3 select-none min-w-0 ${className}`}
    >
      <style>{`
        @keyframes assemble-a {
          0% { transform: translate(-20px, -20px); opacity: 0; }
          100% { transform: translate(0, 0); opacity: 1; }
        }
        @keyframes assemble-s {
          0% { transform: translate(20px, 20px); opacity: 0; }
          100% { transform: translate(0, 0); opacity: 1; }
        }
        @keyframes pulse-loop {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.03); filter: brightness(1.2); }
        }
        .part-a { animation: assemble-a 1.5s ease-out forwards; }
        .part-s { animation: assemble-s 1.5s ease-out forwards; }
        .logo-container:hover .part-a, .logo-container:hover .part-s { animation: pulse-loop 2s infinite ease-in-out; }
        .logo-container .part-a, .logo-container .part-s { animation: assemble-a 1.5s ease-out forwards, pulse-loop 3s infinite 2s ease-in-out; }
      `}</style>
      
      {/* Official Ladder Logo: Isometric AS Monogram */}
      <div 
        className="relative shrink-0 flex items-center justify-center bg-[#D6CCA8] p-1.5 rounded-[10px] border border-[#2B2520]/20 logo-container shadow-xs"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg 
          width={iconSize - 10} 
          height={iconSize - 10} 
          viewBox="0 0 44 44" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          {/* Isometric A - Simplified block shapes */}
          <path className="part-a" d="M15 35 L22 10 L29 35 Z" fill="#2B2520" />
          {/* Isometric S - Simplified block shapes */}
          <path className="part-s" d="M35 15 L25 15 L25 25 L35 25 L35 35 L20 35 Z" fill="#6B6056" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[18px] font-bold font-sans leading-tight text-[#2B2520]">
              Ladder
            </span>
          </div>

          {subtitle && (
            <div className="mt-1 max-w-[200px] leading-[1.35] whitespace-normal">
              <span className="text-xs font-semibold text-[#2B2520]/85 tracking-[0.2px]">Empowering Talent,</span>
              <br />
              <span className="text-xs font-semibold text-[#2B2520]/75 tracking-[0.2px]">Bridging Academia & Industry</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;

import React from 'react';

interface PamirLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const PamirLogo: React.FC<PamirLogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', text: 'text-xs', sub: 'text-[8.5px]' },
    md: { icon: 'w-10 h-10', text: 'text-sm', sub: 'text-[9.5px]' },
    lg: { icon: 'w-12 h-12', text: 'text-base', sub: 'text-[11px]' },
    xl: { icon: 'w-16 h-16', text: 'text-xl', sub: 'text-xs' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      
      {/* Pamir Mountain Peaks & Horizon Icon Badge */}
      <div className={`relative ${currentSize.icon} shrink-0 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-1.5 flex items-center justify-center shadow-2xs group transition-transform hover:scale-105`}>
        
        <svg viewBox="0 0 100 70" fill="none" className="w-full h-full overflow-visible">
          <defs>
            {/* Mountain Ridge Gradient */}
            <linearGradient id="pamirPeakRidge" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" className="dark:stop-color-[#94A3B8]" />
              <stop offset="100%" stopColor="#334155" className="dark:stop-color-[#CBD5E1]" />
            </linearGradient>

            {/* Silk-Route Horizon Arc Gradient */}
            <linearGradient id="pamirHorizonSunrise" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* 1. Left Ridge / Foothill */}
          <path
            d="M12 55 L31 31 L35 37 L49 14"
            stroke="url(#pamirPeakRidge)"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 2. Main Central Summit Ridge */}
          <path
            d="M49 14 L64 34 L71 27 L88 55"
            stroke="url(#pamirPeakRidge)"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 3. Inner Ridge Cut */}
          <path
            d="M53 49 L64 34"
            stroke="url(#pamirPeakRidge)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 4. The Silk Route Horizon Arc */}
          <path
            d="M22 62 Q50 53 78 62"
            stroke="url(#pamirHorizonSunrise)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Live Status Ping */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#15803D] border-2 border-white dark:border-stone-900 shadow-2xs" />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-stone-900 dark:text-stone-100 font-mono transition-colors ${currentSize.text}`}>
              PAMIR<span className="text-[#EA580C]">.AI</span>
            </span>
          </div>
          <span className={`text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase font-semibold ${currentSize.sub}`}>
            Silk-Route Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
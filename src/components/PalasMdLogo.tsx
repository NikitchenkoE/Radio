import React from 'react';

interface PalasMdLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  variant?: 'full' | 'compact' | 'circle';
}

export const PalasMdLogo: React.FC<PalasMdLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
  variant = 'full',
}) => {
  if (variant === 'circle') {
    return (
      <span
        className={`inline-flex items-center justify-center font-black tracking-tighter text-white bg-slate-900 dark:bg-white dark:text-slate-900 border border-slate-700/20 shadow-xs select-none ${
          size === 'lg' ? 'w-10 h-10 text-sm' : size === 'md' ? 'w-8 h-8 text-xs' : 'w-7 h-7 text-[11px]'
        } ${className}`}
        style={{ borderRadius: '3px' }}
      >
        MD
      </span>
    );
  }

  const sizes = {
    xs: {
      title: 'text-sm font-black tracking-tight',
      sub: 'text-[9px] font-bold tracking-widest',
      gap: 'gap-1.5',
    },
    sm: {
      title: 'text-base font-black tracking-tight',
      sub: 'text-[10px] font-bold tracking-widest',
      gap: 'gap-2',
    },
    md: {
      title: 'text-lg sm:text-xl font-black tracking-tight',
      sub: 'text-[11px] font-bold tracking-widest',
      gap: 'gap-2 sm:gap-2.5',
    },
    lg: {
      title: 'text-2xl sm:text-3xl font-black tracking-tight',
      sub: 'text-xs sm:text-sm font-bold tracking-widest',
      gap: 'gap-2.5 sm:gap-3',
    },
    xl: {
      title: 'text-3xl sm:text-4xl font-black tracking-tight',
      sub: 'text-sm sm:text-base font-bold tracking-widest',
      gap: 'gap-3',
    },
  }[size];

  return (
    <div
      className={`inline-flex items-baseline ${sizes.gap} select-none cursor-default font-sans leading-none ${className}`}
      title="Palas M.D. Music Live"
    >
      <span className={`${sizes.title} text-slate-900 dark:text-white uppercase transition-colors`}>
        Palas M.D.
      </span>

      {showTagline && (
        <span
          className={`${sizes.sub} uppercase text-[#004643] dark:text-emerald-400 font-bold tracking-widest transition-colors hidden sm:inline`}
        >
          Music Live
        </span>
      )}
    </div>
  );
};

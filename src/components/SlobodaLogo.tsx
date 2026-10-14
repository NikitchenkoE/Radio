import React from 'react';
import { PalasMdLogo } from './PalasMdLogo';

interface SlobodaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const SlobodaLogo: React.FC<SlobodaLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  if (!showText) {
    return (
      <PalasMdLogo
        variant="circle"
        size={size === 'lg' ? 'md' : 'sm'}
        className={className}
      />
    );
  }

  return (
    <div className={`flex items-center select-none ${className}`}>
      <PalasMdLogo
        size={size}
        variant="full"
        showTagline={true}
      />
    </div>
  );
};


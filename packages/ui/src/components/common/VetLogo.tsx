import React from 'react';

interface VetLogoProps {
  className?: string;
  size?: number;
}

export const VetLogo: React.FC<VetLogoProps> = ({ className = 'h-8 w-auto', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="VetClínica Central Logo"
    >
      <rect width="100" height="100" rx="28" fill="#008378" />
      {/* 4 Light mint decorative dots */}
      <circle cx="36" cy="36" r="12" fill="#89F5E7" />
      <circle cx="64" cy="36" r="12" fill="#89F5E7" />
      <circle cx="28" cy="50" r="10" fill="#89F5E7" />
      <circle cx="72" cy="50" r="10" fill="#89F5E7" />
      {/* White Cross */}
      <path
        d="M50 18C46.6863 18 44 20.6863 44 24V44H24C20.6863 44 18 46.6863 18 50C18 53.3137 20.6863 56 24 56H44V76C44 79.3137 46.6863 82 50 82C53.3137 82 56 79.3137 56 76V56H76C79.3137 56 82 53.3137 82 50C82 46.6863 79.3137 44 76 44H56V24C56 20.6863 53.3137 18 50 18Z"
        fill="white"
      />
    </svg>
  );
};

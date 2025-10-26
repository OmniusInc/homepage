'use client';

import { useId } from 'react';

interface OIconProps {
  size?: number;
  gradientVariant?: 'primary' | 'purple-blue' | 'blue-cyan' | 'cyan-green' | 'purple-pink';
  className?: string;
}

export function OIcon({ size = 60, gradientVariant = 'primary', className = '' }: OIconProps) {
  const reactId = useId();
  // Gradient color configurations
  const gradients = {
    primary: {
      id: 'gradient-primary',
      colors: [
        { offset: '0%', color: '#8b5cf6' }, // purple
        { offset: '33%', color: '#3b82f6' }, // blue
        { offset: '66%', color: '#06b6d4' }, // cyan
        { offset: '100%', color: '#10b981' }, // green
      ],
    },
    'purple-blue': {
      id: 'gradient-purple-blue',
      colors: [
        { offset: '0%', color: '#8b5cf6' }, // purple
        { offset: '100%', color: '#3b82f6' }, // blue
      ],
    },
    'blue-cyan': {
      id: 'gradient-blue-cyan',
      colors: [
        { offset: '0%', color: '#3b82f6' }, // blue
        { offset: '100%', color: '#06b6d4' }, // cyan
      ],
    },
    'cyan-green': {
      id: 'gradient-cyan-green',
      colors: [
        { offset: '0%', color: '#06b6d4' }, // cyan
        { offset: '100%', color: '#10b981' }, // green
      ],
    },
    'purple-pink': {
      id: 'gradient-purple-pink',
      colors: [
        { offset: '0%', color: '#8b5cf6' }, // purple
        { offset: '100%', color: '#ec4899' }, // pink
      ],
    },
  };

  const gradient = gradients[gradientVariant];
  const uniqueId = `${gradient.id}-${reactId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="100%">
          {gradient.colors.map((color, index) => (
            <stop key={index} offset={color.offset} stopColor={color.color} />
          ))}
        </linearGradient>
      </defs>

      {/* Outer circle */}
      <circle cx="50" cy="50" r="48" stroke={`url(#${uniqueId})`} strokeWidth="12" fill="none" />

      {/* Inner white circle (center hole) */}
      <circle cx="50" cy="50" r="30" fill="white" />

      {/* Small vertical bar on the right side (logo detail) */}
      <rect x="64" y="35" width="8" height="30" fill={`url(#${uniqueId})`} rx="4" />
    </svg>
  );
}

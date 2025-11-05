import React from 'react';

export const ChurchArch = ({ className = '', variant = 'default' }) => {
  const fillColor = variant === 'inverse' ? '#ffffff' : '#fce7f3';
  const strokeColor = variant === 'inverse' ? '#ffffff' : '#ec4899';
  
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <path 
        d="M 20 180 Q 20 80, 100 20 Q 180 80, 180 180 Z" 
        fill={fillColor} 
        stroke={strokeColor} 
        strokeWidth="2" 
        opacity="0.3" 
      />
      <path 
        d="M 30 180 Q 30 90, 100 35 Q 170 90, 170 180" 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth="3" 
        opacity="0.6" 
      />
    </svg>
  );
};

export const ArchDecoration = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 400 300" fill="none" className={className}>
      <path 
        d="M 50 280 L 50 150 Q 50 50, 200 20 Q 350 50, 350 150 L 350 280" 
        stroke="#fbcfe8" 
        strokeWidth="4" 
        fill="none" 
      />
      <path 
        d="M 60 280 L 60 155 Q 60 60, 200 32 Q 340 60, 340 155 L 340 280" 
        stroke="#ec4899" 
        strokeWidth="2" 
        fill="none" 
        opacity="0.5" 
      />
      <circle cx="200" cy="35" r="8" fill="#ec4899" opacity="0.6" />
      <circle cx="120" cy="80" r="5" fill="#fbcfe8" />
      <circle cx="280" cy="80" r="5" fill="#fbcfe8" />
      <circle cx="80" cy="140" r="5" fill="#fbcfe8" />
      <circle cx="320" cy="140" r="5" fill="#fbcfe8" />
    </svg>
  );
};

export const SimpleArch = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 300 200" fill="none" className={className}>
      <path 
        d="M 30 180 Q 30 40, 150 20 Q 270 40, 270 180" 
        stroke="#ec4899" 
        strokeWidth="3" 
        fill="none" 
        opacity="0.4" 
      />
      <path 
        d="M 40 180 Q 40 50, 150 30 Q 260 50, 260 180" 
        stroke="#fbcfe8" 
        strokeWidth="2" 
        fill="none" 
      />
    </svg>
  );
};

export default ChurchArch;
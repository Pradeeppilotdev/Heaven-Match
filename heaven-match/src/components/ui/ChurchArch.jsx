<<<<<<< HEAD
import React from 'react';

export const ChurchArch = ({ className = '', variant = 'default' }) => {
=======
// Reusable module containing various SVG arch designs for UI decoration.
import React from 'react';

/**
 * Renders a stylized Church Arch SVG graphic.
 * Supports 'default' (pink/light-pink) and 'inverse' (white) color variants.
 * @param {Object} props - Component props.
 * @param {string} [props.className=''] - Additional CSS classes for styling.
 * @param {'default'|'inverse'} [props.variant='default'] - Color scheme variant.
 */
export const ChurchArch = ({ className = '', variant = 'default' }) => {
  // Determine colors based on the selected variant.
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
  const fillColor = variant === 'inverse' ? '#ffffff' : '#fce7f3';
  const strokeColor = variant === 'inverse' ? '#ffffff' : '#ec4899';
  
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
<<<<<<< HEAD
=======
      {/* Outer arch path using Quadratic Bezier curves (Q) */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
      <path 
        d="M 20 180 Q 20 80, 100 20 Q 180 80, 180 180 Z" 
        fill={fillColor} 
        stroke={strokeColor} 
        strokeWidth="2" 
        opacity="0.3" 
      />
<<<<<<< HEAD
=======
      {/* Inner arch path for definition */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
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

<<<<<<< HEAD
export const ArchDecoration = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 400 300" fill="none" className={className}>
=======
// ---

/**
 * Renders an elaborate Arch Decoration SVG featuring multiple paths and circle accents.
 * @param {Object} props - Component props.
 * @param {string} [props.className=''] - Additional CSS classes.
 */
export const ArchDecoration = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 400 300" fill="none" className={className}>
      {/* Outer path for the main arch structure */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
      <path 
        d="M 50 280 L 50 150 Q 50 50, 200 20 Q 350 50, 350 150 L 350 280" 
        stroke="#fbcfe8" 
        strokeWidth="4" 
        fill="none" 
      />
<<<<<<< HEAD
=======
      {/* Inner path for a layered effect */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
      <path 
        d="M 60 280 L 60 155 Q 60 60, 200 32 Q 340 60, 340 155 L 340 280" 
        stroke="#ec4899" 
        strokeWidth="2" 
        fill="none" 
        opacity="0.5" 
      />
<<<<<<< HEAD
=======
      {/* Decorative circle elements */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
      <circle cx="200" cy="35" r="8" fill="#ec4899" opacity="0.6" />
      <circle cx="120" cy="80" r="5" fill="#fbcfe8" />
      <circle cx="280" cy="80" r="5" fill="#fbcfe8" />
      <circle cx="80" cy="140" r="5" fill="#fbcfe8" />
      <circle cx="320" cy="140" r="5" fill="#fbcfe8" />
    </svg>
  );
};

<<<<<<< HEAD
=======
// ---

/**
 * Renders a simple, two-line arch SVG suitable for minimal designs.
 * @param {Object} props - Component props.
 * @param {string} [props.className=''] - Additional CSS classes.
 */
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
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
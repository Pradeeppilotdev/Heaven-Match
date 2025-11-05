// Reusable Card component for consistent UI structure.
import React from 'react';

/**
 * Renders a customizable card container with optional hover effects.
 * @param {Object} props - Component props.
 * @param {boolean} [props.hover=true] - Applies hover lift and border change if true.
 * @param {string} [props.className=''] - Custom Tailwind CSS classes.
 */
const Card = ({ children, className = '', hover = true }) => {
  return (
    <div className={`bg-white rounded-xl border-2 border-pink-100 p-6 transition-all duration-300 ${
      // Apply subtle hover effects for interaction.
      hover ? 'hover:border-pink-300 hover:shadow-xl transform hover:-translate-y-1' : ''
    } ${className}`}>
      {children}
    </div>
  );
};

export default Card;
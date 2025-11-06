<<<<<<< HEAD
import React from 'react';

const Card = ({ children, className = '', hover = true }) => {
  return (
    <div className={`bg-white rounded-xl border-2 border-pink-100 p-6 transition-all duration-300 ${hover ? 'hover:border-pink-300 hover:shadow-xl transform hover:-translate-y-1' : ''} ${className}`}>
=======
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
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
      {children}
    </div>
  );
};

export default Card;
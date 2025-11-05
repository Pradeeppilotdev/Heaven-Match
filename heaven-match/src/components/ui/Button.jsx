// Reusable Button component with customizable styling variants.
import React from 'react';

const Button = ({ children, variant = 'primary', className = '', onClick, ...props }) => {
  // Base styles applied consistently across all button states.
  const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 justify-center';
  
  // Defines the visual style for each supported button variant.
  const variants = {
    // Bold, primary action style with hover effects.
    primary: 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    // Bordered, secondary action style.
    outline: 'border-2 border-pink-300 text-pink-600 hover:bg-pink-50',
    // Minimal, text-only style.
    ghost: 'text-pink-600 hover:bg-pink-50'
  };
  
  return (
    <button 
      // Combines base styles, selected variant styles, and any custom overrides.
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props} // Passes standard HTML button attributes (e.g., disabled, type).
    >
      {children}
    </button>
  );
};

export default Button;
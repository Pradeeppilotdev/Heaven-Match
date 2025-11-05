//reusable model for buttons
import React from 'react';
const Button = ({ children, variant = 'primary', className = '', onClick, ...props }) => {
  const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 justify-center';
  const variants = {
    primary: 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    outline: 'border-2 border-pink-300 text-pink-600 hover:bg-pink-50',
    ghost: 'text-pink-600 hover:bg-pink-50'
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
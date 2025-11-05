import React from 'react';

const Card = ({ children, className = '', hover = true }) => {
  return (
    <div className={`bg-white rounded-xl border-2 border-pink-100 p-6 transition-all duration-300 ${hover ? 'hover:border-pink-300 hover:shadow-xl transform hover:-translate-y-1' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
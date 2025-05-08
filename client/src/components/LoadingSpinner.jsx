import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'gold', className = '' }) => {
  // Calculate spinner size based on prop
  let sizeClass = '';
  if (size === 'small') {
    sizeClass = 'h-6 w-6 border-2';
  } else if (size === 'medium') {
    sizeClass = 'h-10 w-10 border-2';
  } else if (size === 'large') {
    sizeClass = 'h-16 w-16 border-3';
  } else {
    sizeClass = 'h-10 w-10 border-2';
  }

  // Determine color class
  let colorClass = '';
  if (color === 'gold') {
    colorClass = 'border-t-[#D4AF37] border-b-[#D4AF37]';
  } else if (color === 'green') {
    colorClass = 'border-t-[#2E8B57] border-b-[#2E8B57]';
  } else if (color === 'white') {
    colorClass = 'border-t-white border-b-white';
  } else {
    colorClass = 'border-t-[#D4AF37] border-b-[#D4AF37]';
  }

  return (
    <div className={`animate-spin rounded-full ${sizeClass} ${colorClass} ${className}`}></div>
  );
};

export default LoadingSpinner; 
import React from 'react';

/**
 * ErrorAlert - A minimalist notification for form validation or API errors.
 * Uses a soft, muted red to remain consistent with the "White Lines" aesthetic.
 */
function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-3 p-4 mb-6 bg-[#FDF2F2] border border-[#F9E3E3] rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="#D97706" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      
      <p className="text-sm font-medium text-[#991B1B] tracking-tight">
        {message}
      </p>
    </div>
  );
}

export default ErrorAlert;
import React from "react";
// FIXED: Changed FilterIcon to FunnelIcon and added XMarkIcon for the temporary removal of Dark Mode toggle icons
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'; 

// NEW: Linked Heart Icon (White stroke for white link on pink background)
const LinkedHeartIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5V14.5" /> 
  </svg>
);

// Common button styles for 3D effect (Light Mode Only)
const buttonBaseClass = "px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-gray-300 bg-gray-50 text-sm text-gray-700 transition-all duration-100 ease-out flex items-center gap-1";
const buttonHoverClass = "shadow-[3px_3px_0_0_rgba(236,72,153,0.5)] -translate-x-0.5 -translate-y-0.5 hover:bg-gray-100";

// NOTE: onToggleDark and isDark are unused in the single-theme mode, but kept for signature compatibility
export default function PageHeader({ onToggleDark, isDark, onFilterClick }) { 
  return (
    // Clean, light header bar
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Logo container (Heart on Pink BG, rounded-xl) */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-pink-500 flex items-center justify-center shadow-md">
            <LinkedHeartIcon className="w-6 h-6 text-white" /> 
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Heaven Match</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Personalized recommendations powered by AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Filter button - NOW USING FunnelIcon */}
          <button 
            onClick={onFilterClick}
            className={`${buttonBaseClass} hover:${buttonHoverClass}`}
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
          </button>
          
          {/* Theme toggle removed for single-theme mode */}
        </div>
      </div>
    </header>
  );
}
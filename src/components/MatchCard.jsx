import React, { useState } from "react";
import { HeartIcon as SolidHeart, MapPinIcon, BriefcaseIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Clean Heart Icon (for button)
const HeartIcon = ({ className = "w-6 h-6", filled = false }) => (
  <svg 
    className={className} 
    fill={filled ? "currentColor" : "none"} 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    {filled ? (
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" fill="currentColor"/>
    ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    )}
  </svg>
);


const MatchCard = ({ profile, onInterest, onSkip }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  // Accessing the new AI-enriched fields
  const { name, age, location, image, profession, interests = [], bio, income, personality_tags } = profile;

  return (
    // WRAPPER: Added relative class for the stacked shadow effect
    <div className="relative group w-full h-full"> 
      {/* Stacked Shadow Elements (The "Sub-Cards" Effect) */}
      <div className="absolute inset-0 rounded-xl transition-transform duration-500 ease-out opacity-0 group-hover:opacity-100 group-hover:translate-x-3 group-hover:-translate-y-3">
        <div className="absolute inset-0 rounded-xl border border-gray-300 bg-gray-100/50 shadow-md"></div>
      </div>
      <div className="absolute inset-0 rounded-xl transition-transform duration-500 ease-out opacity-0 group-hover:opacity-100 group-hover:translate-x-2 group-hover:-translate-y-2 delay-75">
        <div className="absolute inset-0 rounded-xl border border-gray-300 bg-gray-100/70 shadow-lg"></div>
      </div>

      {/* MAIN CARD: Added z-10 and transition for the move-right effect */}
      <article className="relative z-10 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:translate-x-1 hover:-translate-y-1">
        <div className="relative overflow-hidden">
          <div className={`w-full h-64 sm:h-72 bg-gradient-to-br from-gray-100 to-gray-200 ${imageLoaded ? 'hidden' : 'block'}`} />
          <img 
            src={image} 
            alt={name} 
            className={`w-full h-64 sm:h-72 object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'block' : 'hidden'}`}
            onLoad={() => setImageLoaded(true)}
            style={{ objectPosition: 'top' }} 
          />
          
          {/* Heart Badge */}
          <div className="absolute top-4 right-4 bg-white/90 rounded-full p-2 shadow-lg backdrop-blur-sm ring-2 ring-pink-500/50">
            <SolidHeart className="w-5 h-5 text-pink-500 fill-pink-500/10" />
          </div>
          
          {/* Gradient Overlay for Name/Location */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white p-4">
            <h3 className="text-xl font-semibold">{name}, {age}</h3>
            <p className="text-sm opacity-90 flex items-center gap-1">
              <MapPinIcon className="w-4 h-4 text-pink-300" /> 
              <span>{location}</span>
            </p>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Profession & Income */}
          <div className="text-sm text-gray-700 flex flex-col gap-1 font-medium">
            <span className="flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4 text-pink-500" />
              <span>{profession} ({income || 'N/A'})</span>
            </span>
          </div>

          {/* Personality Tags/Bio Snippet */}
          <p className="text-xs text-gray-500 line-clamp-2 italic">
            {bio || 'No bio provided.'}
          </p>

          {/* Interests (Now using enriched data) */}
          <div className="flex flex-wrap gap-2">
            {[...(personality_tags || []), ...interests].slice(0, 4).map((tag, idx) => (
              <span 
                key={idx}
                className="text-xs px-3 py-1 rounded-full bg-pink-100 text-pink-700 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action Buttons (3D Pop-up styles) */}
          <div className="flex gap-3 pt-3">
            <button 
              onClick={() => onInterest(profile.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-pink-500 text-white py-2.5 rounded-xl shadow-[2px_2px_0_0_rgba(236,72,153,0.7)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-100 font-semibold text-sm"
            >
              <HeartIcon filled={true} className="w-5 h-5" /> 
              <span className="hidden sm:inline">Connect</span>
            </button>
            <button 
              onClick={() => onSkip(profile.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-xl border border-gray-300 shadow-[2px_2px_0_0_rgba(107,114,128,0.7)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-100 font-medium text-sm"
            >
              <XMarkIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Skip</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default MatchCard;
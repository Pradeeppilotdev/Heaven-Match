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


const MatchCard = ({ profile, onInterest, onSkip, connectedProfileId, onToggleConnect }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [contact, setContact] = useState(null);
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

      {/* MAIN CARD: Added z-10 and transition for the move-right effect, min-height for consistency */}
      <article className="relative z-10 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:translate-x-1 hover:-translate-y-1 flex flex-col h-full min-h-[600px]">
        <div className="relative overflow-hidden flex-shrink-0">
          <div className={`w-full h-64 sm:h-72 bg-gradient-to-br from-gray-100 to-gray-200 ${imageLoaded ? 'hidden' : 'block'}`} />
          <img 
            src={image} 
            alt={name} 
            className={`w-full h-64 sm:h-72 object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'block' : 'hidden'}`}
            onLoad={() => setImageLoaded(true)}
            style={{ objectPosition: 'top' }} 
          />
          
          {/* Heart Badge (Like/Unlike toggle) */}
          <button 
            type="button"
            onClick={() => {
              const newLiked = !liked;
              setLiked(newLiked);
              if (newLiked && onInterest) onInterest(profile.id);
            }}
            className={`absolute top-4 right-4 rounded-full p-2 shadow-lg backdrop-blur-sm ring-2 ${liked ? 'bg-pink-500/90 ring-pink-500' : 'bg-white/90 ring-pink-500/50'}`}
            title={liked ? 'Unlike' : 'Like'}
          >
            <SolidHeart className={`w-5 h-5 ${liked ? 'text-white' : 'text-pink-500'} ${liked ? 'fill-white/80' : 'fill-pink-500/10'}`} />
          </button>
          
          {/* Enhanced Gradient Overlay for Name/Location with better contrast */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30 text-white p-4 pt-8">
            <h3 className="text-xl font-semibold drop-shadow-lg">{name}, {age}</h3>
            <p className="text-sm opacity-95 flex items-center gap-1 drop-shadow-md">
              <MapPinIcon className="w-4 h-4 text-pink-300" /> 
              <span>{location}</span>
            </p>
          </div>
        </div>

        <div className="p-4 space-y-3 flex flex-col flex-1 min-h-[280px]">
          {/* Profession & Income */}
          <div className="text-sm text-gray-700 flex flex-col gap-1 font-medium h-[1.75rem]">
            <span className="flex items-center gap-2 truncate">
              <BriefcaseIcon className="w-4 h-4 text-pink-500 flex-shrink-0" />
              <span className="truncate">{profession} ({income || 'N/A'})</span>
            </span>
          </div>

          {/* Personality Tags/Bio Snippet - Minimum height for consistency */}
          <p className="text-xs text-gray-500 line-clamp-2 italic min-h-[2.5rem] overflow-hidden">
            {bio || 'No bio provided.'}
          </p>

          {/* Interests - Allow wrapping, no clipping, increased padding */}
          <div className="flex flex-wrap gap-2 min-h-[3.5rem]">
            {(interests || []).slice(0, 5).map((hobby, idx) => (
              <span 
                key={idx}
                className="text-xs px-3 py-1.5 rounded-full bg-pink-100 text-pink-700 font-medium whitespace-nowrap"
                title={hobby}
              >
                {hobby}
              </span>
            ))}
          </div>

          {/* Action Buttons (3D Pop-up styles) */}
          <div className="flex gap-3 pt-3">
            <button 
              onClick={() => {
                const becomingConnected = connectedProfileId !== profile.id;
                if (becomingConnected && !contact) {
                  const rnd1 = Math.floor(1000 + Math.random() * 9000);
                  const rnd2 = Math.floor(1000 + Math.random() * 9000);
                  const phone = `+91 ${rnd1} ${rnd2}`;
                  const email = `${name.toLowerCase().split(' ')[0] || 'user'}${rnd1}@heavenmatch.example`;
                  setContact({ phone, email });
                }
                if (onToggleConnect) onToggleConnect(profile.id);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-pink-500 text-white py-2.5 rounded-xl shadow-[2px_2px_0_0_rgba(236,72,153,0.7)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-100 font-semibold text-sm"
            >
              <HeartIcon filled={true} className="w-5 h-5" /> 
              <span className="hidden sm:inline">{connectedProfileId === profile.id ? 'Connected' : 'Connect'}</span>
            </button>
            <button 
              onClick={() => onSkip(profile.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-xl border border-gray-300 shadow-[2px_2px_0_0_rgba(107,114,128,0.7)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-100 font-medium text-sm"
            >
              <XMarkIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Skip</span>
            </button>
          </div>

          {connectedProfileId === profile.id && contact ? (
            <div className="mt-3 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm space-y-2 min-h-[120px]">
              <div className="font-semibold text-gray-800">Contact Details</div>
              <div className="text-gray-700">Phone: <span className="font-medium">{contact.phone ? (() => {
                // Extract digits after +91 (country code)
                const match = contact.phone.match(/\+91\s*(\d+)\s*(\d+)/);
                if (match) {
                  const part1 = match[1]; // First part (e.g., "98270")
                  const part2 = match[2]; // Second part (e.g., "88392")
                  // Show first 2 digits of part1 and last 3 digits of part2
                  const masked1 = part1.length >= 2 ? `${part1.slice(0, 2)}${'*'.repeat(part1.length - 2)}` : part1;
                  const masked2 = part2.length >= 3 ? `${'*'.repeat(part2.length - 3)}${part2.slice(-3)}` : part2;
                  return `+91 ${masked1} ${masked2}`;
                }
                return contact.phone;
              })() : ''}</span></div>
              <div className="text-gray-700">Email: <span className="font-medium">{(contact.email||'').replace(/(^[^@]{2})[^@]*(?=@)/, '$1***')}</span></div>
              <button className="mt-1 w-full bg-white border border-pink-300 text-pink-600 rounded-lg py-2 font-medium hover:bg-pink-50 transition">Start Chat</button>
            </div>
          ) : (
            <div className="mt-3 min-h-[120px] flex items-center justify-center bg-gradient-to-br from-pink-50/30 to-gray-50/30 rounded-lg border border-gray-100">
              <div className="text-center px-2">
                <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-pink-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-400">Click Connect to view details</p>
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

export default MatchCard;
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, MapPin, Heart } from 'lucide-react';
import profile1 from '../public/images/profiles/1.png';
import profile2 from '../public/images/profiles/2.png';
import profile3 from '../public/images/profiles/3.png';
import profile4 from '../public/images/profiles/4.png';
import profile5 from '../public/images/profiles/5.png';
import profile6 from '../public/images/profiles/6.png';
import profile7 from '../public/images/profiles/7.png';
import profile8 from '../public/images/profiles/8.png';
import profile9 from '../public/images/profiles/9.png';
import profile10 from '../public/images/profiles/10.png';
import profile11 from '../public/images/profiles/11.png';
import profile12 from '../public/images/profiles/12.png';
import profile13 from '../public/images/profiles/13.png';
import profile14 from '../public/images/profiles/14.png';
import profile15 from '../public/images/profiles/15.png';

// --- Data for all communities ---
const communities = {
  dharmic: {
    name: 'Dharmic',
    description: 'Find matches who share your Dharmic values and traditions.',
    color: 'from-orange-950 to-gray-900',
    buttonColor: 'bg-orange-600',
    buttonHover: 'hover:bg-orange-500',
    profiles: [
      { id: 'd1', name: 'Rohan & Priya', age: 'Matched!', location: 'Mumbai', tag: 'Shared Values', imageUrl: profile1 },
      { id: 'd2', name: 'Aditya K.', age: 31, location: 'Delhi', tag: 'Family Oriented', imageUrl: profile2 },
      { id: 'd3', name: 'Meera V.', age: 28, location: 'Bangalore', tag: 'Spiritual', imageUrl: profile3 },
    ]
  },
  christian: {
    name: 'Christian',
    description: 'Connect with singles who share your Christian faith and values.',
    color: 'from-rose-950 to-gray-900',
    buttonColor: 'bg-rose-600',
    buttonHover: 'hover:bg-rose-500',
    profiles: [
      { id: 'c1', name: 'David & Hannah', age: 'Matched!', location: 'Chennai', tag: 'Faith Focused', imageUrl: profile4 },
      { id: 'c2', name: 'Sarah J.', age: 29, location: 'Goa', tag: 'Community First', imageUrl: profile5 },
      { id: 'c3', name: 'Michael R.', age: 33, location: 'Kochi', tag: 'Kind & Devout', imageUrl: profile6 },
    ]
  },
  muslim: {
    name: 'Muslim',
    description: 'Discover partners who walk a shared path of faith and culture.',
    color: 'from-green-950 to-gray-900',
    buttonColor: 'bg-green-600',
    buttonHover: 'hover:bg-green-500',
    profiles: [
      { id: 'm1', name: 'Amir & Fatima', age: 'Matched!', location: 'Hyderabad', tag: 'Shared Beliefs', imageUrl: profile7 },
      { id: 'm2', name: 'Yusuf A.', age: 30, location: 'Lucknow', tag: 'Family & Faith', imageUrl: profile8 },
      { id: 'm3', name: 'Aisha K.', age: 27, location: 'Srinagar', tag: 'Devout & Modern', imageUrl: profile9 },
    ]
  },
  sikh: {
    name: 'Sikh',
    description: 'Find a life partner within the Sikh community, based on shared values.',
    color: 'from-blue-950 to-gray-900',
    buttonColor: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-500',
    profiles: [
      { id: 's1', name: 'Jaspreet & Harleen', age: 'Matched!', location: 'Amritsar', tag: "Waheguru's Grace", imageUrl: profile10 },
      { id: 's2', name: 'Manpreet S.', age: 32, location: 'Chandigarh', tag: 'Seva & Family', imageUrl: profile11 },
      { id: 's3', name: 'Simran K.', age: 29, location: 'Jalandhar', tag: 'Kind Heart', imageUrl: profile12 },
    ]
  },
  jain: {
    name: 'Jain',
    description: 'Connect with individuals who embrace the principles of non-violence and compassion.',
    color: 'from-purple-950 to-gray-900',
    buttonColor: 'bg-purple-600',
    buttonHover: 'hover:bg-purple-500',
    profiles: [
      { id: 'j1', name: 'Parth & Riya', age: 'Matched!', location: 'Ahmedabad', tag: 'Peaceful Union', imageUrl: profile13 },
      { id: 'j2', name: 'Siddharth J.', age: 34, location: 'Jaipur', tag: 'Mindful Living', imageUrl: profile14 },
      { id: 'j3', name: 'Aditi S.', age: 28, location: 'Surat', tag: 'Compassionate', imageUrl: profile15 },
    ]
  }
};
// Get an ordered array of the community keys
const communityKeys = Object.keys(communities);

/**
 * A reusable card for the phasing carousel.
 */
const ProfileCard = ({ profile, index, accentColor }) => (
  <div className="w-72 h-96 flex-shrink-0 rounded-2xl overflow-hidden shadow-xl">
    <img
      src={profile.imageUrl}
      alt={profile.name}
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
    <div className="absolute bottom-0 left-0 p-5 text-white">
      <div 
        className={`inline-block px-3 py-1 text-sm rounded-full mb-2 ${
          profile.age === 'Matched!' ? 'bg-pink-500' : `${accentColor}/80 backdrop-blur-sm`
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Heart className="w-4 h-4" />
          <span>{profile.tag}</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold">{profile.name}</h3>
      <div className="flex items-center gap-4 text-gray-200">
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4" />
          <span>{profile.age}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4" />
          <span>{profile.location}</span>
        </div>
      </div>
    </div>
  </div>
);

/**
 * The new dynamic "Community Section" component.
 */
export const CommunitySection = ()=> {
  const [selectedCommunityIndex, setSelectedCommunityIndex] = useState(0);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

  const selectedKey = communityKeys[selectedCommunityIndex];
  const currentCommunity = communities[selectedKey];
  const currentProfiles = currentCommunity.profiles;
  const totalProfiles = currentProfiles.length;
  const totalCommunities = communityKeys.length;

  const selectNextCommunity = () => {
    const nextIndex = (selectedCommunityIndex + 1) % totalCommunities;
    setSelectedCommunityIndex(nextIndex);
    setCurrentProfileIndex(0); 
  };

  const selectPrevCommunity = () => {
    const prevIndex = (selectedCommunityIndex - 1 + totalCommunities) % totalCommunities;
    setSelectedCommunityIndex(prevIndex);
    setCurrentProfileIndex(0); 
  };

  const nextProfile = () => {
    setCurrentProfileIndex((prevIndex) => (prevIndex + 1) % totalProfiles);
  };

  const prevProfile = () => {
    setCurrentProfileIndex((prevIndex) => (prevIndex - 1 + totalProfiles) % totalProfiles);
  };

  return (
    <section 
      className={`py-24 bg-gradient-to-b ${currentCommunity.color} text-white relative overflow-hidden transition-all duration-700 ease-in-out`}
    >
      <div className="container mx-auto px-4 relative z-10">
        
        {/* * FIX 1: Increased height from h-28 to h-32 to prevent text overlap.
          * Increased margin-bottom from mb-12 to mb-16 to give space.
        */}
        <div className="text-center max-w-2xl mx-auto mb-16 relative h-32">
          {communityKeys.map((key, index) => (
            <div
              key={key}
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                selectedCommunityIndex === index
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-5 pointer-events-none'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Find Your Match in the {communities[key].name} Community
              </h2>
              <p className="mt-4 text-lg text-gray-200 opacity-80">
                {communities[key].description}
              </p>
            </div>
          ))}
        </div>

        <div 
          className={`relative max-w-md mx-auto mb-16 flex items-center justify-between p-4 rounded-lg shadow-lg bg-white/10 backdrop-blur-sm transition-all duration-300 ${currentCommunity.buttonColor}`}
        >
          <button
            onClick={selectPrevCommunity}
            className={`p-2 rounded-full text-white/70 ${currentCommunity.buttonHover} transition-colors`}
            aria-label="Previous community"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          {/* * FIX 3: Removed fixed 'w-32' and added 'px-8' for padding.
          */}
          <div className="relative h-6 w-32 text-center overflow-hidden">
            {communityKeys.map((key, index) => (
              <span
                key={key}
                className={`absolute inset-0 text-xl font-bold transition-all duration-300 ease-in-out ${
                  selectedCommunityIndex === index
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
              >
                {communities[key].name}
              </span>
            ))}
          </div>

          <button
            onClick={selectNextCommunity}
            className={`p-2 rounded-full text-white/70 ${currentCommunity.buttonHover} transition-colors`}
            aria-label="Next community"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* 3. Phasing Profile Carousel & Side Navigation Wrapper */}
        <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center">
        
          <button
            onClick={prevProfile}
            className={`absolute left-0 z-30 p-3 rounded-full ${currentCommunity.buttonColor}/50 backdrop-blur-sm text-white ${currentCommunity.buttonHover} transition-colors -translate-x-4 md:-translate-x-12`}
            aria-label="Previous profile"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="relative h-[450px] w-full max-w-4xl mx-auto flex items-center justify-center [perspective:1000px]">
            {currentProfiles.map((profile, index) => {
              const delta = index - currentProfileIndex;
              const absDelta = Math.abs(delta);
              
              const transform = `
                translateX(${delta * 40}%) 
                scale(${1 - absDelta * 0.1}) 
                rotateY(${-delta * 10}deg)
              `;
              const opacity = absDelta > 1 ? 0 : (absDelta === 1 ? 0.6 : 1);
              const zIndex = totalProfiles - absDelta;

              return (
                <div
                  key={profile.id}
                  className="absolute transition-all duration-500 ease-in-out"
                  style={{ transform, opacity, zIndex }}
                >
                  <ProfileCard profile={profile} index={index} accentColor={currentCommunity.buttonColor} />
                </div>
              );
            })}
          </div>

          <button
            onClick={nextProfile}
            className={`absolute right-0 z-30 p-3 rounded-full ${currentCommunity.buttonColor}/50 backdrop-blur-sm text-white ${currentCommunity.buttonHover} transition-colors translate-x-4 md:translate-x-12`}
            aria-label="Next profile"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* 4. Bottom Dot Indicators for Profile Carousel */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {currentProfiles.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentProfileIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentProfileIndex === index ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to profile ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default CommunitySection;
import React, { useState, useEffect } from "react";
import { mockProfiles } from "../data/mockUser";
import { fetchProfiles } from "../services/api";
import MatchCard from "../components/MatchCard";
//import PageHeader from "../components/PageHeader";
import Chatbot from "../components/Chatbot";
import WelcomeModal from "../components/WelcomeModal";
import { SparklesIcon } from '@heroicons/react/24/outline';
import { checkRateLimit } from "../utils/rateLimiter";

// Loading messages and quotes
const loadingMessages = [
  "We're fetching the right match for you...",
  "A little wait for your curated matches...",
  "Our AI is busy finding your soulmate...",
  "Connecting the stars to find your perfect partner...",
  "Just a moment, your future is loading...",
  "Scanning the universe for your match...",
  "Our cupid is working overtime for you...",
  "Finding someone who'll make your heart skip a beat..."
];

const loadingQuotes = [
  "Love is not about finding the right person, but creating the right relationship.",
  "The best love is the kind that awakens the soul and makes us reach for more.",
  "You know you're in love when you can't fall asleep because reality is finally better than your dreams.",
  "A successful marriage requires falling in love many times, always with the same person.",
  "Love recognizes no barriers. It jumps hurdles, leaps fences, penetrates walls to arrive at its destination full of hope.",
  "The best thing to hold onto in life is each other.",
  "Love is composed of a single soul inhabiting two bodies.",
  "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage."
];

export default function Recommendations() {
  const [showWelcome, setShowWelcome] = useState(() => {
    const cached = localStorage.getItem('heavenMatch_userSelection');
    return !cached;
  });
  const [profiles, setProfiles] = useState(() => {
    const cached = localStorage.getItem('heavenMatch_profiles');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useRealData, setUseRealData] = useState(true);
  // Filters removed
  const [chatbotMode, setChatbotMode] = useState('conversation');
  const [userProfileSource, setUserProfileSource] = useState(() => {
    const cached = localStorage.getItem('heavenMatch_userSelection');
    return cached || null;
  }); // 'mock' or 'chatbot'
  const [connectedProfileId, setConnectedProfileId] = useState(null);
  const [skippedProfiles, setSkippedProfiles] = useState(() => {
    const cached = localStorage.getItem('heavenMatch_skippedProfiles');
    return cached ? JSON.parse(cached) : [];
  });
  const [likedProfiles, setLikedProfiles] = useState(() => {
    const cached = localStorage.getItem('heavenMatch_likedProfiles');
    return cached ? JSON.parse(cached) : [];
  });
  const [viewingProfile, setViewingProfile] = useState(null); // Track which profile is being viewed (liked or skipped)
  const [viewingProfileType, setViewingProfileType] = useState(null); // 'liked' or 'skipped'
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState('');
  const [currentLoadingQuote, setCurrentLoadingQuote] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isQuoteFading, setIsQuoteFading] = useState(false);

  // Helper function to filter out skipped profiles
  const filterSkippedProfiles = (profileList) => {
    const skippedIds = skippedProfiles.map(p => p.id);
    return profileList.filter(profile => !skippedIds.includes(profile.id));
  };

  // Rotate quotes every 5 seconds when loading with smooth fade transition
  useEffect(() => {
    if (!loading) return;
    
    const quoteInterval = setInterval(() => {
      // Fade out current quote
      setIsQuoteFading(true);
      
      // After fade-out completes, change quote and fade in
      setTimeout(() => {
        setQuoteIndex((prev) => {
          const nextIndex = (prev + 1) % loadingQuotes.length;
          setCurrentLoadingQuote(loadingQuotes[nextIndex]);
          return nextIndex;
        });
        setIsQuoteFading(false);
      }, 500); // Half of the fade animation duration
    }, 5000);

    return () => clearInterval(quoteInterval);
  }, [loading]);

  useEffect(() => {
    const cached = localStorage.getItem('heavenMatch_profiles');
    if (cached && JSON.parse(cached).length > 0 && !showWelcome) {
      // Filter skipped profiles from cache when loading
      const cachedProfiles = JSON.parse(cached);
      const filteredProfiles = filterSkippedProfiles(cachedProfiles);
      if (filteredProfiles.length > 0) {
        setProfiles(filteredProfiles);
        return; // Use cached data
      }
    }
    if (!showWelcome) {
    loadProfiles();
    }
  }, [useRealData, showWelcome, skippedProfiles]);

  const loadProfiles = async (forceRefresh = false) => {
    // Rate limiting check
    const rateLimitCheck = checkRateLimit('recommendations');
    if (!rateLimitCheck.allowed) {
      setError(`Rate limit exceeded. Please wait ${Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000)} seconds before refreshing.`);
      setLoading(false);
      return;
    }

    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = localStorage.getItem('heavenMatch_profiles');
      const cacheTime = localStorage.getItem('heavenMatch_profiles_time');
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime, 10);
        // Use cache if less than 5 minutes old
        if (age < 5 * 60 * 1000) {
          const cachedProfiles = JSON.parse(cached);
          // Filter out skipped profiles from cache
          const filteredProfiles = filterSkippedProfiles(cachedProfiles);
          setProfiles(filteredProfiles);
          return;
        }
      }
    }

    setLoading(true);
    setError(null);

    // Set random loading message and initial quote
    setCurrentLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    setCurrentLoadingQuote(loadingQuotes[0]);
    setQuoteIndex(0);

    try {
    if (useRealData) {
        // When using mock user, explicitly pass null to use mockUserProfile default
        // When using chatbot data, it will be passed via handleQuestionnaireComplete
        console.log('Loading profiles with AI ranking...');
        const data = await fetchProfiles(12, null);
        console.log('Received profiles:', data.length, data);
        
      if (data.length > 0) {
        // Filter out skipped profiles before setting
        const filteredData = filterSkippedProfiles(data);
        setProfiles(filteredData);
          localStorage.setItem('heavenMatch_profiles', JSON.stringify(data));
          localStorage.setItem('heavenMatch_profiles_time', Date.now().toString());
          setError(null);
      } else {
          throw new Error('No profiles returned from AI pipeline');
      }
    } else {
        console.log('Using mock profiles (non-AI)');
        // Filter out skipped profiles from mock profiles
        const filteredMockProfiles = filterSkippedProfiles(mockProfiles);
        setProfiles(filteredMockProfiles);
        localStorage.setItem('heavenMatch_profiles', JSON.stringify(mockProfiles));
        localStorage.setItem('heavenMatch_profiles_time', Date.now().toString());
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      setError(`Failed to load AI-curated profiles: ${error.message}. Please check your API key and try again.`);
      // Don't fall back to mockProfiles - show the error instead
      setProfiles([]);
    }
    
    setLoading(false);
  };

  const handleInterest = (id, isLiked) => {
    console.log(isLiked ? 'Liked profile:' : 'Unliked profile:', id);
    const profile = profiles.find(p => p.id === id) || skippedProfiles.find(p => p.id === id) || likedProfiles.find(p => p.id === id);
    
    if (isLiked && profile) {
      // Add to liked profiles
      const updatedLiked = [profile, ...likedProfiles.filter(p => p.id !== id)].slice(0, 50);
      setLikedProfiles(updatedLiked);
      localStorage.setItem('heavenMatch_likedProfiles', JSON.stringify(updatedLiked));
    } else {
      // Remove from liked profiles
      const updatedLiked = likedProfiles.filter(p => p.id !== id);
      setLikedProfiles(updatedLiked);
      localStorage.setItem('heavenMatch_likedProfiles', JSON.stringify(updatedLiked));
    }
  };

  const handleSkip = (id) => {
    console.log('Skipped profile:', id);
    const skipped = profiles.find(p => p.id === id);
    setProfiles(profiles.filter(p => p.id !== id));
    if (skipped) {
      const updatedSkipped = [skipped, ...skippedProfiles.filter(p => p.id !== id)].slice(0, 50);
      setSkippedProfiles(updatedSkipped);
      localStorage.setItem('heavenMatch_skippedProfiles', JSON.stringify(updatedSkipped));
    }
    // Remove from liked if it was liked
    if (likedProfiles.some(p => p.id === id)) {
      const updatedLiked = likedProfiles.filter(p => p.id !== id);
      setLikedProfiles(updatedLiked);
      localStorage.setItem('heavenMatch_likedProfiles', JSON.stringify(updatedLiked));
    }
    if (connectedProfileId === id) setConnectedProfileId(null);
  };

  const handleUndoSkip = (id) => {
    const profile = skippedProfiles.find(p => p.id === id);
    if (profile) {
      setSkippedProfiles(prev => prev.filter(p => p.id !== id));
      localStorage.setItem('heavenMatch_skippedProfiles', JSON.stringify(skippedProfiles.filter(p => p.id !== id)));
      setProfiles(prev => [profile, ...prev]);
    }
  };

  const handleViewProfile = (profile, type) => {
    setViewingProfile(profile);
    setViewingProfileType(type);
  };

  const handleCloseViewProfile = () => {
    setViewingProfile(null);
    setViewingProfileType(null);
  };

  const handleRefresh = () => {
    // Rate limiting check for refresh
    const rateLimitCheck = checkRateLimit('profileRefresh');
    if (!rateLimitCheck.allowed) {
      setError(`Refresh rate limit exceeded. Please wait ${Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000)} seconds.`);
      return;
    }
    loadProfiles(true); // Force refresh
  };
  
  // Filter handler removed

  const handleToggleConnect = (id) => {
    setConnectedProfileId(prev => (prev === id ? null : id));
  };

  const handleUseMockUser = async () => {
    setShowWelcome(false);
    setUserProfileSource('mock');
    localStorage.setItem('heavenMatch_userSelection', 'mock');
    setChatbotMode('conversation');
    setLoading(true);
    setUseRealData(true);
    await loadProfiles(true);
  };

  const handleStartChatbot = () => {
    setShowWelcome(false);
    setUserProfileSource('chatbot');
    localStorage.setItem('heavenMatch_userSelection', 'chatbot');
    setChatbotMode('questionnaire');
    // Chatbot will handle the questionnaire flow
  };

  const handleCloseModal = () => {
    setShowWelcome(false);
    if (!userProfileSource) {
      // Default to mock user if closed without selection
      setUserProfileSource('mock');
      localStorage.setItem('heavenMatch_userSelection', 'mock');
      setUseRealData(true);
      loadProfiles(true);
    }
  };

  const handleChangeSelection = () => {
    setShowWelcome(true);
  };

  const handleQuestionnaireComplete = async (userData, recommendations) => {
    setLoading(true);
    try {
      // If recommendations are provided, use them; otherwise generate them
      let profilesToSet = [];
      if (recommendations && recommendations.length > 0) {
        profilesToSet = recommendations;
        localStorage.setItem('heavenMatch_profiles', JSON.stringify(recommendations));
        localStorage.setItem('heavenMatch_profiles_time', Date.now().toString());
      } else {
        // Generate recommendations from user data
        const { generateRecommendationsFromUserData } = await import('../services/api');
        const generatedProfiles = await generateRecommendationsFromUserData(userData);
        profilesToSet = generatedProfiles;
        localStorage.setItem('heavenMatch_profiles', JSON.stringify(generatedProfiles));
        localStorage.setItem('heavenMatch_profiles_time', Date.now().toString());
      }
      // Filter out skipped profiles before setting
      const filteredProfiles = filterSkippedProfiles(profilesToSet);
      setProfiles(filteredProfiles);
      setError(null);
    } catch (error) {
      console.error('Error in handleQuestionnaireComplete:', error);
      setError(`Failed to load recommendations: ${error.message}`);
      setProfiles([]);
    } finally {
      setLoading(false);
      setChatbotMode('conversation'); // Switch back to conversation mode after completion
    }
  };

  const handleEndQuestionnaire = () => {
    setChatbotMode('conversation');
    // Optionally reset to welcome screen
    // setShowWelcome(true);
  };
  
  // Define button classes for the consistent 3D effect (Light Mode Only)
  const buttonBaseClass = "flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm text-gray-700 transition-all duration-100 ease-out font-medium shadow-sm";
  const buttonHoverClass = "shadow-[3px_3px_0_0_rgba(236,72,153,0.5)] -translate-x-0.5 -translate-y-0.5 hover:bg-gray-100";

  // Honeypot trap for bot detection
  const [honeypotTriggered, setHoneypotTriggered] = useState(false);
  
  useEffect(() => {
    // Track honeypot interactions
    if (honeypotTriggered) {
      console.warn('Bot detected: Honeypot triggered');
      // In production, send this to analytics/security service
    }
  }, [honeypotTriggered]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 doodle-bg">
      {/* <PageHeader 
        onToggleDark={() => console.log('Dark mode removed')} 
        isDark={false} 
      /> */}

      {/* Honeypot traps - invisible to humans, visible to bots */}
      <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
        <a 
          href="/api/bot-trap" 
          onClick={(e) => {
            e.preventDefault();
            setHoneypotTriggered(true);
          }}
          style={{ display: 'none' }}
        >
          Hidden Link
        </a>
        <input 
          type="text" 
          name="bot-field" 
          tabIndex="-1" 
          autoComplete="off"
          onChange={() => setHoneypotTriggered(true)}
          style={{ position: 'absolute', left: '-9999px' }}
        />
        <div 
          className="honeypot-trap"
          onClick={() => setHoneypotTriggered(true)}
          style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        
        {/* Filters removed */}
        
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {userProfileSource ? 'Your Best Matches' : 'Discover Your Matches'}
            </h2>
            <p className="text-sm text-gray-600">
              {profiles.length > 0 ? `${profiles.length} enriched profiles matching your preferences` : 'Choose how you\'d like to find your perfect match'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`${buttonBaseClass} hover:${buttonHoverClass} disabled:opacity-50`}
            >
              {loading ? 'Finding matches...' : 'Refresh'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            {userProfileSource && (
            <button
                onClick={handleChangeSelection}
              className={`${buttonBaseClass} hover:${buttonHoverClass}`}
            >
                Change Selection
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
            </button>
            )}
          </div>
        </div>

        {showWelcome && (
          <WelcomeModal
            onUseMockUser={handleUseMockUser}
            onStartChatbot={handleStartChatbot}
            onClose={handleCloseModal}
          />
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 flex items-center gap-2 font-medium">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.398 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] py-8 doodle-bg">
            {/* Animated Sparkles Icon - Smaller */}
            <div className="mb-6 animate-float">
              <div className="relative">
                <SparklesIcon className="w-14 h-14 text-pink-500 animate-pulse" />
                <div className="absolute inset-0 w-14 h-14 text-pink-300 animate-ping opacity-75">
                  <SparklesIcon className="w-14 h-14" />
                </div>
              </div>
            </div>
            
            {/* Shimmer Loading Message - Smaller text */}
            <h3 className="text-xl sm:text-2xl font-bold mb-6 shimmer-text text-center px-4">
              {currentLoadingMessage || "We're fetching the right match for you..."}
            </h3>
            
            {/* Quote Section - Doodle themed with rotating quotes */}
            <div className="max-w-xl mx-auto mt-6 px-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-pink-200 shadow-lg relative overflow-hidden">
                {/* Doodle decoration elements */}
                <div className="absolute top-2 right-2 w-8 h-8 text-pink-300 opacity-50">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                </div>
                <div className="absolute bottom-2 left-2 w-6 h-6 text-pink-300 opacity-50">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                
                <div className="flex items-start gap-3 relative z-10">
                  <div className="text-pink-500 text-2xl font-serif leading-none">"</div>
                  <p className={`text-sm sm:text-base text-gray-700 italic leading-relaxed flex-1 ${isQuoteFading ? 'animate-fade-out' : 'animate-fade-in'}`}>
                    {currentLoadingQuote || loadingQuotes[0]}
                  </p>
                  <div className="text-pink-500 text-2xl font-serif leading-none">"</div>
                </div>
              </div>
            </div>
            
            {/* Loading Dots - Smaller */}
            <div className="flex gap-2 mt-6">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            
            {/* Skeleton Cards Preview - Smaller and more subtle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 w-full opacity-20">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-pink-200 rounded-xl overflow-hidden shadow-md animate-pulse">
                  <div className="w-full h-56 bg-gradient-to-br from-pink-100 to-pink-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-pink-100 rounded w-3/4" />
                    <div className="h-2 bg-pink-100 rounded w-1/2" />
                  <div className="flex gap-2 pt-2">
                      <div className="h-6 bg-pink-100 rounded-full w-1/2" />
                      <div className="h-6 bg-pink-100 rounded-full w-1/2" />
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filterSkippedProfiles(profiles).map((profile) => {
              const isLiked = likedProfiles.some(p => p.id === profile.id);
              return (
              <MatchCard 
                key={profile.id} 
                profile={profile}
                onInterest={handleInterest}
                onSkip={handleSkip}
                  connectedProfileId={connectedProfileId}
                  onToggleConnect={handleToggleConnect}
                  isLiked={isLiked}
              />
              );
            })}
          </div>

          {/* Viewing a single profile (liked or skipped) */}
          {viewingProfile && (
            <div className="mt-10">
              <button
                onClick={handleCloseViewProfile}
                className="mb-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to {viewingProfileType === 'liked' ? 'Liked' : 'Skipped'} List
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <MatchCard 
                  key={viewingProfile.id} 
                  profile={viewingProfile}
                  onInterest={handleInterest}
                  onSkip={handleSkip}
                  connectedProfileId={connectedProfileId}
                  onToggleConnect={handleToggleConnect}
                  isLiked={likedProfiles.some(p => p.id === viewingProfile.id)}
                  onUndoSkip={viewingProfileType === 'skipped' ? () => {
                    handleUndoSkip(viewingProfile.id);
                    handleCloseViewProfile();
                  } : undefined}
                />
              </div>
          </div>
          )}

          {/* Liked Profiles Section - Compact View */}
          {!viewingProfile && likedProfiles.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                Liked Profiles ({likedProfiles.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {likedProfiles.map(lp => (
                  <div 
                    key={lp.id} 
                    onClick={() => handleViewProfile(lp, 'liked')}
                    className="min-w-[180px] bg-white border border-pink-200 rounded-xl shadow hover:shadow-lg transition-all cursor-pointer p-3 hover:border-pink-400 group"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <img 
                        src={lp.image} 
                        alt={lp.name} 
                        className="w-20 h-20 rounded-lg object-cover group-hover:scale-105 transition-transform" 
                      />
                      <div className="text-center min-w-0 w-full">
                        <div className="font-medium text-gray-900 truncate">{lp.name}, {lp.age}</div>
                        <div className="text-xs text-gray-500 truncate">{lp.location}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skipped Profiles Section - Compact View and Clickable */}
          {!viewingProfile && skippedProfiles.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Skipped Profiles ({skippedProfiles.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {skippedProfiles.map(sp => (
                  <div 
                    key={sp.id} 
                    onClick={() => handleViewProfile(sp, 'skipped')}
                    className="min-w-[180px] bg-white border border-gray-200 rounded-xl shadow hover:shadow-lg transition-all cursor-pointer p-3 hover:border-pink-300 group"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <img 
                        src={sp.image} 
                        alt={sp.name} 
                        className="w-20 h-20 rounded-lg object-cover group-hover:scale-105 transition-transform" 
                      />
                      <div className="text-center min-w-0 w-full">
                        <div className="font-medium text-gray-900 truncate">{sp.name}, {sp.age}</div>
                        <div className="text-xs text-gray-500 truncate">{sp.location}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUndoSkip(sp.id);
                        }}
                        className="text-xs px-3 py-1 bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200 transition"
                      >
                        Undo Skip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </>
        )}

        {!loading && profiles.length === 0 && (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-lg mt-10">
            <div className="text-5xl mb-4 text-pink-500">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-lg text-gray-700 mb-6 font-medium">No more matches to show right now</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 rounded-full bg-pink-500 text-white font-medium hover:bg-pink-600 transition-all shadow-md hover:shadow-lg"
            >
              Load More Profiles
            </button>
          </div>
        )}
      </main>
      
      <Chatbot 
        mode={chatbotMode}
        onQuestionnaireComplete={handleQuestionnaireComplete}
        onEndQuestionnaire={handleEndQuestionnaire}
      /> 
    </div>
  );
}
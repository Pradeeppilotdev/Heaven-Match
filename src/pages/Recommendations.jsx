import React, { useState, useEffect } from "react";
import { mockProfiles } from "../data/mockUser";
import { fetchProfiles } from "../services/api";
import MatchCard from "../components/MatchCard";
//import PageHeader from "../components/PageHeader";
import Chatbot from "../components/Chatbot";
import WelcomeModal from "../components/WelcomeModal";

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
  const [skippedProfiles, setSkippedProfiles] = useState([]);

  useEffect(() => {
    const cached = localStorage.getItem('heavenMatch_profiles');
    if (cached && JSON.parse(cached).length > 0 && !showWelcome) {
      return; // Use cached data
    }
    if (!showWelcome) {
      loadProfiles();
    }
  }, [useRealData, showWelcome]);

  const loadProfiles = async (forceRefresh = false) => {
    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = localStorage.getItem('heavenMatch_profiles');
      const cacheTime = localStorage.getItem('heavenMatch_profiles_time');
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime, 10);
        // Use cache if less than 5 minutes old
        if (age < 5 * 60 * 1000) {
          setProfiles(JSON.parse(cached));
          return;
        }
      }
    }

    setLoading(true);
    setError(null);

    try {
      if (useRealData) {
        // When using mock user, explicitly pass null to use mockUserProfile default
        // When using chatbot data, it will be passed via handleQuestionnaireComplete
        console.log('Loading profiles with AI ranking...');
        const data = await fetchProfiles(12, null);
        console.log('Received profiles:', data.length, data);
        
        if (data.length > 0) {
          setProfiles(data);
          localStorage.setItem('heavenMatch_profiles', JSON.stringify(data));
          localStorage.setItem('heavenMatch_profiles_time', Date.now().toString());
          setError(null);
        } else {
          throw new Error('No profiles returned from AI pipeline');
        }
      } else {
        console.log('Using mock profiles (non-AI)');
        setProfiles(mockProfiles);
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

  const handleInterest = (id) => {
    console.log('Showed interest in profile:', id);
  };

  const handleSkip = (id) => {
    console.log('Skipped profile:', id);
    const skipped = profiles.find(p => p.id === id);
    setProfiles(profiles.filter(p => p.id !== id));
    if (skipped) setSkippedProfiles(prev => [skipped, ...prev].slice(0, 10));
    if (connectedProfileId === id) setConnectedProfileId(null);
  };

  const handleRefresh = () => {
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
    // Update profiles with chatbot recommendations
    setProfiles(recommendations);
    localStorage.setItem('heavenMatch_profiles', JSON.stringify(recommendations));
    localStorage.setItem('heavenMatch_profiles_time', Date.now().toString());
    setLoading(false);
    setChatbotMode('conversation'); // Switch back to conversation mode after completion
  };

  const handleEndQuestionnaire = () => {
    setChatbotMode('conversation');
    // Optionally reset to welcome screen
    // setShowWelcome(true);
  };
  
  // Define button classes for the consistent 3D effect (Light Mode Only)
  const buttonBaseClass = "flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm text-gray-700 transition-all duration-100 ease-out font-medium shadow-sm";
  const buttonHoverClass = "shadow-[3px_3px_0_0_rgba(236,72,153,0.5)] -translate-x-0.5 -translate-y-0.5 hover:bg-gray-100";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 doodle-bg">
      {/* <PageHeader 
        onToggleDark={() => console.log('Dark mode removed')} 
        isDark={false} 
      /> */}

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg animate-pulse">
                <div className="w-full h-72 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-gray-200 rounded-full w-1/2" />
                    <div className="h-8 bg-gray-200 rounded-full w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {profiles.map((profile) => (
                <MatchCard 
                  key={profile.id} 
                  profile={profile}
                  onInterest={handleInterest}
                  onSkip={handleSkip}
                  connectedProfileId={connectedProfileId}
                  onToggleConnect={handleToggleConnect}
                />
              ))}
            </div>
            {skippedProfiles.length > 0 && (
              <div className="mt-10">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Skipped profiles</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {skippedProfiles.map(sp => (
                    <div key={sp.id} className="min-w-[220px] bg-white border border-gray-200 rounded-xl shadow p-3">
                      <div className="flex items-center gap-3">
                        <img src={sp.image} alt={sp.name} className="w-14 h-14 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{sp.name}, {sp.age}</div>
                          <div className="text-xs text-gray-500 truncate">{sp.location}</div>
                        </div>
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
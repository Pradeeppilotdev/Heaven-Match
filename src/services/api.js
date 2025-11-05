import { getGeminiRankedRecommendations } from "./ai"; // <-- NEW: Import the Gemini ranking function
import { mockUserProfile, mockProfiles } from "../data/mockUser"; 
import { staticCandidates } from "../data/staticCandidates"; 

// NOTE: vectorUtils and generateEmbeddingsHF imports are REMOVED

/**
 * Converts chatbot-collected data into a user profile format compatible with recommendation system
 */
const convertChatbotDataToUserProfile = (chatbotData) => {
  // Parse hobbies from string to array (handle both comma-separated and space-separated)
  let hobbiesArray = [];
  if (chatbotData.hobbies) {
    if (typeof chatbotData.hobbies === 'string') {
      hobbiesArray = chatbotData.hobbies.split(/[,\s]+/).map(h => h.trim()).filter(h => h);
    } else if (Array.isArray(chatbotData.hobbies)) {
      hobbiesArray = chatbotData.hobbies;
    }
  }

  // Extract career fields from job/profession
  const careerFields = chatbotData.job ? [chatbotData.job] : [];

  // Create a user profile structure similar to mockUserProfile
  return {
    id: "user-chatbot-generated",
    name: "Chatbot User",
    age: null, // Not collected in questionnaire
    profession: chatbotData.job || "Not specified",
    interests: hobbiesArray,
    preference: {
      ageRange: chatbotData.ageRange || "25-35",
      locationPriority: "Major Indian cities", // Default
      careerFields: careerFields,
      mustMatchInterests: hobbiesArray.slice(0, 3), // Top 3 hobbies as must-match
      values: [] // Not collected in questionnaire
    }
  };
};

export const fetchProfiles = async (count = 8, userProfile = null) => {
  try {
    console.log('fetchProfiles called with:', { count, userProfile: userProfile ? 'provided' : 'using mockUserProfile' });
    
    // 1. Prepare Candidate Set (using local static data)
    // We augment the static data to have a placeholder image and clean up fields
    const candidates = staticCandidates.map(p => ({
        ...p,
        // Add a placeholder image URL for all profiles
        image: p.image || `https://picsum.photos/seed/${p.id}/300/400`, 
        interests: [...(p.hobbies || []), ...(p.sports || [])].slice(0, 4),
        bio: p.bio_text,
        personality_tags: p.personality_tags || [],
        income: p.income || 'N/A',
        profession: p.profession,
    }));

    console.log(`Prepared ${candidates.length} candidates from staticCandidates`);

    // Use provided userProfile or default to mockUserProfile
    const profileToUse = userProfile || mockUserProfile;
    console.log('Using profile:', profileToUse.name || profileToUse.id, 'with preferences:', profileToUse.preference);

    // 2. --- GEMINI RANKING (REPLACES SEMANTIC MATCHING) ---
    console.log('Calling getGeminiRankedRecommendations...');
    const rankedIds = await getGeminiRankedRecommendations(candidates, profileToUse);
    console.log('Received ranked IDs:', rankedIds);

    if (rankedIds.length === 0) {
        console.error("Gemini ranking returned an empty list.");
        throw new Error("AI Ranking failed to return compatible IDs.");
    }
    
    // 3. Create a map and sort profiles based on the ranked ID list
    const profileMap = candidates.reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
    }, {});
    
    const finalRankedProfiles = rankedIds
        .map(id => profileMap[id]) // Retrieve profile object using the ranked ID
        .filter(profile => profile !== undefined) // Filter out any missing IDs
        .slice(0, count);

    console.log(`Returning ${finalRankedProfiles.length} ranked profiles`);
    
    if (finalRankedProfiles.length === 0) {
        throw new Error("No profiles matched after ranking");
    }

    return finalRankedProfiles;

  } catch (error) {
    console.error('Final AI pipeline failure:', error);
    console.error('Error details:', error.message, error.stack);
    // Don't return mockProfiles - let the error propagate so the UI can show it
    throw error;
  }
};

/**
 * Generate recommendations from chatbot-collected user data
 */
export const generateRecommendationsFromUserData = async (chatbotData) => {
  const userProfile = convertChatbotDataToUserProfile(chatbotData);
  return await fetchProfiles(12, userProfile);
};
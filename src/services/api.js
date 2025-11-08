//api.js

import { getGeminiRankedRecommendations } from "./ai"; // <-- NEW: Import the Gemini ranking function
import { mockUserProfile } from "../data/mockUser"; 
import { staticCandidates } from "../data/staticCandidates";

// API Configuration
const API_BASE_URL = "https://cliff-unseductive-mariam.ngrok-free.dev";
const PROFILE_ENDPOINT = `${API_BASE_URL}/api/profile/user`;
const IMAGE_ENDPOINT = `${API_BASE_URL}/api/images/user`;

// User IDs that don't exist in the API (should be skipped)
const MISSING_USER_IDS = [4, 8, 11, 14, 16];

/**
 * Fetches a single user profile from the API
 * @param {number} userId - The user ID to fetch
 * @returns {Promise<Object|null>} - The mapped profile object or null if fetch fails
 */
const fetchUserProfileFromAPI = async (userId) => {
  try {
    const response = await fetch(`${PROFILE_ENDPOINT}/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add ngrok-skip-browser-warning header to avoid ngrok warning page
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`User ${userId} not found in API`);
        return null;
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const apiData = await response.json();
    return apiData;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
};

/**
 * Maps API response format to our internal profile format
 * @param {Object} apiProfile - The profile data from API
 * @returns {Object} - Mapped profile object
 */
const mapApiProfileToInternalFormat = (apiProfile) => {
  // Parse hobbies from string to array
  let interests = [];
  if (apiProfile.hobbies) {
    if (typeof apiProfile.hobbies === 'string') {
      interests = apiProfile.hobbies.split(',').map(h => h.trim()).filter(h => h);
    } else if (Array.isArray(apiProfile.hobbies)) {
      interests = apiProfile.hobbies;
    }
  }

  // Format income - convert number to string with LPA if needed
  let incomeFormatted = 'N/A';
  if (apiProfile.income !== null && apiProfile.income !== undefined) {
    if (typeof apiProfile.income === 'number') {
      // Convert to LPA format
      // If income is >= 1000, assume it's in thousands (e.g., 200000 = 200 LPA)
      // If income is < 1000, assume it's already in LPA format
      if (apiProfile.income >= 1000) {
        const lpaValue = Math.floor(apiProfile.income / 1000);
        incomeFormatted = `${lpaValue}-${lpaValue + 5} LPA`;
      } else {
        incomeFormatted = `${apiProfile.income} LPA`;
      }
    } else if (typeof apiProfile.income === 'string') {
      // If it's already a string, check if it has LPA
      incomeFormatted = apiProfile.income.toUpperCase().includes('LPA') 
        ? apiProfile.income 
        : `${apiProfile.income} LPA`;
    } else {
      incomeFormatted = String(apiProfile.income);
    }
  }

  // Build full name
  const fullName = apiProfile.name || 
    `${apiProfile.first_name || ''} ${apiProfile.last_name || ''}`.trim() || 
    'Unknown';

  // Use images endpoint for image URL
  // If user_id exists, use the images API endpoint, otherwise fallback to image_url or placeholder
  let imageUrl;
  if (apiProfile.user_id) {
    imageUrl = `${IMAGE_ENDPOINT}/${apiProfile.user_id}`;
  } else if (apiProfile.image_url) {
    // If image_url is a relative path, prepend the base URL
    imageUrl = apiProfile.image_url.startsWith('http') 
      ? apiProfile.image_url 
      : `${API_BASE_URL}${apiProfile.image_url}`;
  } else {
    imageUrl = `https://picsum.photos/seed/${apiProfile.user_id || 'unknown'}/600/800`;
  }

  return {
    id: `api-user-${apiProfile.user_id}`,
    name: fullName,
    age: apiProfile.age || null,
    location: apiProfile.location || 'Not specified',
    image: imageUrl,
    profession: apiProfile.profession || 'Not specified',
    interests: interests.slice(0, 5), // Limit to 5 interests
    bio: apiProfile.about_me || apiProfile.bio || '',
    income: incomeFormatted,
    education: apiProfile.education || 'Not specified',
    gender: apiProfile.gender || 'Not specified',
    // Additional fields from API that might be useful
    marital_status: apiProfile.marital_status,
    height: apiProfile.height,
    weight: apiProfile.weight,
    mother_tongue: apiProfile.mother_tongue,
    personality_tags: interests.slice(0, 3), // Use top 3 interests as personality tags
    // Store original API data for reference
    _apiData: apiProfile
  };
};

/**
 * Fetches multiple user profiles from the API
 * @param {number} maxUsers - Maximum number of users to try fetching (will skip missing IDs)
 * @returns {Promise<Array>} - Array of mapped profile objects
 */
const fetchProfilesFromAPI = async (maxUsers = 20) => {
  const profiles = [];
  const userIdsToFetch = [];

  // Generate list of user IDs to fetch (skip missing ones)
  for (let i = 1; i <= maxUsers; i++) {
    if (!MISSING_USER_IDS.includes(i)) {
      userIdsToFetch.push(i);
    }
  }

  // Fetch all profiles in parallel
  const fetchPromises = userIdsToFetch.map(userId => fetchUserProfileFromAPI(userId));
  const apiResponses = await Promise.all(fetchPromises);

  // Map successful responses to internal format
  apiResponses.forEach((apiProfile, index) => {
    if (apiProfile) {
      const mappedProfile = mapApiProfileToInternalFormat(apiProfile);
      profiles.push(mappedProfile);
    }
  });

  return profiles;
}; 

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

  // Extract career fields from profession (previously job)
  const careerFields = chatbotData.profession ? [chatbotData.profession] : [];

  // Format income to ensure it has "LPA" suffix if missing
  let formattedIncome = chatbotData.income || '';
  if (formattedIncome && !formattedIncome.toUpperCase().includes('LPA')) {
    formattedIncome = formattedIncome.includes('-') ? `${formattedIncome} LPA` : `approx ${formattedIncome} LPA`;
  }

  // Create a user profile structure similar to mockUserProfile
  return {
    id: "user-chatbot-generated",
    name: "Chatbot User",
    age: null, // Not collected directly (ageRange is collected instead)
    profession: chatbotData.profession || chatbotData.job || "Not specified", // Support both field names
    interests: hobbiesArray,
    location: chatbotData.location || "Not specified",
    income: formattedIncome,
    education: chatbotData.education || "Not specified",
    preference: {
      ageRange: chatbotData.ageRange || "25-35",
      locationPriority: chatbotData.location || "Major Indian cities",
      careerFields: careerFields,
      mustMatchInterests: hobbiesArray.slice(0, 3), // Top 3 hobbies as must-match
      values: [] // Not collected in questionnaire
    }
  };
};

export const fetchProfiles = async (count = 8, userProfile = null) => {
  try {
    // 1. Fetch Candidate Set from API
    console.log('Fetching profiles from API...');
    const apiCandidates = await fetchProfilesFromAPI(20); // Try to fetch up to 20 users (skipping missing IDs)

    if (apiCandidates.length === 0) {
      throw new Error("No profiles fetched from API. Please check the API endpoint.");
    }

    console.log(`✅ Fetched ${apiCandidates.length} profiles from API`);

    // Fallback to static candidates if API fails (but we'll still try API first)
    let candidates = apiCandidates;

    // If we have fewer candidates than needed, supplement with static data
    if (candidates.length < count) {
      console.warn(`Only ${candidates.length} profiles from API, supplementing with static data`);
      const staticCandidatesFormatted = staticCandidates.map(p => ({
        ...p,
        image: p.image || `https://picsum.photos/seed/${p.id}/600/800`, 
        interests: (p.hobbies || []).slice(0, 5),
        bio: p.bio_text,
        personality_tags: p.personality_tags || [],
        income: p.income || 'N/A',
        profession: p.profession,
        education: p.education || 'Not specified',
        location: p.location || 'Not specified',
      }));
      candidates = [...candidates, ...staticCandidatesFormatted];
    }

    // Use provided userProfile or default to mockUserProfile
    const profileToUse = userProfile || mockUserProfile;

    // 2. --- GEMINI RANKING (REPLACES SEMANTIC MATCHING) ---
    const rankedIds = await getGeminiRankedRecommendations(candidates, profileToUse);

    if (rankedIds.length === 0) {
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
    
    if (finalRankedProfiles.length === 0) {
        throw new Error("No profiles matched after ranking");
    }

    return finalRankedProfiles;

  } catch (error) {
    console.error('Final AI pipeline failure:', error);
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
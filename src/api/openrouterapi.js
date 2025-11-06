// src/api/openRouter.js
import axios from 'axios';
import { MOCK_PROFILES } from '../data/mockProfiles'; // 💡 NEW IMPORT

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_NAME = "mistralai/mistral-7b-instruct:free"; 

// Convert the mock profiles array into a string format the AI can easily read
const PROFILES_STRING = JSON.stringify(MOCK_PROFILES);

/**
 * Sends a conversation history to the OpenRouter API.
 */
export const getChatCompletion = async (messages) => {
    // ... existing API key check ...

    // 💡 UPDATED SYSTEM MESSAGE to include the profile data
    const systemPromptContent = `
        You are an expert matrimony matchmaker AI. Your goal is to identify the user's gender and then provide personalized, relevant match suggestions based on the conversation history.
        
        **AVAILABLE PROFILES (Your Database):**
        ${PROFILES_STRING}
        
        **Instructions:**
        1. Select 1-2 profiles from the AVAILABLE PROFILES list that best match the user's stated criteria (gender, city, values, etc.).
        2. The match suggestions MUST be formatted as a single JSON object (inside triple backticks \`\`\`json ... \`\`\`) with an array of matches.
        3. Each match object MUST include the keys: 'Name', 'Age', 'Occupation', 'City', 'CompatibilityScore' (generate a score based on conversation), and 'Summary'.
        4. Start by politely asking for the user's gender and key partner preferences.
    `;

    try {
        const response = await axios.post(API_URL, {
            model: MODEL_NAME,
            messages: [
                {
                    role: "system",
                    content: systemPromptContent // 💡 Use the new dynamic prompt
                },
                ...messages
            ],
            temperature: 0.7, 
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // ... existing response and error handling ...
        
        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            throw new Error("API returned an empty or invalid response structure.");
        }
        
        return response.data.choices[0].message.content;

    } catch (error) {
        // ... existing error handling ...
        if (error.response) {
            const status = error.response.status;
            // ... (rest of error logging and throwing) ...
            switch (status) {
                case 401:
                    throw new Error("API Key Invalid. Check your .env key.");
                // ... (other error cases) ...
                default:
                    throw new Error(`External API Error: Status ${status}. See console for details.`);
            }
        } else {
            throw new Error("Failed to connect to the server. Check network connection or setup.");
        }
    }
};
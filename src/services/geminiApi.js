import { GoogleGenAI } from "@google/genai";

// Load key securely from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 

if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables (e.g., .env file).");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const model = "gemini-2.5-pro";

// --- CHATBOT FUNCTION ---
export const getChatbotResponse = async (history, newMessage) => {
  const geminiHistory = history.map(msg => ({ 
    role: msg.role === 'model' ? 'model' : 'user', 
    parts: [{ text: msg.content }] 
  }));

  const chat = ai.chats.create({ 
    model: model, 
    history: geminiHistory,
    config: {
        systemInstruction: "You are Heaven Match AI, a helpful, friendly, and professional matrimonial and dating assistant. Your primary goal is to guide the user in their search for a perfect partner on the Heaven Match platform. You are positive and focus on compatibility and positive outcomes. Keep your answers concise unless more detail is requested."
    }
  });

  try {
    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the AI right now. Please check your API key or try again later.";
  }
};


// --- AI PROFILE ENRICHMENT FUNCTION ---
export const enrichProfileWithAI = async (basicProfile) => {
    
    // Define the structured output schema for reliable parsing
    const schema = {
        type: "object",
        properties: {
            profession: { type: "string", description: "A realistic and professional job title." },
            income_lpa: { type: "string", description: "A realistic income range in Lakhs per Annum (LPA), e.g., 10-15 LPA or 20-30 LPA." },
            sports: { type: "array", items: { type: "string" }, description: "3 popular sports they enjoy." },
            hobbies: { type: "array", items: { type: "string" }, description: "3 realistic hobbies/interests." },
            personality_tags: { type: "array", items: { type: "string" }, description: "3 key personality tags (e.g., adventurous, calm, intellectual)." },
            bio: { type: "string", description: "A short, natural, and appealing bio (max 3 sentences)." }
        },
        required: ["profession", "income_lpa", "sports", "hobbies", "personality_tags", "bio"]
    };

    const prompt = `
        You are an AI Profile Generator for a matrimonial service. 
        Generate realistic, structured data to enrich the following basic profile. 
        Make the data suitable for a sophisticated, modern professional:
        
        Profile Details:
        - Name: ${basicProfile.name}
        - Age: ${basicProfile.age}
        - Location: ${basicProfile.location}
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            },
        });

        const enrichedData = JSON.parse(response.text);
        return enrichedData;

    } catch (error) {
        console.error("AI Profile Enrichment Error:", error);
        return null;
    }
};
// AI Icebreaker demo module for feature page.
// Showcases the AI's ability to generate dating icebreakers using the Gemini API.
import React, { useState } from 'react';
import { Wand2, Sparkles, Loader2 } from 'lucide-react';
import Card from './Card'; 
import Button from './Button';
// We are not using Headless UI, so no extra imports are needed.

/**
 * Renders an interactive demo for the AI Icebreaker feature, fetching content from the Gemini API.
 * The component manages topic selection, loading state, and result display.
 */
export const AIIcebreakerDemo = () => {
  const [selectedTopic, setSelectedTopic] = useState('Travel');
  const [icebreakers, setIcebreakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const topics = ['Travel', 'Food', 'Movies', 'Music', 'Hobbies'];

  /**
   * Asynchronously calls the Gemini API to generate new icebreakers based on the current topic.
   */
  const generateIcebreakers = async () => {
    setLoading(true);
    setError(null);
    setIcebreakers([]); 

    // --- FIX 1: Access the API key using Vite's `import.meta.env` ---
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    // Critical API Key Validation with graceful local fallback
    if (!apiKey) {
      console.error("VITE_GEMINI_API_KEY is not configured.");
      const local = [
        `What was your favorite ${selectedTopic.toLowerCase()} memory and why?`,
        `Two truths and a lie about ${selectedTopic.toLowerCase()} – I'll guess!`,
        `Teach me something quirky about ${selectedTopic.toLowerCase()}.`
      ];
      setIcebreakers(local);
      setError("API key not set. Showing mock data.");
      setLoading(false);
      return;
    }

    // --- FIX 2: Use a stable model name and standard fetch ---
    // Using the 'gemini-1.5-flash' model from your `ai.js` file
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `
      You are a fun, friendly dating assistant for 'Heaven Match'. 
      Write 3 short, charming, and slightly witty icebreaker messages 
      for a dating app, based on the topic of '${selectedTopic}'.
    `;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: { type: "STRING" }
        }
      }
    };

    try {
      // --- FIX 3: Replaced `callGeminiAPI` with a standard `fetch` call ---
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Check for empty or malformed response
      if (!result.candidates || !result.candidates[0].content.parts[0].text) {
        throw new Error("Invalid response structure from API.");
      }
      
      const jsonText = result.candidates[0].content.parts[0].text;
      const parsedIcebreakers = JSON.parse(jsonText);
      setIcebreakers(parsedIcebreakers);

    } catch (err) {
      console.error("Failed to generate icebreakers:", err);
      // --- FIX 4: Replaced `getErrorMessage` with a user-friendly string ---
      setError("Sorry, the AI is a bit shy right now. Please try again.");
      // You can also add mock data here as a fallback
      const local = [
        `If you could only eat one ${selectedTopic.toLowerCase()} for a year, what would it be?`,
        `What's your most controversial ${selectedTopic.toLowerCase()} opinion?`,
      ];
      setIcebreakers(local);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Reverted to the styling from your code snippet
    <Card className="p-6" hover={false}>
      <div className="flex flex-col h-full">
        {/* Icon */}
        <div className="mb-4">
          <Wand2 className="w-8 h-8 text-gray-700" />
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Icebreaker Demo</h3>
        
        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          See our AI in action! Pick a topic and get unique conversation starters designed to spark meaningful connections.
        </p>
        
        {/* Interactive Elements */}
        <div className="space-y-3 flex-1 flex flex-col">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Topic</label>
            {/* Kept the standard <select> as requested */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={loading}
              className="w-full p-2.5 border border-[#E5E7EB] rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D81B60] focus:border-[#D81B60] text-sm shadow-sm hover:shadow-md transition-all duration-300"
            >
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
          
          <Button
            onClick={generateIcebreakers}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>{loading ? 'Generating...' : 'Generate Icebreakers'}</span>
          </Button>
          
          {/* Results Display - Scrolling text area */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex-1 flex flex-col">
            {error && (
              <div className="flex items-center justify-center h-full">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            {!loading && icebreakers.length > 0 && (
              <div className="flex-1 overflow-y-auto">
                <ul className="space-y-2">
                  {icebreakers.map((icebreaker, index) => (
                    <li key={index} className="text-sm text-gray-700 p-2.5 bg-gray-50 rounded border border-gray-200">
                      "{icebreaker}"
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {!loading && icebreakers.length === 0 && !error && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-xs">Select a topic and generate icebreakers</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AIIcebreakerDemo;
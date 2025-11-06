<<<<<<< HEAD
=======
// AI Icebreaker demo module for feature page.
// Showcases the AI's ability to generate dating icebreakers using the Gemini API.
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
import React, { useState } from 'react';
import { Wand2, Sparkles, Loader2 } from 'lucide-react';
import Card from './Card'; 
import Button from './Button';

<<<<<<< HEAD
=======
/**
 * Renders an interactive demo for the AI Icebreaker feature, fetching content from the Gemini API.
 * The component manages topic selection, loading state, and result display.
 */
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
export const AIIcebreakerDemo = () => {
  const [selectedTopic, setSelectedTopic] = useState('Travel');
  const [icebreakers, setIcebreakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const topics = ['Travel', 'Food', 'Movies', 'Music', 'Hobbies'];

<<<<<<< HEAD
=======
  /**
   * Asynchronously calls the Gemini API to generate new icebreakers based on the current topic.
   */
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
  const generateIcebreakers = async () => {
    setLoading(true);
    setError(null);
    setIcebreakers([]); 

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

<<<<<<< HEAD
=======
    // Critical API Key Validation
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
    if (!apiKey || apiKey === "REACT_APP_GEMINI_API_KEy") {
      setError("API key is not configured.");
      setLoading(false);
      return;
    }

<<<<<<< HEAD
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
=======
    // Use the flash model for fast response times suitable for a demo/UI.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    // Detailed prompt to guide the AI's persona, context, and desired output format.
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
    const prompt = `
      You are a fun, friendly dating assistant for 'Heaven Match'. 
      Write 3 short, charming, and slightly witty icebreaker messages 
      for a dating app, based on the topic of '${selectedTopic}'.
    `;

<<<<<<< HEAD
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
=======
    // Configuration to ensure the AI responds with clean, parsable JSON.
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        // Enforce JSON output for reliable parsing on the client-side.
        responseMimeType: "application/json",
        responseSchema: {
          // Specify the expected JSON structure as an array of strings.
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
          type: "ARRAY",
          items: { type: "STRING" }
        }
      }
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

<<<<<<< HEAD
=======
      // Check for HTTP error status codes (e.g., 400, 500).
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
<<<<<<< HEAD
=======
      // Extract the raw JSON text from the nested API response structure.
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
      const jsonText = result.candidates[0].content.parts[0].text;
      const parsedIcebreakers = JSON.parse(jsonText);
      setIcebreakers(parsedIcebreakers);

    } catch (err) {
      console.error("Failed to generate icebreakers:", err);
<<<<<<< HEAD
      setError("Sorry, the AI is a bit shy right now. Please try again.");
    } finally {
=======
      // User-friendly error message for the UI.
      setError("Sorry, the AI is a bit shy right now. Please try again.");
    } finally {
      // Ensure loading state is reset regardless of success or failure.
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
=======
    // Styling for the demo card.
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
    <Card className="col-span-1 md:col-span-2 lg:col-span-1 border-pink-400 border-2 shadow-pink-200 shadow-lg" hover={false}>
      <div className="flex flex-col text-center space-y-4">
        <div className="inline-flex justify-center">
          <div className="p-4 bg-pink-100 rounded-full">
            <Wand2 className="w-8 h-8 text-pink-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Smart Icebreaker Demo</h3>
        <p className="text-gray-600">
          See our AI in action! Pick a topic and get unique conversation starters.
        </p>
        
        {/* The Interactive Part */}
        <div className="pt-2 space-y-4">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
<<<<<<< HEAD
            disabled={loading}
=======
            disabled={loading} // Disable during API call
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
          
          <Button
            onClick={generateIcebreakers}
<<<<<<< HEAD
            disabled={loading}
            className="w-full"
          >
=======
            disabled={loading} // Disable during API call
            className="w-full"
          >
            {/* Conditional rendering for loading spinner or icon */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>{loading ? 'Generating...' : 'Generate Icebreakers'}</span>
          </Button>
        </div>

<<<<<<< HEAD
        <div className="pt-4 text-left space-y-3 min-h-[100px]">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
=======
        {/* Results Display Area */}
        <div className="pt-4 text-left space-y-3 min-h-[100px]">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          {/* Icebreaker List */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
          {!loading && icebreakers.length > 0 && (
            <ul className="list-none space-y-3">
              {icebreakers.map((icebreaker, index) => (
                <li key={index} className="text-sm text-gray-800 bg-pink-50 border-l-4 border-pink-400 p-3 rounded-r-lg">
                  "{icebreaker}"
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
};
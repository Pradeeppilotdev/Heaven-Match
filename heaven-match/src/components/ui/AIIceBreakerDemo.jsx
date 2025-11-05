//AI Icebreaker demo module for feature page
import React, { useState } from 'react';
import { Wand2, Sparkles, Loader2 } from 'lucide-react';
import Card from './Card'; 
import Button from './Button';

export const AIIcebreakerDemo = () => {
  const [selectedTopic, setSelectedTopic] = useState('Travel');
  const [icebreakers, setIcebreakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const topics = ['Travel', 'Food', 'Movies', 'Music', 'Hobbies'];

  const generateIcebreakers = async () => {
    setLoading(true);
    setError(null);
    setIcebreakers([]); 

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    if (!apiKey || apiKey === "REACT_APP_GEMINI_API_KEy") {
      setError("API key is not configured.");
      setLoading(false);
      return;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
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
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const jsonText = result.candidates[0].content.parts[0].text;
      const parsedIcebreakers = JSON.parse(jsonText);
      setIcebreakers(parsedIcebreakers);

    } catch (err) {
      console.error("Failed to generate icebreakers:", err);
      setError("Sorry, the AI is a bit shy right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
          
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
        </div>

        <div className="pt-4 text-left space-y-3 min-h-[100px]">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
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
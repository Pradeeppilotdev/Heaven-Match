import React, { useState } from 'react';
import { Brain, Loader2, Sparkles, Heart, BookOpen, Mountain, Coffee } from 'lucide-react';
import Card from './Card'; 
import Button from './Button';

export const DeepCompatibilityDemo = () => {
  const [userProfile, setUserProfile] = useState({
    personality: 'adventurous',
    values: 'family',
    goals: 'career'
  });
  const [compatibility, setCompatibility] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const profiles = {
    personality: [
      { value: 'adventurous', label: 'Adventurous & Spontaneous', icon: Mountain },
      { value: 'homebody', label: 'Homebody & Cozy', icon: Coffee },
      { value: 'intellectual', label: 'Intellectual & Curious', icon: BookOpen },
      { value: 'social', label: 'Social Butterfly', icon: Heart }
    ],
    values: [
      { value: 'family', label: 'Family First' },
      { value: 'career', label: 'Career Driven' },
      { value: 'creativity', label: 'Creative Expression' },
      { value: 'spirituality', label: 'Spiritual Growth' }
    ],
    goals: [
      { value: 'career', label: 'Build a Career' },
      { value: 'travel', label: 'Travel the World' },
      { value: 'settle', label: 'Settle Down Soon' },
      { value: 'growth', label: 'Personal Growth' }
    ]
  };

  const analyzeCompatibility = async () => {
    setLoading(true);
    setError(null);
    setCompatibility(null);

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    if (!apiKey || apiKey === "REACT_APP_GEMINI_API_KEY") {
      setError("API key is not configured.");
      setLoading(false);
      return;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    
    const personalityLabel = profiles.personality.find(p => p.value === userProfile.personality)?.label;
    const valuesLabel = profiles.values.find(v => v.value === userProfile.values)?.label;
    const goalsLabel = profiles.goals.find(g => g.value === userProfile.goals)?.label;

    const prompt = `You are the Deep Compatibility AI for "Heaven Match" dating platform.

User Profile:
- Personality: ${personalityLabel}
- Core Values: ${valuesLabel}
- Life Goals: ${goalsLabel}

Analyze compatibility and provide:
1. A compatibility score (70-99)
2. A brief match type (2-4 words, e.g., "Adventure Partners", "Intellectual Soulmates")
3. Exactly 3 short compatibility insights (each 1 sentence, max 15 words)

Return as JSON with this exact structure:
{
  "score": 85,
  "matchType": "Creative Partners",
  "insights": ["insight1", "insight2", "insight3"]
}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            score: { type: "INTEGER" },
            matchType: { type: "STRING" },
            insights: {
              type: "ARRAY",
              items: { type: "STRING" }
            }
          },
          required: ["score", "matchType", "insights"]
        },
        temperature: 0.7,
        maxOutputTokens: 300,
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
      const parsedCompatibility = JSON.parse(jsonText);
      setCompatibility(parsedCompatibility);

    } catch (err) {
      console.error("Failed to analyze compatibility:", err);
      setError("Sorry, our AI is recalibrating. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-500';
    if (score >= 80) return 'from-blue-500 to-cyan-500';
    return 'from-purple-500 to-pink-500';
  };

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-1 border-pink-400 border-2 shadow-pink-200 shadow-lg" hover={false}>
      <div className="flex flex-col text-center space-y-4">
        <div className="inline-flex justify-center">
          <div className="p-4 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full">
            <Brain className="w-8 h-8 text-pink-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Deep Compatibility AI</h3>
        <p className="text-gray-600">
          Discover matches based on personality, values, and life goals
        </p>
        
        {/* Interactive Profile Selection */}
        <div className="pt-2 space-y-3 text-left">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Personality</label>
            <select
              value={userProfile.personality}
              onChange={(e) => setUserProfile({...userProfile, personality: e.target.value})}
              disabled={loading}
              className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
            >
              {profiles.personality.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Core Values</label>
            <select
              value={userProfile.values}
              onChange={(e) => setUserProfile({...userProfile, values: e.target.value})}
              disabled={loading}
              className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
            >
              {profiles.values.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Life Goals</label>
            <select
              value={userProfile.goals}
              onChange={(e) => setUserProfile({...userProfile, goals: e.target.value})}
              disabled={loading}
              className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
            >
              {profiles.goals.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
          
          <Button
            onClick={analyzeCompatibility}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>{loading ? 'Analyzing...' : 'Find Compatible Matches'}</span>
          </Button>
        </div>

        {/* Results Display */}
        <div className="pt-4 text-left space-y-3 min-h-[160px]">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          {!loading && compatibility && (
            <div className="space-y-4">
              {/* Score Display */}
              <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg">
                <div className={`text-4xl font-bold bg-gradient-to-r ${getScoreColor(compatibility.score)} bg-clip-text text-transparent`}>
                  {compatibility.score}%
                </div>
                <div className="text-sm font-semibold text-pink-600 uppercase tracking-wide">
                  {compatibility.matchType}
                </div>
              </div>

              {/* Insights */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <Brain className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Key Insights:</span>
                </div>
                <ul className="list-none space-y-2">
                  {compatibility.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-gray-800 bg-gradient-to-r from-pink-50 to-rose-50 border-l-4 border-pink-400 p-2.5 rounded-r-lg flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                        {index + 1}
                      </span>
                      <span className="flex-1 pt-0.5">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
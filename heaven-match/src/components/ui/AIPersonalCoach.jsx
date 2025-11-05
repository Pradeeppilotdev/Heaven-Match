import React, { useState } from 'react';
import { MessageCircle, Sparkles, Loader2, Heart, Users, Calendar, TrendingUp } from 'lucide-react';
import Card from './Card'; 
import Button from './Button';

export const AICoachDemo = () => {
  const [selectedQuestion, setSelectedQuestion] = useState('How do I keep the spark alive?');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const questions = [
    { text: 'How do I keep the spark alive?', icon: Heart },
    { text: 'How to handle disagreements?', icon: Users },
    { text: 'Planning our first date - tips?', icon: Calendar },
    { text: 'Taking relationship to next level', icon: TrendingUp },
  ];

  const getAdvice = async () => {
    setLoading(true);
    setError(null);
    setAdvice('');

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    if (!apiKey || apiKey === "REACT_APP_GEMINI_API_KEY") {
      setError("API key is not configured.");
      setLoading(false);
      return;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    
    const prompt = `You are an expert AI Relationship Coach for "Heaven Match", a dating platform.

User's question: "${selectedQuestion}"

Provide warm, empathetic advice in exactly 3 short, actionable tips (each tip should be 1 sentence, max 20 words).
Format as a JSON array of 3 strings. Be encouraging, positive, and specific.
Make it conversational and friendly, like advice from a wise friend.`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        temperature: 0.8,
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
      const parsedAdvice = JSON.parse(jsonText);
      setAdvice(parsedAdvice);

    } catch (err) {
      console.error("Failed to get advice:", err);
      setError("Sorry, the AI Coach is taking a break. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedIcon = questions.find(q => q.text === selectedQuestion)?.icon || MessageCircle;
  const SelectedIcon = selectedIcon;

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-1 border-rose-400 border-2 shadow-rose-200 shadow-lg" hover={false}>
      <div className="flex flex-col text-center space-y-4">
        <div className="inline-flex justify-center">
          <div className="p-4 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full">
            <MessageCircle className="w-8 h-8 text-rose-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900">AI Relationship Coach</h3>
        <p className="text-gray-600">
          Get expert AI-powered relationship advice instantly to strengthen your bond!
        </p>
        
        {/* The Interactive Part */}
        <div className="pt-2 space-y-4">
          <select
            value={selectedQuestion}
            onChange={(e) => setSelectedQuestion(e.target.value)}
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
          >
            {questions.map(q => (
              <option key={q.text} value={q.text}>{q.text}</option>
            ))}
          </select>
          
          <Button
            onClick={getAdvice}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>{loading ? 'Thinking...' : 'Get AI Advice'}</span>
          </Button>
        </div>

        <div className="pt-4 text-left space-y-3 min-h-[140px]">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          {!loading && advice.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-center mb-2">
                <SelectedIcon className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">AI Coach Says:</span>
              </div>
              <ul className="list-none space-y-3">
                {advice.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-800 bg-gradient-to-r from-pink-50 to-rose-50 border-l-4 border-rose-400 p-3 rounded-r-lg flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="flex-1 pt-0.5">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
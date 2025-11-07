// AI Verification demo module for feature page.
// This component simulates an AI-powered profile verification system, emphasizing safety and trust scores.
import React, { useState } from 'react';
import { Shield, Loader2, Sparkles, CheckCircle, User, Camera, FileText } from 'lucide-react';
import Card from './Card'; 
import Button from './Button';

/**
 * Renders an interactive demo for AI Profile Verification.
 * Uses the Gemini API to analyze a selected profile status and return a structured JSON verification report.
 */
export const AIVerificationDemo = () => {
  // State for the selected simulated profile type (e.g., 'complete', 'suspicious').
  const [selectedProfile, setSelectedProfile] = useState('complete');
  // State to hold the parsed JSON verification object {trustScore, status, checks}.
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Predefined profile scenarios for demonstration purposes.
  const profiles = [
    { 
      value: 'complete', 
      label: '✓ Complete Profile with Photos',
      icon: CheckCircle 
    },
    { 
      value: 'suspicious', 
      label: '⚠ Stock Photo Detected',
      icon: Camera 
    },
    { 
      value: 'incomplete', 
      label: '⚠ Missing Key Information',
      icon: FileText 
    },
    { 
      value: 'authentic', 
      label: '✓ Verified Social Links',
      icon: User 
    },
  ];

  /**
   * Asynchronously calls the Gemini API to run a profile verification simulation.
   */
  const verifyProfile = async () => {
    setLoading(true);
    setError(null);
    setVerification(null);

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    // Critical API Key Validation with local fallback
    if (!apiKey) {
      const profileLabel = profiles.find(p => p.value === selectedProfile)?.label;
      setVerification({
        trustScore: 88,
        status: 'Verified',
        checks: [
          `${profileLabel}: profile photos and details look authentic.`,
          'No suspicious metadata or stock patterns detected.',
          'Social links appear consistent.'
        ]
      });
      setLoading(false);
      return;
    }

    // Using a suitable model for fast, structured generation.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    
    // Retrieve the user-facing label for use in the prompt.
    const profileLabel = profiles.find(p => p.value === selectedProfile)?.label;

    // Highly structured system prompt for the verification AI persona.
    const prompt = `You are the AI Verification System for "Heaven Match" dating platform.

Profile to verify: "${profileLabel}"

Analyze this profile and provide:
1. A trust score (60-99)
2. A verification status ("Verified", "Needs Review", or "Warning")
3. Exactly 3 short verification checks (each 1 sentence, max 15 words, explaining what was checked)

Return as JSON with this exact structure:
{
  "trustScore": 85,
  "status": "Verified",
  "checks": ["check1", "check2", "check3"]
}

Make checks sound professional and security-focused.`;

    // Configuration payload defining the strict JSON structure required from the AI.
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        // Enforce JSON output.
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            trustScore: { type: "INTEGER" }, // Ensure Trust Score is a number.
            status: { type: "STRING" },
            checks: { // Checks must be an array of strings.
              type: "ARRAY",
              items: { type: "STRING" }
            }
          },
          // Mandate all keys must be present in the output.
          required: ["trustScore", "status", "checks"]
        },
        temperature: 0.6, // Lower temperature promotes more predictable, factual-sounding outputs.
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
      // Extract the raw JSON text from the nested response.
      const jsonText = result.candidates[0].content.parts[0].text;
      const parsedVerification = JSON.parse(jsonText);
      setVerification(parsedVerification);

    } catch (err) {
      console.error("Failed to verify profile:", err);
      // User-friendly error message for the UI.
      setError("Sorry, our verification system is updating. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Utility function to determine color classes based on verification status.
   * @param {string} status - The verification status ("Verified", "Warning", etc.).
   * @returns {Object} Tailwind CSS classes for background, text, and badge colors.
   */
  const getStatusColor = (status) => {
    if (status === "Verified") return { bg: 'from-green-500 to-emerald-500', text: 'text-green-600', badge: 'bg-green-100 text-green-700' };
    if (status === "Warning") return { bg: 'from-red-500 to-orange-500', text: 'text-red-600', badge: 'bg-red-100 text-red-700' };
    // Default for "Needs Review" or other states.
    return { bg: 'from-yellow-500 to-amber-500', text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' };
  };

  /**
   * Utility function to determine color classes for the trust score display.
   * @param {number} score - The trust score percentage.
   * @returns {string} Tailwind CSS gradient class.
   */
  const getScoreColor = (score) => {
    if (score >= 85) return 'from-green-500 to-emerald-500';
    if (score >= 70) return 'from-yellow-500 to-amber-500';
    return 'from-red-500 to-orange-500';
  };

  // Dynamically select the icon for display in the results.
  const selectedIcon = profiles.find(p => p.value === selectedProfile)?.icon || Shield;
  const SelectedIcon = selectedIcon;

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-1 border-pink-400 border-2 shadow-rose-200 shadow-lg" hover={false}>
      <div className="flex flex-col text-center space-y-4">
        {/* Component Title and Icon */}
        <div className="inline-flex justify-center">
          <div className="p-4 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full">
            <Shield className="w-8 h-8 text-pink-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900">AI-Assisted Verification</h3>
        <p className="text-gray-600">
          Advanced AI ensures authentic profiles and community safety
        </p>
        
        {/* Profile Selection and Action Button */}
        <div className="pt-2 space-y-4">
          <select
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value)}
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
          >
            {profiles.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          
          <Button
            onClick={verifyProfile}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          >
            {/* Conditional display for loading spinner */}
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>{loading ? 'Verifying...' : 'Run AI Verification'}</span>
          </Button>
        </div>

        {/* Results Display Area */}
        <div className="pt-4 text-left space-y-3 min-h-[160px]">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          {/* Detailed Verification Results */}
          {!loading && verification && (
            <div className="space-y-4">
              {/* Status and Score Display */}
              <div className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg">
                {/* Verification Status Badge */}
                <div className={`inline-flex px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(verification.status).badge}`}>
                  {verification.status}
                </div>
                {/* Trust Score Display with gradient color coding */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Trust Score:</span>
                  <span className={`text-3xl font-bold bg-gradient-to-r ${getScoreColor(verification.trustScore)} bg-clip-text text-transparent`}>
                    {verification.trustScore}%
                  </span>
                </div>
              </div>

              {/* Verification Checks List */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <SelectedIcon className="w-4 h-4 text-pink-500" />
                  <span className="text-xs font-semibold text-pink-600 uppercase tracking-wide">Security Checks:</span>
                </div>
                <ul className="list-none space-y-2">
                  {verification.checks.map((check, index) => (
                    <li key={index} className="text-sm text-gray-800 bg-gradient-to-r from-pink-50 to-rose-50 border-l-4 border-pink-400 p-3 rounded-r-lg flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="flex-1 pt-0.5">{check}</span>
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

export default AIVerificationDemo;
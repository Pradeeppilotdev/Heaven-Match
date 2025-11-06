import React, { useState, useRef, useEffect } from "react";
import { getChatbotResponse, processQuestionnaireResponse } from "../services/ai"; 
import { generateRecommendationsFromUserData } from "../services/api";
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'; 

// Clean Send Icon
const SendIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
);

const Chatbot = ({ mode = 'conversation', onQuestionnaireComplete, onEndQuestionnaire }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Initialize messages based on mode
  const getInitialMessage = (m) => {
    if (m === 'questionnaire') {
      return [{ role: 'model', content: 'Hello! I\'m here to help you find your perfect match. I\'ll ask you a few questions to understand your preferences. Let\'s get started!\n\nWhat is your gender? (Male, Female, or Other)' }];
    }
    return [{ role: 'model', content: 'Hello! I am your **Heaven Match AI assistant**. How can I help you find your perfect match today?' }];
  };

  const [messages, setMessages] = useState(() => getInitialMessage(mode));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState({
    gender: null,
    ageRange: null,
    income: null,
    location: null,
    hobbies: null,
    profession: null,
    education: null
  });
  const [recommendations, setRecommendations] = useState(null);
  const messagesEndRef = useRef(null);

  // Reset chatbot state when mode changes and auto-open in questionnaire mode
  useEffect(() => {
    setMessages(getInitialMessage(mode));
    setQuestionnaireData({
      gender: null,
      ageRange: null,
      income: null,
      location: null,
      hobbies: null,
      profession: null,
      education: null
    });
    setRecommendations(null);
    
    // Auto-open chatbot when entering questionnaire mode
    if (mode === 'questionnaire') {
      setIsOpen(true);
    }
  }, [mode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleQuestionnaireAnswer = async (userMessage) => {
    try {
      // Use AI to process the response and determine next question
      const result = await processQuestionnaireResponse(
        userMessage,
        questionnaireData,
        messages
      );

      // Debug logging
      console.log("Questionnaire result:", result);
      console.log("Updated data:", result.updatedData);

      // Update collected data
      setQuestionnaireData(result.updatedData);

      if (result.isComplete) {
        // All information collected, generate recommendations
        setMessages((prev) => [...prev, { 
          role: 'model', 
          content: result.nextMessage 
        }]);
        
        try {
          const recs = await generateRecommendationsFromUserData(result.updatedData);
          setRecommendations(recs);
          
          let recommendationsMessage = '## Your AI-Curated Recommendations\n\n';
          recommendationsMessage += 'Based on your preferences, here are your top matches:\n\n';
          
          recs.slice(0, 5).forEach((profile, idx) => {
            recommendationsMessage += `**${idx + 1}. ${profile.name}, ${profile.age}**\n`;
            recommendationsMessage += `   - ${profile.profession} (${profile.income || 'N/A'})\n`;
            recommendationsMessage += `   - Interests: ${(profile.hobbies || profile.interests || []).slice(0, 5).join(', ')}\n`;
            recommendationsMessage += `   - ${profile.bio_text || profile.bio || 'No bio'}\n\n`;
          });
          
          recommendationsMessage += '\n**Tip:** These recommendations are also displayed on the main page. You can continue chatting to refine your preferences!';
          
          setMessages((prev) => [...prev, { role: 'model', content: recommendationsMessage }]);
          
          // Notify parent component
          if (onQuestionnaireComplete) {
            onQuestionnaireComplete(result.updatedData, recs);
          }
        } catch (error) {
          console.error("Recommendation generation failed:", error);
          setMessages((prev) => [...prev, { 
            role: 'model', 
            content: 'I encountered an error generating recommendations. Please try again or use the mock user profile option.' 
          }]);
        }
      } else {
        // Ask next question
        setMessages((prev) => [...prev, { role: 'model', content: result.nextMessage }]);
      }
    } catch (error) {
      console.error("Questionnaire processing failed:", error);
      setMessages((prev) => [...prev, { 
        role: 'model', 
        content: 'I encountered an error processing your response. Could you please try rephrasing your answer?' 
      }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    
    // Check for end conversation command
    if (userMessage.toLowerCase().includes('end') || userMessage.toLowerCase().includes('stop') || userMessage.toLowerCase().includes('finish')) {
      if (mode === 'questionnaire' && onEndQuestionnaire) {
        onEndQuestionnaire();
      }
      setMessages((prev) => [...prev, { 
        role: 'model', 
        content: 'Conversation ended. You can restart anytime! If you were in questionnaire mode, you can start again by clicking the chatbot button.' 
      }]);
      setInput('');
      return;
    }

    const newUserMessage = { role: 'user', content: userMessage };
    
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Check if we're still in questionnaire mode and need to collect more information
      if (mode === 'questionnaire') {
        // Check if all required fields are collected
        const requiredFields = ['gender', 'ageRange', 'income', 'location', 'hobbies', 'profession', 'education'];
        const allFieldsCollected = requiredFields.every(field => 
          questionnaireData[field] !== null && questionnaireData[field] !== undefined && questionnaireData[field] !== ''
        );

        if (!allFieldsCollected) {
          // Still collecting information
          await handleQuestionnaireAnswer(userMessage);
        } else {
          // All information collected, switch to conversation mode
          const historyForGemini = [...messages, newUserMessage]; 
          const modelResponseText = await getChatbotResponse(historyForGemini, userMessage);
          setMessages((prev) => [...prev, { role: 'model', content: modelResponseText }]);
        }
      } else {
        // Regular conversation mode
        const historyForGemini = [...messages, newUserMessage]; 
        const modelResponseText = await getChatbotResponse(historyForGemini, userMessage);
        setMessages((prev) => [...prev, { role: 'model', content: modelResponseText }]);
      }
    } catch (error) {
      console.error("Chatbot response failed:", error);
      setMessages((prev) => [...prev, { role: 'model', content: 'Oops! The AI connection failed.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const modelColor = 'bg-pink-100 text-gray-800'; // Single theme
  const userColor = 'bg-pink-500 text-white'; // Single theme

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-pink-500 text-white shadow-xl hover:bg-pink-600 transition-all flex items-center justify-center text-2xl transform hover:scale-105"
        aria-label={isOpen ? "Close Chatbot" : "Open Heaven Match AI Chatbot"}
      >
        {isOpen ? <XMarkIcon className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white border border-gray-300 rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300">
          
          <div className="p-3 bg-pink-500 text-white text-lg font-semibold flex justify-between items-center sticky top-0">
            <span>Heaven Match AI</span>
            {mode === 'questionnaire' && (
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-white/20 px-2 py-1 rounded-full">
                  {Object.values(questionnaireData).filter(v => v !== null && v !== '').length}/7
                </span>
                {onEndQuestionnaire && (
                  <button
                    onClick={() => {
                      if (onEndQuestionnaire) onEndQuestionnaire();
                      setMessages((prev) => [...prev, { 
                        role: 'model', 
                        content: 'Questionnaire ended. You can restart anytime!' 
                      }]);
                    }}
                    className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs transition-colors"
                    title="End Questionnaire"
                  >
                    End
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-3 rounded-xl break-words shadow-md whitespace-pre-wrap ${msg.role === 'user' ? userColor + ' rounded-br-none' : modelColor + ' rounded-tl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className={`${modelColor} p-3 rounded-xl rounded-tl-none italic text-sm animate-pulse`}>
                  AI is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white sticky bottom-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'questionnaire' ? "Type your answer..." : "Ask the AI a question..."}
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                disabled={isTyping}
              />
              <button
                type="submit"
                className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors disabled:opacity-50"
                disabled={isTyping || !input.trim()}
                aria-label="Send Message"
              >
                <SendIcon />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
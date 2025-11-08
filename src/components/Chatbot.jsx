// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, SparklesIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { getChatbotResponse, processQuestionnaireResponse } from '../services/ai';
import { checkRateLimit } from '../utils/rateLimiter';

// Floating chat widget used previously on Recommendations page
const Chatbot = ({ mode = 'conversation', onQuestionnaireComplete, onEndQuestionnaire }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    { role: 'model', content: "Hello! I'm your personal Matrimony Matchmaker AI. To start, please tell me your gender and what you're looking for, or choose a suggestion below." }
  ]);
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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (mode === 'questionnaire') setIsOpen(true);
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    // Rate limiting check
    const rateLimitCheck = checkRateLimit('chatbot');
    if (!rateLimitCheck.allowed) {
      setMessages((prev) => [...prev, { 
        role: 'model', 
        content: `Rate limit exceeded. Please wait ${Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000)} seconds before sending another message.` 
      }]);
      return;
    }
    
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      if (mode === 'questionnaire') {
        const required = ['gender', 'ageRange', 'income', 'location', 'hobbies', 'profession', 'education'];
        const complete = required.every((f) => questionnaireData[f]);
        if (!complete) {
          const result = await processQuestionnaireResponse(userMessage, questionnaireData, messages);
          setQuestionnaireData(result.updatedData);
          if (result.isComplete) {
            setMessages((prev) => [...prev, { role: 'model', content: result.nextMessage }]);
            // Generate recommendations from the completed questionnaire data
            if (onQuestionnaireComplete) {
              // Import and call the function to generate recommendations
              const { generateRecommendationsFromUserData } = await import('../services/api');
              try {
                const recommendations = await generateRecommendationsFromUserData(result.updatedData);
                onQuestionnaireComplete(result.updatedData, recommendations);
              } catch (error) {
                console.error('Error generating recommendations:', error);
                setMessages((prev) => [...prev, { 
                  role: 'model', 
                  content: 'I encountered an error while finding your matches. Please try refreshing the page.' 
                }]);
                onQuestionnaireComplete(result.updatedData, []);
              }
            }
          } else {
            setMessages((prev) => [...prev, { role: 'model', content: result.nextMessage }]);
          }
          setIsTyping(false);
          return;
        }
      }

      const history = [...messages, { role: 'user', content: userMessage }];
      const modelResponseText = await getChatbotResponse(history, userMessage);
      setMessages((prev) => [...prev, { role: 'model', content: modelResponseText }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'model', content: "Oops! The AI connection failed." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Calculate progress for questionnaire mode
  const getProgress = () => {
    const required = ['gender', 'ageRange', 'income', 'location', 'hobbies', 'profession', 'education'];
    const filled = required.filter(f => questionnaireData[f]).length;
    return Math.round((filled / required.length) * 100);
  };

  return (
    <div className="fixed bottom-4 z-50" style={{ right: '20px' }}>
      {/* Floating Action Button - smaller and more subtle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg hover:shadow-pink-500/40 hover:from-pink-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center transform hover:scale-105 active:scale-95 relative group"
        aria-label={isOpen ? 'Close Chatbot' : 'Open Heaven Match AI Chatbot'}
      >
        {isOpen ? (
          <XMarkIcon className="w-5 h-5 relative z-10" />
        ) : (
          <SparklesIcon className="w-5 h-5 relative z-10" />
        )}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[360px] h-[520px] max-h-[calc(100vh-80px)] bg-white border border-pink-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-sm animate-fade-in">
          {/* Enhanced Header with gradient and progress */}
          <div className="relative px-4 py-3 bg-gradient-to-r from-pink-500 via-pink-600 to-pink-500 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <SparklesIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Heaven Match AI</h3>
                <p className="text-xs text-pink-100">Your personal matchmaker</p>
              </div>
            </div>
            {mode === 'questionnaire' && (
              <div className="flex items-center gap-2">
                <div className="text-xs text-pink-100 bg-white/20 px-2 py-0.5 rounded-full">
                  {getProgress()}%
                </div>
                <button
                  onClick={() => onEndQuestionnaire && onEndQuestionnaire()}
                  className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-medium transition-colors backdrop-blur-sm border border-white/30"
                >
                  End
                </button>
              </div>
            )}
          </div>

          {/* Progress bar for questionnaire */}
          {mode === 'questionnaire' && (
            <div className="h-1 bg-pink-100">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-pink-600 transition-all duration-500"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
          )}

          {/* Messages area with better styling */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gradient-to-b from-white to-pink-50/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {m.role === 'model' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center flex-shrink-0 mr-2 self-end mb-0.5">
                    <SparklesIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-xl break-words whitespace-pre-wrap shadow-md ${
                  m.role === 'user' 
                    ? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-br-sm' 
                    : 'bg-white text-gray-800 rounded-tl-sm border border-pink-100'
                }`}>
                  <p className="text-xs leading-relaxed">{m.content}</p>
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0 ml-2 self-end mb-0.5">
                    <span className="text-white text-[10px] font-bold">You</span>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center flex-shrink-0 mr-2 self-end mb-0.5">
                  <SparklesIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white text-gray-800 p-3 rounded-xl rounded-tl-sm border border-pink-100 shadow-md">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input area */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-pink-100">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'questionnaire' ? 'Type your answer...' : 'Ask me anything...'}
                  className="w-full px-3 py-2 pr-10 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:bg-white transition-all text-xs placeholder:text-gray-400"
                  disabled={isTyping}
                />
              </div>
              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                disabled={isTyping || !input.trim()}
                aria-label="Send Message"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
            {mode === 'questionnaire' && (
              <p className="text-[10px] text-gray-500 mt-1.5 text-center">
                Answer the questions to get personalized matches
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;



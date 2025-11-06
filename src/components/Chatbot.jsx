// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getChatbotResponse, processQuestionnaireResponse } from '../services/ai';

// Floating chat widget used previously on Recommendations page
const Chatbot = ({ mode = 'conversation', onQuestionnaireComplete, onEndQuestionnaire }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    { role: 'model', content: "Hello! I'm your personal Matrimony Matchmaker AI. **To start, please tell me your gender** and what you're looking for, or choose a suggestion below." }
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
            if (onQuestionnaireComplete) onQuestionnaireComplete(result.updatedData, []);
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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-pink-500 text-white shadow-xl hover:bg-pink-600 transition-all flex items-center justify-center text-2xl transform hover:scale-105"
        aria-label={isOpen ? 'Close Chatbot' : 'Open Heaven Match AI Chatbot'}
      >
        {isOpen ? <XMarkIcon className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[360px] h-[520px] bg-white border border-pink-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-sm font-semibold flex justify-between items-center">
            <span>Heaven Match AI</span>
            {mode === 'questionnaire' && (
              <button
                onClick={() => onEndQuestionnaire && onEndQuestionnaire()}
                className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-xs"
              >
                End
              </button>
            )}
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl break-words shadow-md whitespace-pre-wrap ${m.role === 'user' ? 'bg-pink-500 text-white rounded-br-none' : 'bg-pink-50 text-gray-800 rounded-tl-none'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-pink-50 text-gray-800 p-3 rounded-xl rounded-tl-none italic text-sm animate-pulse">AI is thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'questionnaire' ? 'Type your answer...' : 'Ask the AI a question...'}
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                disabled={isTyping}
              />
              <button
                type="submit"
                className="bg-pink-500 text-white px-3 py-2 rounded-full hover:bg-pink-600 transition-colors disabled:opacity-50"
                disabled={isTyping || !input.trim()}
                aria-label="Send Message"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;



// src/components/Chat/Chatbot.jsx
import React, { useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatSuggestions from './ChatSuggestions';
import Spinner from '../UI/Spinner';
import '../../styles/Chat.css'; // Import CSS

// function to integrate all the other pages
const Chatbot = () => {
    const { messages, isLoading, error, sendMessage, clearChat, suggestions } = useChat();
    const messagesEndRef = useRef(null);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSuggestionSelect = (suggestion) => {
        sendMessage(suggestion);
    };

    return (
        <div className="bg-gradient-to-br from-pink-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-5xl bg-white/90 backdrop-blur rounded-2xl shadow-2xl border border-pink-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-6.716-3.563-9.193-8.06C.307 9.4 2.02 5.5 5.64 5.5c2.02 0 3.27 1.37 3.86 2.28.59-.91 1.84-2.28 3.86-2.28 3.62 0 5.333 3.9 2.833 7.44C18.716 17.437 12 21 12 21z"/></svg>
                <h2 className="font-semibold">Heaven Match AI</h2>
              </div>
              <button onClick={clearChat} disabled={isLoading} className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors">Start New Chat</button>
            </div>

            <div className="grid md:grid-cols-3 gap-0">
              <div className="md:col-span-2 p-6">
                <div className="chat-messages-container">
                {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                ))}
                
                {isLoading && (
                    <div className="loading-indicator">
                        <Spinner /> <span>AI is finding your match...</span>
                    </div>
                )}

                {error && <div className="error-message">🛑 **{error}**</div>}

                  <div ref={messagesEndRef} />
                </div>

                {!isLoading && messages.length < 5 && (
                  <div className="mt-4">
                    <ChatSuggestions suggestions={suggestions} onSelect={handleSuggestionSelect} />
                  </div>
                )}

                <div className="mt-4">
                  <ChatInput onSend={sendMessage} disabled={isLoading} />
                </div>
              </div>

              <div className="hidden md:block p-6 border-l border-pink-100 bg-pink-50/40">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-pink-700">Tips</h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>Be specific about your preferences.</li>
                    <li>Share your hobbies to improve matches.</li>
                    <li>Use the suggestions for a quick start.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
    );
};

export default Chatbot;
// src/components/Chat/Chatbot.jsx
import React, { useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatSuggestions from './ChatSuggestions';
import Spinner from '../ui/Spinner';
import '../../styles/Chat.css'; // Import CSS

// function to integrate all the other pages
const Chatbot = () => {
    const { messages, isLoading, error, sendMessage, clearChat, userGender, suggestions } = useChat();
    const messagesEndRef = useRef(null);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSuggestionSelect = (suggestion) => {
        sendMessage(suggestion);
    };

    return (
        <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="chatbot-page">
            <div className="chatbot-header">
                <h2>Heaven Match AI</h2>
                <button onClick={clearChat} disabled={isLoading}>
                    Start New Chat
                </button>
            </div>

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
            
            {/* Show suggestions only when not loading */}
            {!isLoading && messages.length < 5 && ( 
                <ChatSuggestions 
                    suggestions={suggestions} 
                    onSelect={handleSuggestionSelect} 
                />
            )}

            <ChatInput 
                onSend={sendMessage} 
                disabled={isLoading} 
            />
        </div>
        </div>
    );
};

export default Chatbot;
// src/components/Chat/ChatSuggestions.jsx
import React from 'react';
import '../../styles/Chat.css'; // Import CSS

// function to provide the suggestion
const ChatSuggestions = ({ suggestions, onSelect }) => {
    return (
        <div className="chat-suggestions-wrapper">
            <p className="suggestion-prompt">Suggested questions:</p>
            <div className="chat-suggestions-container">
                {suggestions.map((suggestion, index) => (
                    <button 
                        key={index} 
                        onClick={() => onSelect(suggestion)} 
                        className="suggestion-chip"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ChatSuggestions;
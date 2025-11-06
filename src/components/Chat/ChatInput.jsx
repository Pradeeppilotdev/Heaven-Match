// src/components/Chat/ChatInput.jsx
import React, { useState } from 'react';
import '../../styles/Chat.css'; // Import CSS

// function to provide chat inputs
const ChatInput = ({ onSend, disabled }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
            onSend(input);
            setInput('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="chat-input-container">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={disabled ? "Waiting for response..." : "Ask for your ideal match..."}
                disabled={disabled}
            />
            <button type="submit" disabled={disabled}>
                Send
            </button>
        </form>
    );
};

export default ChatInput;
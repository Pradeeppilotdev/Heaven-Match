// src/components/Chat/ChatMessage.jsx
import React from 'react';
// Import CSS to ensure styles load
import '../../styles/Chat.css';

// messaging function
const ChatMessage = ({ message }) => {
    const isUser = message.role === 'user';
    
    // Simple logic to parse the JSON block inside the AI response for better styling
    const renderContent = (content) => {
        const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        
        if (jsonMatch) {
            // This is a match suggestion block
            try {
                const data = JSON.parse(jsonMatch[1]);
                if (data.matches && Array.isArray(data.matches)) {
                    return (
                        <>
                            <p>***Matchmaker Report:***</p>
                            {data.matches.map((match, index) => (
                                <div key={index} className="match-profile-card">
                                    <h4>{match.Name} ({match.Age}) - {match.CompatibilityScore}</h4>
                                    <p>Occupation: **{match.Occupation}**</p>
                                    <p>Location: **{match.City}**</p>
                                    <p className="match-summary">Summary: {match.Summary}</p>
                                </div>
                            ))}
                        </>
                    );
                }
            } catch (e) {
                console.error("Failed to parse JSON match data:", e);
                // Fallback to text if parsing fails
            }
        }
        
        // Default text rendering
        return content.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
        ));
    };

    return (
        <div className={`chat-message ${isUser ? 'user' : 'bot'}`}>
            <div className="message-role">
                {isUser ? 'You' : 'Matchmaker AI'}
            </div>
            <div className="message-content">
                {renderContent(message.content)}
            </div>
        </div>
    );
};

export default ChatMessage;
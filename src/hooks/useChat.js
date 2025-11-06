// src/hooks/useChat.js
import { useState, useCallback } from 'react';
import { getChatCompletion } from '../api/openrouterapi';
//setting initial welcome text
const initialSystemMessage = {
    role: 'assistant',
    content: "Hello! I'm your personal Matrimony Matchmaker AI. **To start, please tell me your gender** and what you're looking for, or choose a suggestion below."
};
// giving suggestions
const defaultSuggestions = [
    "I'm a male looking for a partner.",
    "I am female, seeking someone with strong family values.",
    "What kind of career is common among matches?"
];
// main logic to provide matching logic
export const useChat = () => {
    const [messages, setMessages] = useState([initialSystemMessage]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userGender, setUserGender] = useState(null); 
    const [suggestions, setSuggestions] = useState(defaultSuggestions);

    // Simple deduction function to identify user's gender
    const getGenderFromMessage = (message) => {
        const lowerCaseMsg = message.toLowerCase();
        if (lowerCaseMsg.includes('male') || lowerCaseMsg.includes('man') || lowerCaseMsg.includes('boy') || lowerCaseMsg.includes('m.')) {
            return 'male';
        }
        if (lowerCaseMsg.includes('female') || lowerCaseMsg.includes('woman') || lowerCaseMsg.includes('girl') || lowerCaseMsg.includes('f.')) {
            return 'female';
        }
        return null;
    };

    const sendMessage = useCallback(async (userInput) => {
        if (!userInput.trim()) return;

        const newUserMessage = { role: 'user', content: userInput };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        setIsLoading(true);
        setError(null);

        // 1. Attempt to determine gender if not already set
        if (!userGender) {
            const determinedGender = getGenderFromMessage(userInput);
            if (determinedGender) {
                setUserGender(determinedGender);
                // Adjust suggestions based on assumed gender (optional logic)
                setSuggestions([
                    `What age range should my ${determinedGender === 'male' ? 'female' : 'male'} match be?`,
                    "Tell me about a match with a similar career to mine."
                ]);
            }
        }
        
        try {
            // 2. Call the OpenRouter API
            const botResponseContent = await getChatCompletion(updatedMessages);

            // 3. Add AI response to state
            const newBotMessage = { role: 'assistant', content: botResponseContent };
            setMessages(prevMessages => [...prevMessages, newBotMessage]);

        } catch (err) {
            // Display the specific error message from the API logic
            setError(err.message); 
            setMessages(prevMessages => [...prevMessages, { 
                role: 'assistant', 
                content: `Error: ${err.message}. Please check your key/credits or retry.` 
            }]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, userGender]);

    const clearChat = () => {
        setMessages([initialSystemMessage]);
        setUserGender(null);
        setSuggestions(defaultSuggestions);
        setError(null);
    };

    return { messages, isLoading, error, sendMessage, clearChat, userGender, suggestions };
};
/**
 * LiveChatWidget Component
 * Purpose: AI-powered live chat widget that provides customer support with sentiment analysis, intent detection, and smart routing
 * Features: AI chat, intent detection, sentiment analysis, user info extraction, ticket creation, profile suggestions, FAQ search
 * @param {boolean} isOpen - Controls whether the chat widget is visible
 * @param {Function} onToggle - Callback function to toggle chat widget visibility
 * @param {Function} onFormFill - Optional callback to fill contact form with extracted user info
 */
import React, { useState, useRef, useEffect } from 'react';
import './LiveChatWidget.css';

const LiveChatWidget = ({ isOpen, onToggle, onFormFill }) => {
  const [messages, setMessages] = useState([
    { 
      text: 'Hello! Welcome to HeavenMatch Support. I\'m your AI assistant. How can I help you today?', 
      sender: 'bot', 
      time: new Date().toLocaleTimeString() 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [detectedIntent, setDetectedIntent] = useState(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState({ name: '', email: '', phone: '', subject: '' });
  const [suggestedRoute, setSuggestedRoute] = useState(null);
  const [showRouteSuggestion, setShowRouteSuggestion] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const [detectedLanguage, setDetectedLanguage] = useState('English');
  const [quickReplies, setQuickReplies] = useState([]);
  const [showEscalation, setShowEscalation] = useState(false);
  const [showProfileQuestion, setShowProfileQuestion] = useState(false);
  const [waitingForProfileGender, setWaitingForProfileGender] = useState(false);
  const messagesEndRef = useRef(null);
  const isProcessingRef = useRef(false);
  const lastProcessedMessageRef = useRef(null);
  const responseAddedRef = useRef(false);
  const messagesRef = useRef(messages);
  
  // Get model from environment variable (token is handled by backend)
  const HF_MODEL = process.env.REACT_APP_HF_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct';

  /**
   * getBackendURL - Gets the correct backend URL for API calls
   * Purpose: Automatically detects the correct backend URL whether accessed from localhost or network (mobile)
   * Handles both development and production environments
   * @returns {string} The backend API URL
   */
  const getBackendURL = () => {
    // If environment variable is set, use it (highest priority)
    if (process.env.REACT_APP_PROXY_URL) {
      return process.env.REACT_APP_PROXY_URL;
    }
    
    // In production, try to use same origin first (backend should be on same domain)
    if (process.env.NODE_ENV === 'production') {
      // If backend is on same domain, use same origin
      const origin = window.location.origin;
      // Remove port if exists, then add backend port
      const baseUrl = origin.includes(':') ? origin.split(':').slice(0, -1).join(':') : origin;
      return `${baseUrl}:3001`;
    }
    
    // In development, detect if accessing from network IP or localhost
    const hostname = window.location.hostname;
    
    // If accessing from localhost, use localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    
    // If accessing from network IP (like 192.168.x.x or 10.x.x.x), use that IP
    // This allows mobile devices on same network to connect
    if (hostname.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/)) {
      return `http://${hostname}:3001`;
    }
    
    // Fallback to localhost
    return 'http://localhost:3001';
  };

  // Debug: Check backend connection (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const PROXY_URL = getBackendURL();
      fetch(`${PROXY_URL}/api/health`)
        .then(res => res.json())
        .then(data => {
          console.log('✅ Backend proxy server is running');
        })
        .catch(err => {
          console.warn('⚠️ Backend proxy server not found!');
          console.warn('Please start the backend server: npm run server');
          console.warn('Or run both together: npm run dev');
        });
    }
  }, []);

  /**
   * scrollToBottom - Scrolls chat messages to the bottom
   * Purpose: Ensures the latest message is visible when new messages are added
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Keep messagesRef in sync with messages state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  /**
   * buildPromptFromHistory - Builds AI prompt with conversation history
   * Purpose: Creates a formatted prompt including system instructions and conversation context for AI
   * @param {string} userMessage - The current user message
   * @param {Array} currentMessages - Array of previous conversation messages
   * @returns {string} Formatted prompt string for AI processing
   */
  const buildPromptFromHistory = (userMessage, currentMessages) => {
    const systemInstruction = `You are a helpful customer support assistant for HeavenMatch matrimony website.

CRITICAL RULES:
- Keep responses SHORT (2-3 sentences, under 50 words)
- Be direct and concise - no repetition
- For greetings like "hi", respond briefly: "Hello! How can I help you today?"
- Don't explain what you can do unless asked
- Focus on answering the question directly

FAQs (brief answers):
1) Password reset? → Profile > Security > Reset Password
2) Pricing? → Visit Billing page
3) Cancel? → Billing > Manage > Cancel
4) Report abuse? → Safety Hotline 1800-999-8888
5) Profile visibility? → Profile > Privacy > Visibility
6) Delete account? → Profile > Account > Delete
7) Refunds? → Email globalsupport@company.com
8) Verification? → Profile > Verification`;

    const historyLines = [];
    for (let i = 0; i < currentMessages.length; i++) {
        const msg = currentMessages[i];
      if (msg.sender === 'system') continue;
      const role = msg.sender === 'user' ? 'User' : 'Assistant';
      historyLines.push(`${role}: ${msg.text}`);
    }
    historyLines.push(`User: ${userMessage}`);

    return `${systemInstruction}\nConversation so far:\n${historyLines.join('\n')}\n\nAssistant:`;
  };

  /**
   * callHuggingFace - Makes API call to backend AI service
   * Purpose: Sends user prompt to backend proxy which routes to configured AI provider
   * Handles timeout, errors, and network issues
   * @param {string} prompt - The formatted prompt to send to AI
   * @returns {Promise<string>} AI-generated response text
   * @throws {Error} Various error types (TIMEOUT, MODEL_LOADING, NETWORK_ERROR, etc.)
   */
  const callHuggingFace = async (prompt) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    
    // Use backend proxy to avoid CORS issues - auto-detect correct URL
    const PROXY_URL = getBackendURL();
    
    try {
      const res = await fetch(`${PROXY_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          model: HF_MODEL
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        const errorType = errorData.error || 'API_ERROR';
        const errorMsg = errorData.message || 'An error occurred';
        
        if (errorType === 'MODEL_LOADING') {
          throw new Error(`MODEL_LOADING: ${errorMsg}`);
        }
        throw new Error(`${errorType}: ${errorMsg}`);
      }

      const data = await res.json();
      
      if (!data.response || !data.response.trim()) {
        throw new Error('Empty response from model');
      }

      return data.response;
    } catch (e) {
      if (e.name === 'AbortError') {
        throw new Error('TIMEOUT: Request took too long. Please try again.');
      }
      // Re-throw with more context if it's already our formatted error
      if (e.message && (e.message.startsWith('MODEL_LOADING') || 
                        e.message.startsWith('RATE_LIMIT') || 
                        e.message.startsWith('AUTH_ERROR') ||
                        e.message.startsWith('API_ERROR') ||
                        e.message.startsWith('NETWORK_ERROR') ||
                        e.message.startsWith('TIMEOUT'))) {
        throw e;
      }
      // Handle network errors
      if (e.message && (e.message.includes('Failed to fetch') || 
                        e.message.includes('NetworkError') ||
                        e.message.includes('Network request failed'))) {
        throw new Error('NETWORK_ERROR: Unable to connect to backend server. Please make sure the backend is running on port 3001.');
      }
      throw e;
    }
  };

  /**
   * getBotResponse - Gets AI response for user message
   * Purpose: Processes user message, builds prompt, calls AI, and returns formatted response
   * Handles various error scenarios with user-friendly error messages
   * @param {string} userMessage - The user's message
   * @param {Array} currentMessages - Current conversation history
   * @returns {Promise<string>} AI-generated response or error message
   */
  const getBotResponse = async (userMessage, currentMessages) => {
    try {
      const prompt = buildPromptFromHistory(userMessage, currentMessages);

      try {
        const responseText = await callHuggingFace(prompt);
        const cleanedText = responseText?.trim() || '';
        if (!cleanedText) throw new Error('Empty response from AI');
        return cleanedText;
      } catch (apiError) {
        console.error('HF API call error:', apiError);
        throw new Error(apiError.message || 'API call failed');
      }
    } catch (error) {
      console.error('AI API Error:', error);
      const errorMsg = (error.message || '').toUpperCase();
      const errorString = error.toString().toLowerCase();

      // Backend connection errors
      if (errorMsg.includes('NETWORK_ERROR') && errorMsg.includes('BACKEND')) {
        return "The backend server is not running. Please start it with 'npm run server' or use 'npm run dev' to run both frontend and backend together. For immediate assistance, contact us at globalsupport@company.com or call 1800-123-4567.";
      }

      // Configuration/Auth errors
      if (errorMsg.includes('API TOKEN') || errorMsg.includes('NOT CONFIGURED') || errorMsg.includes('AUTH_ERROR')) {
        return "I apologize, but there's a configuration issue with my AI system. Please contact our support team directly at globalsupport@company.com or call 1800-123-4567 for immediate assistance.";
      }
      
      // Model loading (503) - common with Hugging Face
      if (errorMsg.includes('MODEL_LOADING')) {
        const timeMatch = errorMsg.match(/(\d+)/);
        const waitTime = timeMatch ? timeMatch[1] : '10-20';
        return `The AI model is currently loading. Please wait ${waitTime} seconds and try again. For immediate assistance, please contact us at globalsupport@company.com or call 1800-123-4567.`;
      }

      // Rate limiting (429)
      if (errorMsg.includes('RATE_LIMIT') || errorMsg.includes('429') || errorString.includes('quota') || errorString.includes('rate limit')) {
        return "I'm currently experiencing high demand. Please wait a moment and try again, or contact our support team at globalsupport@company.com or call 1800-123-4567.";
      }
      
      // Network/connection errors
      if (errorMsg.includes('NETWORK_ERROR') || errorMsg.includes('TIMEOUT') || 
          errorString.includes('network') || errorString.includes('timeout') || 
          errorString.includes('fetch failed') || errorString.includes('failed to fetch')) {
        return "I'm having trouble connecting right now. Please check your internet connection and try again. For immediate help, contact us at globalsupport@company.com or call 1800-123-4567.";
      }
      
      // API errors (500, 502, etc.)
      if (errorMsg.includes('API_ERROR') || errorString.includes('500') || errorString.includes('502') || errorString.includes('503')) {
        return "I'm experiencing technical difficulties. Please try again in a moment, or contact our support team at globalsupport@company.com or call 1800-123-4567 for immediate assistance.";
      }
      
      // Default fallback
      return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or contact our support team at globalsupport@company.com or call 1800-123-4567 for immediate assistance.";
    }
  };

  /**
   * detectIntent - Detects user intent from message
   * Purpose: Categorizes user messages into intent types (billing, technical, safety, etc.) for smart routing
   * @param {string} message - The user message to analyze
   * @returns {Promise<string>} Detected intent category (billing, technical, safety, account, profile_match, general)
   */
  const detectIntent = async (message) => {
    try {
      const PROXY_URL = getBackendURL();
      const response = await fetch(`${PROXY_URL}/api/detect-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.intent || 'general';
      }
    } catch (error) {
      console.error('Intent detection error:', error);
    }
    return 'general';
  };

  /**
   * extractUserInfo - Extracts user contact information from conversation
   * Purpose: Automatically finds and extracts name, email, phone, and subject from chat conversation
   * Helps pre-fill contact forms and create tickets without manual data entry
   * @param {Array} conversation - Array of conversation messages
   * @returns {Promise<Object>} Object with extracted info (name, email, phone, subject)
   */
  const extractUserInfo = async (conversation) => {
    try {
      const PROXY_URL = getBackendURL();
      const response = await fetch(`${PROXY_URL}/api/extract-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation })
      });
      
      if (response.ok) {
        const data = await response.json();
        setExtractedInfo(data);
        return data;
      }
    } catch (error) {
      console.error('Info extraction error:', error);
    }
    return { name: '', email: '', phone: '', subject: '' };
  };

  /**
   * getSmartRoute - Gets recommended support channel based on intent
   * Purpose: Suggests the best support channel (phone, email, ticket, chat) for the user's issue
   * @param {string} intent - The detected intent category
   * @param {string} message - The user's message
   * @returns {Promise<Object|null>} Routing recommendation with channel, contact info, and reasoning
   */
  const getSmartRoute = async (intent, message) => {
    try {
      const PROXY_URL = getBackendURL();
      const response = await fetch(`${PROXY_URL}/api/smart-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, message })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestedRoute(data.route);
        return data;
      }
    } catch (error) {
      console.error('Smart routing error:', error);
    }
    return null;
  };

  /**
   * analyzeSentiment - Analyzes emotional tone and sentiment of user message
   * Purpose: Detects user's emotional state (angry, frustrated, happy, etc.) to customize responses
   * @param {string} message - The user message to analyze
   * @param {Array} conversation - Optional conversation history for context
   * @returns {Promise<Object>} Sentiment analysis result (sentiment, emotion, urgency, tone)
   */
  const analyzeSentiment = async (message, conversation) => {
    try {
      const PROXY_URL = getBackendURL();
      const response = await fetch(`${PROXY_URL}/api/analyze-sentiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversation: conversation || [] })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          setSentiment(data);
          return data;
        }
      }
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      // Return default sentiment on error
      return { sentiment: 'neutral', emotion: 'calm', urgency: 'medium', tone: 'neutral' };
    }
    return { sentiment: 'neutral', emotion: 'calm', urgency: 'medium', tone: 'neutral' };
  };

  /**
   * detectLanguage - Detects the language of user message
   * Purpose: Identifies if user is communicating in a language other than English for multilingual support
   * Updates the detected language state for ALL languages (including English) to properly reset when user switches languages
   * @param {string} message - The message to analyze
   * @returns {Promise<Object>} Language detection result (language name, detected boolean)
   */
  const detectLanguage = async (message) => {
    try {
      if (!message || typeof message !== 'string') {
        setDetectedLanguage('English');
        return { language: 'English', detected: false };
      }
      
      const PROXY_URL = getBackendURL();
      const response = await fetch(`${PROXY_URL}/api/detect-language`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Always update the detected language state, even if it's English
        // This ensures the UI properly resets when user switches back to English
        if (data && data.language) {
          // Normalize language name for consistent comparison (capitalize first letter)
          const normalizedLang = data.language.charAt(0).toUpperCase() + data.language.slice(1).toLowerCase();
          setDetectedLanguage(normalizedLang);
        } else {
          setDetectedLanguage('English');
        }
        return data || { language: 'English', detected: false };
      }
    } catch (error) {
      console.error('Language detection error:', error);
      // Reset to English on error
      setDetectedLanguage('English');
    }
    return { language: 'English', detected: false };
  };

  /**
   * getQuickReplies - Gets AI-generated quick reply suggestions
   * Purpose: Provides context-aware quick reply options to speed up user responses
   * @param {string} message - The current user message
   * @param {Array} conversation - Optional conversation history for context
   * @returns {Promise<Object>} Object with array of quick reply suggestions (max 3)
   */
  const getQuickReplies = async (message, conversation) => {
    try {
      const PROXY_URL = getBackendURL();
      const response = await fetch(`${PROXY_URL}/api/quick-replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversation: conversation || [] })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.replies && Array.isArray(data.replies) && data.replies.length > 0) {
          setQuickReplies(data.replies.slice(0, 3)); // Limit to 3 replies
        } else {
          setQuickReplies([]);
        }
        return data || { replies: [] };
      }
    } catch (error) {
      console.error('Quick replies error:', error);
      setQuickReplies([]);
    }
    return { replies: [] };
  };

  /**
   * checkEscalation - Determines if issue should be escalated to human agent
   * Purpose: Evaluates if user needs human support based on complexity, frustration, and issue type
   * @param {string} message - The user's current message
   * @param {Array} conversation - Conversation history
   * @param {string} sentiment - Detected sentiment
   * @param {string} intent - Detected intent category
   * @returns {Promise<Object>} Escalation decision (escalate boolean, reason)
   */
  const checkEscalation = async (message, conversation, sentiment, intent) => {
    try {
      const PROXY_URL = getBackendURL();
      const response = await fetch(`${PROXY_URL}/api/should-escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          conversation: conversation || [], 
          sentiment: sentiment || 'neutral', 
          intent: intent || 'general' 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.escalate === true) {
          setShowEscalation(true);
        } else {
          setShowEscalation(false);
        }
        return data || { escalate: false, reason: 'Default' };
      }
    } catch (error) {
      console.error('Escalation check error:', error);
      setShowEscalation(false);
    }
    return { escalate: false, reason: 'Error checking escalation' };
  };

  /**
   * summarizeConversation - Creates summary of conversation
   * Purpose: Generates a concise summary of the entire conversation for ticket creation or agent handoff
   * @param {Array} conversation - Array of conversation messages
   * @returns {Promise<string|null>} 2-3 sentence summary of the conversation
   */
  const summarizeConversation = async (conversation) => {
    try {
      const PROXY_URL = getBackendURL();
      const response = await fetch(`${PROXY_URL}/api/summarize-conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.summary;
      }
    } catch (error) {
      console.error('Summary error:', error);
    }
    return null;
  };

  /**
   * getProfileSuggestions - Returns AI-generated profile suggestions based on gender preference
   * Purpose: AI intelligently generates diverse and realistic profile suggestions for matrimony/matchmaking service
   * @param {string} gender - Gender preference ('male' or 'female')
   * @returns {Promise<string>} Formatted string with AI-generated profile suggestions
   */
  const getProfileSuggestions = async (gender) => {
    try {
      const PROXY_URL = getBackendURL();
      const response = await fetch(`${PROXY_URL}/api/generate-profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.suggestions || 'I can help you find profiles! Please visit our "Browse Profiles" section.';
      }
    } catch (error) {
      console.error('Profile generation error:', error);
    }
    
    // Fallback: AI generates inline if API fails
    return `I can help you find ${gender} profiles! Please visit our "Browse Profiles" section to explore matches. Would you like me to help you with anything else?`;
  };

  /**
   * searchFAQ - Searches FAQ database for relevant answers
   * Purpose: Finds and returns FAQ answers matching user's query with AI-enhanced context matching
   * @param {string} query - The user's search query
   * @returns {Promise<Object|null>} FAQ search result with answer, source, and matching FAQ item
   */
  const searchFAQ = async (query) => {
    try {
      const PROXY_URL = getBackendURL();
      const response = await fetch(`${PROXY_URL}/api/faq-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query,
          conversation: messages.filter(m => m.sender === 'user').slice(-3)
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('FAQ search error:', error);
    }
    return null;
  };

  /**
   * createTicket - Creates a support ticket from chat conversation
   * Purpose: Converts chat conversation into a formal support ticket with extracted user info
   * @param {Object} info - User information object (name, email, phone, subject)
   * @param {string} intent - Detected intent category
   * @param {string} message - Issue description or conversation summary
   * @returns {Promise<Object|null>} Ticket creation result with ticket ID and details
   */
  const createTicket = async (info, intent, message) => {
    try {
      const PROXY_URL = getBackendURL();
      const response = await fetch(`${PROXY_URL}/api/create-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: info.name || 'User',
          email: info.email || '',
          phone: info.phone || '',
          subject: info.subject || 'Support Request',
          message: message,
          intent: intent || 'general'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Ticket creation error:', error);
    }
    return null;
  };

  /**
   * handleSendMessage - Handles sending user messages in chat
   * Purpose: Main message handler that processes user input, detects intent, gets AI response, 
   * analyzes sentiment, and manages conversation flow including profile requests and ticket creation
   * @param {Event} e - Form submit event or synthetic event from quick replies
   */
  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) {
    e.preventDefault();
    }
    
    // Allow sending from quick replies or suggestions even if input is empty
    const messageToSend = inputMessage.trim() || (e?.target?.value || e?.message || '');
    if (!messageToSend || isTyping || isProcessingRef.current) return;
    
    const userMessageText = messageToSend.trim();
    
    // Prevent duplicate processing - check if this exact message was just processed
    if (lastProcessedMessageRef.current === userMessageText && isProcessingRef.current) {
      return; // Already processing this message
    }
    
    // Prevent duplicate processing
    isProcessingRef.current = true;
    lastProcessedMessageRef.current = userMessageText;
    responseAddedRef.current = false;
    
    setInputMessage('');
    setError(null);

    // Add user message
    const userMessage = {
      text: userMessageText,
      sender: 'user',
      time: new Date().toLocaleTimeString()
    };
    
    // Check for profile request keywords (fast check before anything else)
    const profileKeywords = [
      'suggest profile', 'suggest profiles', 'suggest some profile', 'suggest some profiles',
      'profile suggestion', 'profile suggestions', 'profile suggestion', 'profiles suggestion',
      'find match', 'find matches', 'find a match', 'find some matches',
      'show me profile', 'show me profiles', 'show profile', 'show profiles',
      'match suggestions', 'match suggestion', 'suggest match', 'suggest matches',
      'find profiles', 'find profile', 'get profiles', 'get profile',
      'want profile', 'want profiles', 'need profile', 'need profiles',
      'would have profile', 'would have profiles', 'would like profile', 'would like profiles',
      'i want profile', 'i want profiles', 'i need profile', 'i need profiles'
    ];
    const lowerText = userMessageText.toLowerCase();
    const hasProfile = lowerText.includes('profile') || lowerText.includes('match');
    const hasAction = lowerText.includes('suggest') || lowerText.includes('want') || 
                     lowerText.includes('need') || lowerText.includes('would') ||
                     lowerText.includes('show') || lowerText.includes('find') ||
                     lowerText.includes('get') || lowerText.includes('have') ||
                     lowerText.includes('like') || lowerText.includes('looking');
    
    const isQuickProfileCheck = profileKeywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    ) || (hasProfile && hasAction);
    
    // Handle profile request immediately (before intent detection) - EARLY RETURN
    if (isQuickProfileCheck && !waitingForProfileGender) {
      setMessages(prev => {
        const updated = [...prev, userMessage];
        const profileQuestion = 'I can help you find profiles! Are you looking for male or female profiles?';
        // Check if this message already exists in last 2 messages
        const lastTwo = updated.slice(-2);
        const alreadyAsked = lastTwo.some(msg => msg.sender === 'bot' && msg.text === profileQuestion);
        if (alreadyAsked) {
          return updated; // Don't add duplicate
        }
        setShowProfileQuestion(true);
        setWaitingForProfileGender(true);
        return [...updated, {
          text: profileQuestion,
          sender: 'bot',
          time: new Date().toLocaleTimeString(),
          isProfileQuestion: true
        }];
      });
      setIsTyping(false);
      return; // CRITICAL: Exit early, don't continue
    }
    
    // Handle gender selection response (before intent detection) - EARLY RETURN
    if (waitingForProfileGender) {
      const gender = userMessageText.toLowerCase().includes('male') || userMessageText.toLowerCase().includes('men') || userMessageText.toLowerCase().includes('boy') || userMessageText.toLowerCase().includes('guy') ? 'male' :
                    userMessageText.toLowerCase().includes('female') || userMessageText.toLowerCase().includes('women') || userMessageText.toLowerCase().includes('girl') || userMessageText.toLowerCase().includes('lady') ? 'female' : null;
      
      if (gender) {
        setWaitingForProfileGender(false);
        setShowProfileQuestion(false);
        const suggestions = await getProfileSuggestions(gender);
        setMessages(prev => {
          const updated = [...prev, userMessage];
          const profileHeader = `Great! Here are some ${gender} profiles for you:`;
          // Check for duplicates in last 3 messages
          const lastThree = updated.slice(-3);
          const alreadyShown = lastThree.some(msg => msg.sender === 'bot' && msg.text === profileHeader);
          if (alreadyShown) {
            return updated; // Don't add duplicate
          }
          return [...updated, {
            text: profileHeader,
            sender: 'bot',
            time: new Date().toLocaleTimeString()
          }, {
            text: suggestions,
            sender: 'bot',
            time: new Date().toLocaleTimeString(),
            isProfileSuggestion: true
          }];
        });
        setIsTyping(false);
        isProcessingRef.current = false;
        return; // CRITICAL: Exit early
      } else {
        setMessages(prev => {
          const updated = [...prev, userMessage];
          const clarification = 'Please specify: Are you looking for male or female profiles?';
          const lastTwo = updated.slice(-2);
          const alreadyAsked = lastTwo.some(msg => msg.sender === 'bot' && msg.text === clarification);
          if (alreadyAsked) {
            return updated; // Don't add duplicate
          }
          return [...updated, {
            text: clarification,
            sender: 'bot',
            time: new Date().toLocaleTimeString()
          }];
        });
        setIsTyping(false);
        isProcessingRef.current = false;
        return; // CRITICAL: Exit early
      }
    }
    
    // Normal flow - only runs if NOT a profile request
    // Add user message first (ONLY ONCE) - use functional update with duplicate check
    setMessages(prev => {
      // Check if this exact message was already added to prevent duplicates
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.sender === 'user' && lastMessage.text === userMessageText) {
        // Message already exists, don't add again
        return prev;
      }
      const updated = [...prev, userMessage];
      // Update ref immediately for async processing
      messagesRef.current = updated;
      return updated;
    });
    setIsTyping(true);
    
    // Process bot response OUTSIDE of setState to prevent duplicates
    (async () => {
      // Get current messages for context - use ref to get latest (includes user message)
      const currentMessages = messagesRef.current;
      
      // Step 1: Detect intent (profile requests already handled above with early return)
      try {
        const intentResult = await detectIntent(userMessageText);
        // Handle both object and string responses from detectIntent
        const intent = (intentResult && typeof intentResult === 'object' && intentResult.intent) ? intentResult.intent : intentResult;
        setDetectedIntent(intent);
        
        // Double-check: if intent is profile_match but wasn't caught by quick check, handle it now
        if ((intent === 'profile_match' || intentResult?.intent === 'profile_match') && !waitingForProfileGender && !isQuickProfileCheck) {
          const profileQuestion = 'I can help you find profiles! Are you looking for male or female profiles?';
          setMessages(current => {
            const lastTwo = current.slice(-2);
            const alreadyAsked = lastTwo.some(msg => msg.sender === 'bot' && msg.text === profileQuestion);
            if (alreadyAsked) {
              return current; // Don't add duplicate
            }
            setShowProfileQuestion(true);
            setWaitingForProfileGender(true);
            return [...current, {
              text: profileQuestion,
              sender: 'bot',
              time: new Date().toLocaleTimeString(),
              isProfileQuestion: true
            }];
          });
          setIsTyping(false);
          isProcessingRef.current = false;
          return; // Skip normal processing for profile requests
        }
        
        // Skip normal flow if profile_match detected
        if (intent === 'profile_match' || intentResult?.intent === 'profile_match') {
          setIsTyping(false);
          isProcessingRef.current = false;
          return; // Skip normal processing for profile requests
        }
        
        // Step 1.2: Detect language (non-blocking)
        detectLanguage(userMessageText).catch(err => {
          console.error('Language detection failed:', err);
        });
        
        // Step 1.3: Analyze sentiment
        const sentimentData = await analyzeSentiment(userMessageText, currentMessages).catch(err => {
          console.error('Sentiment analysis failed:', err);
          return { sentiment: 'neutral', emotion: 'calm', urgency: 'medium', tone: 'neutral' };
        });
        
        // Step 1.4: Get quick replies (non-blocking)
        getQuickReplies(userMessageText, currentMessages).catch(err => {
          console.error('Quick replies failed:', err);
        });
        
        // Step 1.5: Check escalation (non-blocking)
        checkEscalation(userMessageText, currentMessages, sentimentData?.sentiment, intent).catch(err => {
          console.error('Escalation check failed:', err);
        });
        
        // Step 1.6: Smart routing suggestion (skip for profile requests)
        let routeData = null;
        if (intent !== 'profile_match') {
          routeData = await getSmartRoute(intent, userMessageText).catch(err => {
            console.error('Error getting smart route:', err);
            return null;
          });
          if (routeData && routeData.route && routeData.route.channel !== 'chat') {
            setShowRouteSuggestion(true);
            setSuggestedRoute(routeData.route);
          }
        } else {
          // Ensure routing suggestions are hidden for profile requests
          setShowRouteSuggestion(false);
          setSuggestedRoute(null);
        }
        
        // Step 1.7: Check FAQ first for common questions (skip for profile requests)
        let botResponseText = '';
        let useFAQ = false;
        
        // CRITICAL: Check if response already added to prevent duplicates
        if (responseAddedRef.current) {
          setIsTyping(false);
          isProcessingRef.current = false;
          return;
        }
        
        if (intent !== 'profile_match') {
          try {
            const faqResult = await searchFAQ(userMessageText).catch(() => null);
            // Only use FAQ if it's a direct match, otherwise use AI
            if (faqResult && faqResult.source === 'faq' && faqResult.faq && faqResult.answer) {
              // Check again before assigning
              if (!responseAddedRef.current) {
                botResponseText = faqResult.answer;
                useFAQ = true;
              }
            } else {
              // Step 2: Get AI response (only if FAQ didn't match)
              // CRITICAL: Check again before calling to prevent duplicate
              if (!responseAddedRef.current) {
                botResponseText = await getBotResponse(userMessageText, currentMessages).catch(err => {
                  console.error('Error getting bot response:', err);
                  return 'I apologize, but I encountered an error. Please try again or contact support.';
                });
              }
            }
          } catch (err) {
            console.error('Error in FAQ/AI response:', err);
            if (!responseAddedRef.current) {
              botResponseText = await getBotResponse(userMessageText, currentMessages).catch(() => {
                return 'I apologize, but I encountered an error. Please try again or contact support.';
              });
            }
          }
        }
        
        // Step 3: Extract user info after 2-3 messages
        if (currentMessages.filter(m => m.sender === 'user').length >= 2) {
          extractUserInfo(currentMessages).then(info => {
            // If we have enough info, offer to create ticket
            if (info.email || info.name) {
              setShowCreateTicket(true);
              // Auto-fill form if callback provided
              if (onFormFill && (info.name || info.email || info.phone)) {
                onFormFill(info);
              }
            }
          });
        }
        
        // Skip normal response if profile_match (already handled)
        if (intent === 'profile_match') {
          setIsTyping(false);
          isProcessingRef.current = false;
          return;
        }
        
        // Adjust response based on sentiment and emotion
        let adjustedResponse = botResponseText || '';
        if (sentimentData && typeof sentimentData === 'object' && botResponseText) {
          const emotion = sentimentData.emotion || sentimentData.sentiment || 'neutral';
          const sentiment = sentimentData.sentiment || 'neutral';
          
          // Check if response already contains greeting/sentiment phrases to avoid duplication
          const responseLower = botResponseText.toLowerCase();
          const hasGreeting = responseLower.startsWith('hello') || responseLower.startsWith('hi') || 
                            responseLower.includes("i'm glad") || responseLower.includes("i'm happy") ||
                            responseLower.includes("welcome") || responseLower.includes("nice to meet") ||
                            responseLower.includes("i'm here to help") || responseLower.includes("how can i help");
          
          // Only add sentiment prefix if response doesn't already have similar greeting
          if (!hasGreeting) {
            if (emotion === 'angry' || sentiment === 'angry') {
              adjustedResponse = `I understand you're upset. Let me help resolve this for you. ${botResponseText}`;
            } else if (emotion === 'frustrated' || sentiment === 'frustrated') {
              adjustedResponse = `I understand this is frustrating. ${botResponseText}`;
            } else if (emotion === 'sad' || sentiment === 'sad') {
              adjustedResponse = `I'm sorry to hear that. Let me help you. ${botResponseText}`;
            } else if (emotion === 'worried' || emotion === 'nervous') {
              adjustedResponse = `I understand your concern. ${botResponseText}`;
            } else if (sentiment === 'urgent' || (sentimentData.urgency && sentimentData.urgency === 'high')) {
              adjustedResponse = `I see this is urgent. ${botResponseText}`;
            } else if (emotion === 'confused') {
              adjustedResponse = `I can help clarify that for you. ${botResponseText}`;
            } else if (emotion === 'annoyed' || emotion === 'impatient') {
              adjustedResponse = `I appreciate your patience. Let me help you quickly. ${botResponseText}`;
            } else if (emotion === 'disappointed' || sentiment === 'disappointed') {
              adjustedResponse = `I understand your disappointment. Let me help make this right. ${botResponseText}`;
            } else if (emotion === 'excited' || sentiment === 'excited') {
              adjustedResponse = `That's great to hear! ${botResponseText}`;
            } else if (emotion === 'grateful' || emotion === 'satisfied' || sentiment === 'grateful') {
              adjustedResponse = `You're very welcome! ${botResponseText}`;
            } else if (emotion === 'happy' || sentiment === 'positive') {
              // Only add if not already in response
              if (!responseLower.includes('glad') && !responseLower.includes('happy') && !responseLower.includes('help')) {
                adjustedResponse = `I'm glad to help! ${botResponseText}`;
              }
            } else if (emotion === 'hopeful') {
              adjustedResponse = `I'm here to help make that happen. ${botResponseText}`;
            } else if (emotion === 'relieved') {
              adjustedResponse = `I'm glad I could help! ${botResponseText}`;
            }
          }
        }
        
        // Display response (only once, no duplicates)
        // CRITICAL: Check if response already added before proceeding
        if (responseAddedRef.current) {
          setIsTyping(false);
          isProcessingRef.current = false;
          return;
        }
        
        if (adjustedResponse && adjustedResponse.trim()) {
          // Trim and limit response length
          const trimmedResponse = adjustedResponse.trim();
          const maxLength = 200; // Limit to 200 characters
          const finalResponse = trimmedResponse.length > maxLength 
            ? trimmedResponse.substring(0, maxLength) + '...' 
            : trimmedResponse;
          
          // CRITICAL: Mark as added BEFORE setState to prevent race conditions
          responseAddedRef.current = true;
          
          setMessages(current => {
            // Check if message already exists in last 3 messages to prevent duplicates
            const lastThree = current.slice(-3);
            const isDuplicate = lastThree.some(msg => 
              msg.sender === 'bot' && 
              (msg.text === finalResponse || 
               msg.text.includes(finalResponse.substring(0, 50)) ||
               finalResponse.includes(msg.text.substring(0, 50)))
            );
            
            if (isDuplicate) {
              responseAddedRef.current = false; // Reset if duplicate found
              isProcessingRef.current = false;
              setIsTyping(false);
              return current; // Don't add duplicate
            }
            
            isProcessingRef.current = false;
            return [...current, {
              text: finalResponse,
              sender: 'bot',
              time: new Date().toLocaleTimeString()
            }];
          });
          
          // Show route suggestion if available (only if not FAQ answer and not profile request)
          if (!useFAQ && intent !== 'profile_match' && routeData && routeData.route.channel !== 'chat' && showRouteSuggestion) {
            setTimeout(() => {
              setMessages(current => [...current, {
                text: `💡 Tip: For ${intent} issues, we recommend ${routeData?.route?.name || 'Support'} (${routeData?.route?.contact || 'Contact'}).`,
                sender: 'bot',
                time: new Date().toLocaleTimeString(),
                isSuggestion: true,
                suggestionData: routeData?.route || {},
                onClickAction: () => {
                  // When clicked, send the suggestion as a user message
                  const routeInfo = routeData?.route || {};
                  const suggestionText = `I want to use ${routeInfo.name || 'this service'}`;
                  const userMsg = {
                    text: suggestionText,
                    sender: 'user',
                    time: new Date().toLocaleTimeString()
                  };
                  setMessages(prev => {
                    const updated = [...prev, userMsg];
                    setIsTyping(true);
                    detectIntent(suggestionText).then(async newIntent => {
                      try {
                        const botResponse = await getBotResponse(suggestionText, updated);
                        if (botResponse && botResponse.trim()) {
                          setMessages(current => {
                            const responseText = botResponse.trim().substring(0, 200);
                            const lastBotMsg = current[current.length - 1];
                            if (lastBotMsg && lastBotMsg.sender === 'bot' && lastBotMsg.text === responseText) {
                              return current;
                            }
                            return [...current, {
                              text: responseText,
                              sender: 'bot',
                              time: new Date().toLocaleTimeString()
                            }];
                          });
                        }
                      } catch (err) {
                        console.error('Error getting bot response:', err);
                      } finally {
                        setIsTyping(false);
                      }
                    }).catch(err => {
                      console.error('Error detecting intent:', err);
                      setIsTyping(false);
                    });
                    return updated;
                  });
                }
              }]);
            }, 1500);
          }
          
          // After bot response, offer to create ticket if needed (only after 2+ messages)
          if (!useFAQ && intent !== 'general' && currentMessages.filter(m => m.sender === 'user').length >= 2) {
            setTimeout(() => {
              setMessages(current => [...current, {
                text: 'Would you like me to create a support ticket for this issue?',
                sender: 'bot',
                time: new Date().toLocaleTimeString(),
                action: 'create_ticket'
              }]);
            }, 2500);
          }
        } else {
          setMessages(current => [...current, {
            text: 'I apologize, but I encountered an error. Please contact our support team at globalsupport@company.com or call 1800-123-4567 for assistance.',
            sender: 'bot',
            time: new Date().toLocaleTimeString()
          }]);
        }
        
        setIsTyping(false);
        setError(null);
        isProcessingRef.current = false;
        // Reset after delay to allow next message
        setTimeout(() => {
          responseAddedRef.current = false;
          lastProcessedMessageRef.current = null;
        }, 2000);
      } catch (err) {
        console.error('Error in message processing:', err);
        setIsTyping(false);
        setError(null);
        isProcessingRef.current = false;
        responseAddedRef.current = false;
        lastProcessedMessageRef.current = null;
      }
    })();
  };

  /**
   * handleCreateTicket - Creates support ticket from chat conversation
   * Purpose: Creates a formal support ticket with conversation summary and user information
   * Called when user accepts ticket creation offer from chat
   */
  const handleCreateTicket = async () => {
    setIsTyping(true);
    
    // Get conversation summary
    const conversation = messages.filter(m => m.sender !== 'system');
    const summary = await summarizeConversation(conversation);
    const conversationText = summary || messages
      .filter(m => m.sender === 'user')
      .map(m => m.text)
      .join(' ');
    
    // Include sentiment in ticket
    const ticketMessage = sentiment ? 
      `[Sentiment: ${sentiment.sentiment}, Urgency: ${sentiment.urgency}]\n\n${conversationText}` :
      conversationText;
    
    const ticketData = await createTicket(extractedInfo, detectedIntent, ticketMessage);
    
    if (ticketData && ticketData.success) {
      setMessages(prev => [...prev, {
        text: `✅ Great! I've created support ticket ${ticketData.ticketId} for you. ${ticketData.message}`,
        sender: 'bot',
        time: new Date().toLocaleTimeString()
      }]);
      setShowCreateTicket(false);
    } else {
      setMessages(prev => [...prev, {
        text: 'I had trouble creating the ticket. Please use the contact form or email us at globalsupport@company.com',
        sender: 'bot',
        time: new Date().toLocaleTimeString()
      }]);
    }
    setIsTyping(false);
  };

  return (
    <>
      {/* Chat Toggle Button - Modern Design */}
      <button 
        className={`chat-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
        aria-label="Toggle live chat"
        title="Chat with AI Assistant"
      >
        <i className={isOpen ? "fas fa-times" : "fas fa-robot"}></i>
        {!isOpen && <span className="chat-badge">AI</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            <div className="chat-header-info">
              <i className="fas fa-headset"></i>
              <div>
                <h3>HeavenMatch Support</h3>
                <span className="status-indicator">
                  <span className="status-dot"></span> Online
                </span>
              </div>
            </div>
            <button className="chat-close-btn" onClick={onToggle}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                <div 
                  className={`message-content ${message.isSuggestion ? 'suggestion-clickable' : ''}`}
                  onClick={message.isSuggestion && message.onClickAction ? message.onClickAction : undefined}
                  style={message.isSuggestion ? {
                    cursor: 'pointer',
                    background: '#f0f4ff',
                    border: '2px solid #ec4899',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    transition: 'all 0.2s',
                  } : {}}
                  onMouseEnter={(e) => {
                    if (message.isSuggestion) {
                      e.currentTarget.style.background = '#e0e8ff';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (message.isSuggestion) {
                      e.currentTarget.style.background = '#f0f4ff';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <p style={{ margin: 0 }}>{message.text}</p>
                  {message.isSuggestion && (
                    <span style={{ 
                      fontSize: '11px', 
                      color: '#ec4899', 
                      fontStyle: 'italic',
                      display: 'block',
                      marginTop: '4px'
                    }}>
                      Click to use this suggestion →
                    </span>
                  )}
                  <span className="message-time">{message.time}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="message bot error">
                <div className="message-content">
                  <p style={{ color: '#e74c3c' }}>{error}</p>
                </div>
              </div>
            )}
            {showCreateTicket && extractedInfo && (extractedInfo.email || extractedInfo.name) && (
              <div className="message bot ticket-offer">
                <div className="message-content">
                  <p>I can create a support ticket for you. Would you like me to proceed?</p>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={handleCreateTicket}
                      style={{ 
                        padding: '8px 16px', 
                        background: '#ec4899', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Create Ticket
                    </button>
                    <button 
                      onClick={() => setShowCreateTicket(false)}
                      style={{ 
                        padding: '8px 16px', 
                        background: '#ccc', 
                        color: 'black', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              </div>
            )}
            {detectedIntent && detectedIntent !== 'general' && (
              <div style={{ 
                fontSize: '11px', 
                color: '#666', 
                padding: '4px 12px',
                fontStyle: 'italic'
              }}>
                Detected: {detectedIntent} issue
                {suggestedRoute && (
                  <span style={{ marginLeft: '8px', color: '#ec4899' }}>
                    → Recommended: {suggestedRoute?.name || 'Support Channel'}
                  </span>
                )}
              </div>
            )}
            {showRouteSuggestion && suggestedRoute && (
              <div className="message bot route-suggestion" style={{
                background: 'white',
                border: '2px solid #ec4899',
                borderRadius: '12px',
                padding: '16px',
                margin: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(236, 72, 153, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8f9ff';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(236, 72, 153, 0.15)';
              }}
              onClick={() => {
                // When clicked, send a message about using this channel
                const messageText = `I want to use ${suggestedRoute?.name || 'this service'}`;
                const userMsg = {
                  text: messageText,
                  sender: 'user',
                  time: new Date().toLocaleTimeString()
                };
                setMessages(prev => {
                  const updated = [...prev, userMsg];
                  // Trigger AI response
                  setIsTyping(true);
                  detectIntent(messageText).then(async newIntent => {
                    try {
                      const botResponse = await getBotResponse(messageText, updated);
                      if (botResponse && botResponse.trim()) {
                        setMessages(current => {
                          const responseText = botResponse.trim().substring(0, 200);
                          const lastBotMsg = current[current.length - 1];
                          if (lastBotMsg && lastBotMsg.sender === 'bot' && lastBotMsg.text === responseText) {
                            return current;
                          }
                          return [...current, {
                            text: responseText,
                            sender: 'bot',
                            time: new Date().toLocaleTimeString()
                          }];
                        });
                      }
                    } catch (err) {
                      console.error('Error getting bot response:', err);
                    } finally {
                      setIsTyping(false);
                    }
                  }).catch(err => {
                    console.error('Error detecting intent:', err);
                    setIsTyping(false);
                  });
                  return updated;
                });
              }}
              >
                {/* Header - Properly Aligned */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  <i className="fas fa-route" style={{ 
                    marginRight: '10px', 
                    color: '#ec4899',
                    fontSize: '18px',
                    width: '20px',
                    textAlign: 'center'
                  }}></i>
                  <h4 style={{ 
                    margin: 0, 
                    fontWeight: '600',
                    fontSize: '16px',
                    color: '#333',
                    lineHeight: '1.2'
                  }}>
                    Best Support Channel
                  </h4>
                </div>
                
                {/* Recommendation Text - Aligned */}
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ 
                    fontSize: '14px', 
                    marginBottom: '8px',
                    color: '#555',
                    lineHeight: '1.5',
                    margin: '0 0 8px 0'
                  }}>
                    For <strong style={{ color: '#ec4899' }}>{detectedIntent}</strong> issues, we recommend:
                  </p>
                  
                  <p style={{ 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: '#ec4899',
                    margin: '0 0 12px 0',
                    lineHeight: '1.3'
                  }}>
                    {suggestedRoute?.name || 'Support Channel'}
                  </p>
                  
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666', 
                    margin: '0',
                    lineHeight: '1.5'
                  }}>
                    {suggestedRoute?.reason || 'This is the best channel for your issue'}
                  </p>
                </div>
                
                {/* Action Buttons - Properly Aligned */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: '16px'
                }}>
                  {suggestedRoute?.channel === 'phone' && suggestedRoute?.contact && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `tel:${suggestedRoute?.contact || ''}`;
                      }}
                      style={{
                        padding: '12px 16px',
                        background: '#ec4899',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#5568d3';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ec4899';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <i className="fas fa-phone"></i>
                      <span>Call {suggestedRoute?.contact || ''}</span>
                    </button>
                  )}
                  
                  {/* Always show email option with globalsupport@company.com */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `mailto:globalsupport@company.com`;
                    }}
                        style={{
                          padding: '12px 16px',
                          background: '#f472b6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.2s',
                          width: '100%'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#653d8a';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f472b6';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <i className="fas fa-envelope"></i>
                        <span>Send Email</span>
                      </button>
                      <div style={{
                        padding: '10px 12px',
                        background: '#f8f9fa',
                        borderRadius: '6px',
                        textAlign: 'center',
                        border: '1px solid #e0e0e0'
                      }}>
                        <span style={{
                          fontSize: '13px',
                          color: '#555',
                          wordBreak: 'break-word',
                          fontFamily: 'monospace'
                        }}>
                          globalsupport@company.com
                        </span>
                      </div>
                </div>
                
                {/* Click Hint - Centered */}
                <div style={{
                  paddingTop: '12px',
                  borderTop: '1px solid #e0e0e0',
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    fontSize: '11px', 
                    color: '#ec4899', 
                    margin: 0,
                    fontStyle: 'italic',
                    lineHeight: '1.4'
                  }}>
                    💡 Click anywhere on this card to use this suggestion
                  </p>
                </div>
              </div>
            )}
            {/* Profile Gender Selection */}
            {showProfileQuestion && waitingForProfileGender && (
            <div style={{
              padding: '12px',
              background: '#f0f4ff',
              borderTop: '2px solid #ec4899',
              marginTop: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <i className="fas fa-heart" style={{ color: '#ec4899' }}></i>
                <strong style={{ color: '#ec4899', fontSize: '13px' }}>
                  Profile Selection
                </strong>
              </div>
              <p style={{ fontSize: '12px', color: '#555', margin: '0 0 10px 0' }}>
                Please select which profiles you'd like to see:
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={async () => {
                    setWaitingForProfileGender(false);
                    setShowProfileQuestion(false);
                    const suggestions = await getProfileSuggestions('male');
                    setMessages(prev => [...prev, {
                      text: 'Male',
                      sender: 'user',
                      time: new Date().toLocaleTimeString()
                    }, {
                      text: `Great! Here are some male profiles for you:`,
                      sender: 'bot',
                      time: new Date().toLocaleTimeString()
                    }, {
                      text: suggestions,
                      sender: 'bot',
                      time: new Date().toLocaleTimeString(),
                      isProfileSuggestion: true
                    }]);
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#ec4899',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    flex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#5568d3';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ec4899';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <i className="fas fa-mars"></i>
                  <span>Male Profiles</span>
                </button>
                <button
                  onClick={async () => {
                    setWaitingForProfileGender(false);
                    setShowProfileQuestion(false);
                    const suggestions = await getProfileSuggestions('female');
                    setMessages(prev => [...prev, {
                      text: 'Female',
                      sender: 'user',
                      time: new Date().toLocaleTimeString()
                    }, {
                      text: `Great! Here are some female profiles for you:`,
                      sender: 'bot',
                      time: new Date().toLocaleTimeString()
                    }, {
                      text: suggestions,
                      sender: 'bot',
                      time: new Date().toLocaleTimeString(),
                      isProfileSuggestion: true
                    }]);
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#f472b6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    flex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#653d8a';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f472b6';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <i className="fas fa-venus"></i>
                  <span>Female Profiles</span>
                </button>
              </div>
            </div>
            )}

            {/* Quick Replies */}
            {quickReplies.length > 0 && (
            <div style={{
              padding: '8px 12px',
              background: '#f8f9fa',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    // Directly send the message
                    const userMsg = {
                      text: reply,
                      sender: 'user',
                      time: new Date().toLocaleTimeString()
                    };
                    setMessages(prev => {
                      const updated = [...prev, userMsg];
                      setIsTyping(true);
                      // Clear quick replies
                      setQuickReplies([]);
                      // Trigger AI response
                      detectIntent(reply).then(async intent => {
                        const sentimentData = await analyzeSentiment(reply, updated);
                        await getQuickReplies(reply, updated);
                        await checkEscalation(reply, updated, sentimentData?.sentiment, intent);
                        const botResponse = await getBotResponse(reply, updated);
                        if (botResponse) {
                          setMessages(current => [...current, {
                            text: botResponse.trim().substring(0, 200),
                            sender: 'bot',
                            time: new Date().toLocaleTimeString()
                          }]);
                        }
                        setIsTyping(false);
                      });
                      return updated;
                    });
                  }}
                  style={{
                    padding: '6px 12px',
                    background: 'white',
                    border: '1px solid #ec4899',
                    borderRadius: '16px',
                    color: '#ec4899',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#ec4899';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#ec4899';
                  }}
                >
                  {reply}
                </button>
              ))}
            </div>
            )}

            {/* Sentiment Indicator - Shows for ALL emotions */}
            {sentiment && typeof sentiment === 'object' && sentiment.sentiment && sentiment.sentiment !== 'neutral' && (
            <div style={{
              padding: '6px 12px',
              background: 
                sentiment.emotion === 'angry' || sentiment.sentiment === 'angry' ? '#f8d7da' :
                sentiment.emotion === 'frustrated' || sentiment.sentiment === 'frustrated' || sentiment.emotion === 'annoyed' ? '#fff3cd' :
                sentiment.sentiment === 'urgent' || (sentiment.urgency && sentiment.urgency === 'high') ? '#f8d7da' :
                sentiment.emotion === 'sad' || sentiment.sentiment === 'sad' || sentiment.emotion === 'disappointed' ? '#e2e3e5' :
                sentiment.emotion === 'worried' || sentiment.emotion === 'nervous' ? '#fff3cd' :
                sentiment.emotion === 'confused' ? '#d1ecf1' :
                sentiment.emotion === 'excited' || sentiment.emotion === 'happy' || sentiment.sentiment === 'positive' || sentiment.emotion === 'grateful' || sentiment.emotion === 'satisfied' ? '#d1ecf1' :
                sentiment.emotion === 'impatient' ? '#fff3cd' :
                '#d1ecf1',
              borderTop: '1px solid #e0e0e0',
              fontSize: '11px',
              color: 
                sentiment.emotion === 'angry' || sentiment.sentiment === 'angry' ? '#721c24' :
                sentiment.emotion === 'frustrated' || sentiment.sentiment === 'frustrated' || sentiment.emotion === 'annoyed' ? '#856404' :
                sentiment.sentiment === 'urgent' ? '#721c24' :
                sentiment.emotion === 'sad' || sentiment.sentiment === 'sad' || sentiment.emotion === 'disappointed' ? '#383d41' :
                sentiment.emotion === 'worried' || sentiment.emotion === 'nervous' ? '#856404' :
                sentiment.emotion === 'confused' ? '#0c5460' :
                sentiment.emotion === 'excited' || sentiment.emotion === 'happy' || sentiment.sentiment === 'positive' || sentiment.emotion === 'grateful' || sentiment.emotion === 'satisfied' ? '#155724' :
                sentiment.emotion === 'impatient' ? '#856404' :
                '#0c5460',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <i className={`fas ${
                sentiment.emotion === 'angry' || sentiment.sentiment === 'angry' ? 'fa-angry' :
                sentiment.emotion === 'frustrated' || sentiment.sentiment === 'frustrated' || sentiment.emotion === 'annoyed' ? 'fa-exclamation-triangle' :
                sentiment.sentiment === 'urgent' ? 'fa-bolt' :
                sentiment.emotion === 'sad' || sentiment.sentiment === 'sad' || sentiment.emotion === 'disappointed' ? 'fa-frown' :
                sentiment.emotion === 'worried' || sentiment.emotion === 'nervous' ? 'fa-exclamation-circle' :
                sentiment.emotion === 'confused' ? 'fa-question-circle' :
                sentiment.emotion === 'excited' ? 'fa-star' :
                sentiment.emotion === 'happy' || sentiment.sentiment === 'positive' || sentiment.emotion === 'grateful' || sentiment.emotion === 'satisfied' ? 'fa-smile' :
                sentiment.emotion === 'impatient' ? 'fa-clock' :
                'fa-smile'
              }`}></i>
              <span>
                {sentiment.emotion === 'angry' || sentiment.sentiment === 'angry' ? 'User seems angry - providing extra support' :
                 sentiment.emotion === 'frustrated' || sentiment.sentiment === 'frustrated' ? 'User seems frustrated - offering extra help' :
                 sentiment.sentiment === 'urgent' ? 'Urgent issue detected - prioritizing response' :
                 sentiment.emotion === 'sad' || sentiment.sentiment === 'sad' ? 'User seems sad - showing empathy' :
                 sentiment.emotion === 'worried' || sentiment.emotion === 'nervous' ? 'User seems worried - providing reassurance' :
                 sentiment.emotion === 'confused' ? 'User seems confused - offering clarification' :
                 sentiment.emotion === 'annoyed' ? 'User seems annoyed - addressing quickly' :
                 sentiment.emotion === 'disappointed' ? 'User seems disappointed - working to make it right' :
                 sentiment.emotion === 'excited' ? 'User seems excited - matching enthusiasm' :
                 sentiment.emotion === 'happy' || sentiment.sentiment === 'positive' ? 'User seems happy - maintaining positive tone' :
                 sentiment.emotion === 'grateful' ? 'User seems grateful - acknowledging appreciation' :
                 sentiment.emotion === 'satisfied' ? 'User seems satisfied - maintaining service quality' :
                 sentiment.emotion === 'impatient' ? 'User seems impatient - prioritizing speed' :
                 'Emotion detected - providing personalized support'}
              </span>
            </div>
            )}

            {/* Language Detector */}
            {detectedLanguage && detectedLanguage !== 'English' && (
            <div style={{
              padding: '6px 12px',
              background: '#e7f3ff',
              borderTop: '1px solid #e0e0e0',
              fontSize: '11px',
              color: '#0056b3',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <i className="fas fa-language"></i>
              <span>Detected language: {detectedLanguage}</span>
            </div>
            )}

            {/* Escalation Offer */}
            {showEscalation && (
            <div style={{
              padding: '12px',
              background: '#fff3cd',
              borderTop: '2px solid #ffc107',
              marginTop: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <i className="fas fa-user-headset" style={{ color: '#856404' }}></i>
                <strong style={{ color: '#856404', fontSize: '13px' }}>
                  Need Human Support?
                </strong>
              </div>
              <p style={{ fontSize: '12px', color: '#856404', margin: '0 0 8px 0' }}>
                Your issue seems complex. Would you like to speak with a human agent?
              </p>
              <button
                onClick={() => {
                  setMessages(prev => [...prev, {
                    text: 'I would like to speak with a human agent',
                    sender: 'user',
                    time: new Date().toLocaleTimeString()
                  }]);
                  setShowEscalation(false);
                  // Trigger response
                  setTimeout(() => {
                    setMessages(prev => [...prev, {
                      text: 'I\'ll connect you with a human agent. Please wait a moment. You can also call us at 1800-123-4567 for immediate assistance.',
                      sender: 'bot',
                      time: new Date().toLocaleTimeString()
                    }]);
                  }, 500);
                }}
                style={{
                  padding: '8px 16px',
                  background: '#ffc107',
                  color: '#856404',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                Connect to Human Agent
              </button>
            </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form - Fixed at bottom, outside scrollable area */}
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
              }}
              placeholder={detectedLanguage !== 'English' ? `Type your message in ${detectedLanguage}...` : "Type your message..."}
              className="chat-input"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="chat-send-btn"
              disabled={isTyping || !inputMessage.trim()}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default LiveChatWidget;

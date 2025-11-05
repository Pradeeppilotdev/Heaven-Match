const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// AI Provider Configuration - Single API Key for all features
const AI_PROVIDER = process.env.REACT_APP_AI_PROVIDER || 'openrouter'; // 'openrouter', 'openai', 'huggingface'
const AI_API_KEY = process.env.REACT_APP_AI_API_KEY || process.env.REACT_APP_HF_API_TOKEN;
const AI_MODEL = process.env.REACT_APP_AI_MODEL || 'meta-llama/llama-3.1-8b-instruct'; // OpenRouter model

// Middleware
app.use(cors());
app.use(express.json());

// Universal AI API call function - works with OpenRouter, OpenAI, or Hugging Face
const callAI = async (prompt, options = {}) => {
  const {
    maxTokens = 256,
    temperature = 0.7,
    systemPrompt = null
  } = options;

  if (!AI_API_KEY) {
    throw new Error('AI API key not configured');
  }

  if (AI_PROVIDER === 'openrouter') {
    // OpenRouter API - Fast, real-time, single key for all models
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.REACT_APP_SITE_URL || 'http://localhost:3000',
        'X-Title': 'HeavenMatch Contact'
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } else if (AI_PROVIDER === 'openai') {
    // OpenAI API - Direct OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AI_MODEL || 'gpt-3.5-turbo',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } else {
    // Fallback to Hugging Face
    const HF_MODEL = process.env.REACT_APP_HF_MODEL || process.env.REACT_APP_AI_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct';
    const response = await fetch(`https://api-inference.huggingface.co/models/${encodeURIComponent(HF_MODEL)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: temperature,
          return_full_text: false
        }
      })
    });

    if (response.status === 503) {
      throw new Error('MODEL_LOADING: Model is loading, please wait');
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0]?.generated_text || '';
    }
    return data.generated_text || '';
  }
};

// AI Intent Detection endpoint
app.post('/api/detect-intent', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    // Intent detection prompt
    const intentPrompt = `Classify this customer support query into ONE of these categories:
- billing (payment, subscription, refund, pricing)
- technical (login, password, profile, app issues)
- safety (abuse, scam, harassment, report)
- account (delete account, verification, profile management)
- profile_match (suggest profiles, find matches, show profiles, match suggestions)
- general (general questions, information)

User query: "${message}"

Respond with ONLY the category name (one word):`;

    const response = await callAI(intentPrompt, {
      maxTokens: 10,
      temperature: 0.3
    });

    let intent = 'general';
    const text = response.toLowerCase().trim();
    if (text.includes('billing')) intent = 'billing';
    else if (text.includes('technical')) intent = 'technical';
    else if (text.includes('safety')) intent = 'safety';
    else if (text.includes('account')) intent = 'account';
    else if (text.includes('profile') || text.includes('match')) intent = 'profile_match';

    res.json({ intent, message });
  } catch (error) {
    console.error('Intent detection error:', error);
    res.json({ intent: 'general', message: req.body.message });
  }
});

// AI Extract User Info endpoint - extracts name, email, phone from chat
app.post('/api/extract-info', async (req, res) => {
  try {
    const { conversation } = req.body;
    
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ error: 'Conversation array is required' });
    }

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    const conversationText = conversation.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    
    const extractPrompt = `Extract user information from this conversation. Respond in JSON format only:
{
  "name": "extracted name or empty string",
  "email": "extracted email or empty string",
  "phone": "extracted phone number or empty string",
  "subject": "brief summary of the issue (max 10 words)"
}

Conversation:
${conversationText}

JSON:`;

    const response = await callAI(extractPrompt, {
      maxTokens: 100,
      temperature: 0.3,
      systemPrompt: 'You are a data extraction assistant. Always respond with valid JSON only.'
    });

    let extracted = { name: '', email: '', phone: '', subject: '' };
    
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extracted = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fallback: simple extraction
      const emailMatch = response.match(/[\w\.-]+@[\w\.-]+\.\w+/);
      const phoneMatch = response.match(/[\d\s\-\+\(\)]{10,}/);
      if (emailMatch) extracted.email = emailMatch[0];
      if (phoneMatch) extracted.phone = phoneMatch[0].replace(/\D/g, '').slice(0, 10);
    }

    res.json(extracted);
  } catch (error) {
    console.error('Info extraction error:', error);
    res.json({ name: '', email: '', phone: '', subject: '' });
  }
});

// AI Smart Routing endpoint - suggests best support channel
app.post('/api/smart-route', async (req, res) => {
  try {
    const { intent, message, urgency } = req.body;
    
    // Routing rules based on intent
    const routingRules = {
      'safety': {
        channel: 'phone',
        priority: 'high',
        contact: '1800-999-8888',
        name: 'Safety Hotline (24/7)',
        reason: 'Safety issues require immediate attention via phone',
        email: 'safety@heavenmatch.com'
      },
      'billing': {
        channel: 'email',
        priority: 'medium',
        contact: 'billing@heavenmatch.com',
        name: 'Billing Support',
        reason: 'Billing inquiries are best handled via email for documentation',
        email: 'billing@heavenmatch.com'
      },
      'technical': {
        channel: 'ticket',
        priority: 'medium',
        contact: 'Support Ticket System',
        name: 'Technical Support',
        reason: 'Technical issues benefit from ticket tracking',
        email: 'support@heavenmatch.com'
      },
      'account': {
        channel: 'chat',
        priority: 'normal',
        contact: 'Live Chat',
        name: 'Account Support',
        reason: 'Account questions can be resolved quickly via chat',
        email: 'support@heavenmatch.com'
      },
      'general': {
        channel: 'chat',
        priority: 'normal',
        contact: 'Live Chat',
        name: 'General Support',
        reason: 'General questions are best handled via chat',
        email: 'support@heavenmatch.com'
      }
    };

    const route = routingRules[intent] || routingRules['general'];
    
    // Adjust based on urgency if provided
    if (urgency === 'high' && route.channel !== 'phone') {
      route.channel = 'phone';
      route.contact = '1800-123-4567';
      route.priority = 'high';
      route.reason = 'High urgency issues should be handled via phone';
    }

    res.json({
      intent,
      route,
      suggestedChannel: route.channel,
      message: `Based on your ${intent} inquiry, we recommend using ${route.name} for the best support experience.`
    });
  } catch (error) {
    console.error('Smart routing error:', error);
    res.json({
      intent: req.body.intent || 'general',
      route: {
        channel: 'chat',
        priority: 'normal',
        contact: 'Live Chat',
        name: 'General Support',
        email: 'support@heavenmatch.com'
      },
      suggestedChannel: 'chat'
    });
  }
});

// AI Enhanced FAQ endpoint - context-aware FAQ answers
app.post('/api/faq-search', async (req, res) => {
  try {
    const { query, conversation } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const HF_API_TOKEN = process.env.REACT_APP_HF_API_TOKEN;
    const HF_MODEL = process.env.REACT_APP_HF_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct';

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    // FAQ database (in production, this would be in a database)
    const faqs = [
      { question: 'How do I reset my password?', answer: 'Click on "Forgot Password" on the login page. Enter your registered email address. You will receive a password reset link in your email. Click the link and follow the instructions to create a new password.', category: 'account' },
      { question: 'How do I update my profile?', answer: 'Log in to your account and go to "My Profile". Click on "Edit Profile" to update your information, photos, preferences, and other details. Make sure to save your changes before leaving the page.', category: 'profile' },
      { question: 'How do I cancel my subscription?', answer: 'Go to your account settings, then click on "Billing" or "Subscription". Find the "Cancel Subscription" option and follow the prompts. Your subscription will remain active until the end of your current billing period.', category: 'payment' },
      { question: 'How do I report a fake profile or scam?', answer: 'Click on the profile you want to report, then click the "Report" button. Select the reason for reporting (fake profile, scam, inappropriate content, etc.) and provide details. Our safety team will review your report within 24 hours.', category: 'safety' },
      { question: 'How do you verify profiles?', answer: 'We verify profiles through multiple methods including phone verification, email verification, and photo verification. Premium members can request additional verification badges to increase their profile credibility.', category: 'safety' },
      { question: 'Can I get a refund?', answer: 'Refunds are considered on a case-by-case basis. Please contact our billing team at billing@heavenmatch.com within 14 days of your purchase with your transaction details and reason for refund request.', category: 'payment' },
      { question: 'How do I delete my account?', answer: 'Go to your account settings, then click on "Account" and select "Delete Account". Please note that this action is irreversible and all your data will be permanently deleted.', category: 'account' },
      { question: 'How do I change my profile visibility?', answer: 'Go to "My Profile" > "Privacy Settings" > "Profile Visibility". You can choose to make your profile visible to all, only to premium members, or hide it completely.', category: 'profile' }
    ];

    // Build context from conversation
    const conversationContext = conversation ? 
      conversation.map(msg => `${msg.sender}: ${msg.text}`).join('\n') : '';

    // Create FAQ-enhanced prompt
    const faqPrompt = `Based on this user query and our FAQ database, provide the most relevant answer. If no FAQ matches exactly, provide a helpful general response.

User Query: "${query}"
${conversationContext ? `Conversation Context:\n${conversationContext}\n` : ''}

FAQ Database:
${faqs.map((faq, i) => `${i + 1}. Q: ${faq.question}\n   A: ${faq.answer}`).join('\n\n')}

Provide a helpful answer based on the FAQ database or general knowledge about HeavenMatch matrimony services. Be concise (under 100 words):`;

    try {
      const answer = await callAI(faqPrompt, {
        maxTokens: 150,
        temperature: 0.5,
        systemPrompt: 'You are a helpful customer support assistant for HeavenMatch matrimony services.'
      });

      // Find best matching FAQ
      const queryLower = query.toLowerCase();
      const matchingFAQ = faqs.find(faq => 
        faq.question.toLowerCase().includes(queryLower) ||
        faq.answer.toLowerCase().includes(queryLower)
      );

      res.json({
        answer: answer.trim() || (matchingFAQ ? matchingFAQ.answer : 'I can help you with that. Please contact our support team for more information.'),
        source: matchingFAQ ? 'faq' : 'ai',
        faq: matchingFAQ || null
      });
    } catch (error) {
      // Fallback to simple keyword matching
      const queryLower = query.toLowerCase();
      const matchingFAQ = faqs.find(faq => 
        faq.question.toLowerCase().includes(queryLower) ||
        faq.answer.toLowerCase().includes(queryLower)
      );
      
      res.json({
        answer: matchingFAQ ? matchingFAQ.answer : 'I can help you with that. Please contact our support team at support@heavenmatch.com for more information.',
        source: matchingFAQ ? 'faq' : 'general',
        faq: matchingFAQ || null
      });
    }
  } catch (error) {
    console.error('FAQ search error:', error);
    res.json({
      answer: 'I can help you with that. Please contact our support team at support@heavenmatch.com for more information.',
      source: 'general',
      faq: null
    });
  }
});

// AI Create Ticket endpoint
app.post('/api/create-ticket', async (req, res) => {
  try {
    const { name, email, phone, subject, message, intent, priority } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Generate ticket ID
    const ticketId = 'HM-' + Date.now().toString().slice(-8);
    
    // Determine priority based on intent
    const ticketPriority = priority || (intent === 'safety' ? 'high' : intent === 'technical' ? 'medium' : 'normal');
    
    // Create ticket object (in production, save to database)
    const ticket = {
      id: ticketId,
      name,
      email,
      phone: phone || '',
      subject: subject || 'Support Request',
      message,
      intent: intent || 'general',
      priority: ticketPriority,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    // In production, save to database here
    console.log('Ticket created:', ticket);

    res.json({ 
      success: true, 
      ticketId: ticket.id,
      ticket,
      message: `Ticket ${ticket.id} created successfully. We'll respond within 24 hours.`
    });
  } catch (error) {
    console.error('Ticket creation error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Hugging Face API proxy endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, model } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    // Use universal AI call function
    try {
      const systemInstruction = `You are a helpful and friendly customer support assistant for HeavenMatch, a matrimony/matchmaking website. Be warm, professional, and empathetic. 

IMPORTANT: 
- Keep responses SHORT (under 50 words, 2-3 sentences max)
- Be direct and concise
- No repetition
- If user just says "hi" or "hello", respond with a brief greeting and ask how you can help
- Don't explain what you can do unless asked`;
      
      const response = await callAI(prompt, {
        maxTokens: 100,
        temperature: 0.7,
        systemPrompt: systemInstruction
      });

      const cleanedOutput = response
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/^Assistant:\s*/i, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (!cleanedOutput) {
        return res.status(500).json({ error: 'Empty response from model' });
      }

      res.json({ response: cleanedOutput });
    } catch (error) {
      console.error('AI API error:', error);
      
      // Handle specific error types
      if (error.message && error.message.includes('MODEL_LOADING')) {
        return res.status(503).json({ 
          error: 'MODEL_LOADING', 
          message: 'The AI model is loading. Please wait a moment and try again.'
        });
      }

      if (error.message && error.message.includes('rate limit') || error.message.includes('429')) {
        return res.status(429).json({ 
          error: 'RATE_LIMIT', 
          message: 'Too many requests. Please wait a moment and try again.' 
        });
      }

      if (error.message && (error.message.includes('401') || error.message.includes('403') || error.message.includes('invalid'))) {
        return res.status(401).json({ 
          error: 'AUTH_ERROR', 
          message: 'Invalid API key. Please check your configuration.' 
        });
      }

      if (error.message && error.message.includes('fetch failed')) {
        return res.status(503).json({ 
          error: 'NETWORK_ERROR', 
          message: 'Unable to connect to AI service. Please check your internet connection.' 
        });
      }

      res.status(500).json({ 
        error: 'INTERNAL_ERROR', 
        message: error.message || 'An error occurred while processing your request' 
      });
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'INTERNAL_ERROR', 
      message: error.message || 'An error occurred while processing your request' 
    });
  }
});

// AI Sentiment Analysis endpoint
app.post('/api/analyze-sentiment', async (req, res) => {
  try {
    const { message, conversation } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    const sentimentPrompt = `Analyze the sentiment and emotion of this customer support message. Detect ALL emotions accurately. Respond with ONLY a JSON object:
{
  "sentiment": "positive" | "neutral" | "negative" | "frustrated" | "urgent" | "angry" | "sad" | "excited" | "confused" | "worried" | "annoyed" | "grateful" | "satisfied" | "disappointed",
  "emotion": "happy" | "sad" | "angry" | "frustrated" | "worried" | "confused" | "annoyed" | "excited" | "grateful" | "disappointed" | "satisfied" | "calm" | "nervous" | "relieved" | "impatient" | "hopeful" | "upset" | "content",
  "urgency": "low" | "medium" | "high",
  "tone": "polite" | "neutral" | "informal" | "demanding" | "friendly" | "formal" | "sarcastic" | "apologetic" | "appreciative"
}

Analyze the message carefully and detect the PRIMARY emotion. Consider:
- Positive emotions: happy, excited, grateful, satisfied, relieved, hopeful, content
- Negative emotions: sad, angry, frustrated, worried, confused, annoyed, disappointed, upset, nervous, impatient
- Neutral emotions: calm, neutral

Message: "${message}"
${conversation ? `Previous context: ${conversation.slice(-2).map(m => m.text).join(' ')}` : ''}

JSON:`;

    try {
      const response = await callAI(sentimentPrompt, {
        maxTokens: 50,
        temperature: 0.3,
        systemPrompt: 'You are a sentiment analysis expert. Always respond with valid JSON only.'
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const sentiment = JSON.parse(jsonMatch[0]);
        // Ensure valid emotion values
        const validEmotions = ['happy', 'sad', 'angry', 'frustrated', 'worried', 'confused', 'annoyed', 'excited', 'grateful', 'disappointed', 'satisfied', 'calm', 'nervous', 'relieved', 'impatient', 'hopeful', 'upset', 'content'];
        const validSentiments = ['positive', 'neutral', 'negative', 'frustrated', 'urgent', 'angry', 'sad', 'excited', 'confused', 'worried', 'annoyed', 'grateful', 'satisfied', 'disappointed'];
        
        if (!validEmotions.includes(sentiment.emotion)) {
          sentiment.emotion = 'calm';
        }
        if (!validSentiments.includes(sentiment.sentiment)) {
          sentiment.sentiment = sentiment.emotion === 'happy' || sentiment.emotion === 'grateful' || sentiment.emotion === 'satisfied' ? 'positive' : 
                                sentiment.emotion === 'angry' || sentiment.emotion === 'frustrated' || sentiment.emotion === 'annoyed' ? 'negative' : 'neutral';
        }
        res.json(sentiment);
      } else {
        res.json({ sentiment: 'neutral', emotion: 'calm', urgency: 'medium', tone: 'neutral' });
      }
    } catch (error) {
      res.json({ sentiment: 'neutral', emotion: 'calm', urgency: 'medium', tone: 'neutral' });
    }
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.json({ sentiment: 'neutral', emotion: 'calm', urgency: 'medium', tone: 'neutral' });
  }
});

// AI Language Detection endpoint
app.post('/api/detect-language', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    const langPrompt = `Detect the language of this message. Respond with ONLY the language name in English (e.g., "English", "Hindi", "Spanish", "French", etc.):

"${message}"

Language:`;

    try {
      const response = await callAI(langPrompt, {
        maxTokens: 10,
        temperature: 0.1
      });

      const language = response.trim().split('\n')[0].trim();
      res.json({ language: language || 'English', detected: true });
    } catch (error) {
      res.json({ language: 'English', detected: false });
    }
  } catch (error) {
    console.error('Language detection error:', error);
    res.json({ language: 'English', detected: false });
  }
});

// AI Smart Quick Replies endpoint
app.post('/api/quick-replies', async (req, res) => {
  try {
    const { message, conversation } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    const quickRepliesPrompt = `Based on this customer message, suggest 3 short quick reply options (under 10 words each) that the user might want to send. Respond with ONLY a JSON array:

["reply 1", "reply 2", "reply 3"]

Message: "${message}"
${conversation ? `Context: ${conversation.slice(-2).map(m => m.text).join(' ')}` : ''}

JSON array:`;

    try {
      const response = await callAI(quickRepliesPrompt, {
        maxTokens: 50,
        temperature: 0.7,
        systemPrompt: 'You are a UX expert. Suggest helpful quick replies.'
      });

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const replies = JSON.parse(jsonMatch[0]);
        res.json({ replies: replies.slice(0, 3) });
      } else {
        res.json({ replies: [] });
      }
    } catch (error) {
      res.json({ replies: [] });
    }
  } catch (error) {
    console.error('Quick replies error:', error);
    res.json({ replies: [] });
  }
});

// AI Conversation Summary endpoint
app.post('/api/summarize-conversation', async (req, res) => {
  try {
    const { conversation } = req.body;
    
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ error: 'Conversation array is required' });
    }

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    const conversationText = conversation.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    
    const summaryPrompt = `Summarize this customer support conversation in 2-3 sentences. Include: main issue, user's concern, and suggested solution.

Conversation:
${conversationText}

Summary:`;

    try {
      const summary = await callAI(summaryPrompt, {
        maxTokens: 100,
        temperature: 0.5,
        systemPrompt: 'You are a customer support expert. Create concise summaries.'
      });

      res.json({ summary: summary.trim() });
    } catch (error) {
      res.json({ summary: 'Customer support conversation summary.' });
    }
  } catch (error) {
    console.error('Conversation summary error:', error);
    res.json({ summary: 'Customer support conversation summary.' });
  }
});

// AI Smart Escalation endpoint
app.post('/api/should-escalate', async (req, res) => {
  try {
    const { message, conversation, sentiment, intent } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    const escalationPrompt = `Should this customer support issue be escalated to a human agent? Consider:
- User frustration level
- Complexity of issue
- Repeated questions
- Safety concerns

Respond with ONLY: "yes" or "no"

Message: "${message}"
Sentiment: ${sentiment || 'neutral'}
Intent: ${intent || 'general'}
${conversation ? `Conversation length: ${conversation.length} messages` : ''}

Escalate (yes/no):`;

    try {
      const response = await callAI(escalationPrompt, {
        maxTokens: 5,
        temperature: 0.2
      });

      const shouldEscalate = response.toLowerCase().trim().includes('yes');
      
      // Auto-escalate for safety issues or high urgency
      const autoEscalate = intent === 'safety' || sentiment === 'urgent' || sentiment === 'frustrated';
      
      res.json({ 
        escalate: shouldEscalate || autoEscalate,
        reason: shouldEscalate ? 'Complex issue requiring human attention' : 'AI can handle this'
      });
    } catch (error) {
      res.json({ escalate: intent === 'safety', reason: 'Default escalation logic' });
    }
  } catch (error) {
    console.error('Escalation check error:', error);
    res.json({ escalate: false, reason: 'Error checking escalation' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Hugging Face Proxy' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend proxy server running on http://localhost:${PORT}`);
  console.log(`✅ AI Provider: ${AI_PROVIDER.toUpperCase()}`);
  console.log(`✅ AI Model: ${AI_MODEL}`);
  console.log(`✅ API Key: ${AI_API_KEY ? 'Loaded' : 'Not found - Please set REACT_APP_AI_API_KEY'}`);
  if (!AI_API_KEY) {
    console.log(`\n⚠️  Setup Instructions:`);
    console.log(`   1. Get API key from: https://openrouter.ai/keys (recommended)`);
    console.log(`   2. Add to .env.local: REACT_APP_AI_API_KEY=your_key_here`);
    console.log(`   3. Restart server: npm run dev\n`);
  }
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`   Please stop the process using port ${PORT} or use a different port.`);
    console.error(`   To find the process: netstat -ano | findstr :${PORT}`);
    console.error(`   To kill it: taskkill /F /PID <PID>`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});


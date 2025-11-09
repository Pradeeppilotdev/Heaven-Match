/**
 * API Client with Authentication Support
 * Provides authenticated API calls with automatic token injection and 401 handling
 */

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('hm_token');
};

// Helper to check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Helper to get user email
export const getUserEmail = () => {
  return localStorage.getItem('hm_email');
};

// Logout and clear session
export const logout = async () => {
  try {
    const token = getAuthToken();
    if (token) {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('hm_token');
    localStorage.removeItem('hm_email');
    window.location.href = '/login';
  }
};

// Check session validity
export const checkSession = async () => {
  try {
    const token = getAuthToken();
    if (!token) return false;

    const response = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (response.status === 401) {
      // Session expired
      localStorage.removeItem('hm_token');
      localStorage.removeItem('hm_email');
      return false;
    }

    return response.ok;
  } catch (error) {
    console.error('Session check error:', error);
    return false;
  }
};

// Generic authenticated API call
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include'
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    localStorage.removeItem('hm_token');
    localStorage.removeItem('hm_email');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'API request failed');
  }

  return data;
};

// ============================================================================
// AUTH API METHODS
// ============================================================================

export const requestOTP = async (email) => {
  const response = await fetch(`${BASE_URL}/api/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to request OTP');
  return data;
};

export const verifyOTP = async (email, otp) => {
  const response = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, otp })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Invalid OTP');

  // Store token
  localStorage.setItem('hm_token', data.token);
  localStorage.setItem('hm_email', data.email);

  return data;
};

export const loginWithQR = async (email, code) => {
  const response = await fetch(`${BASE_URL}/api/auth/login-qr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, code })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Invalid code');

  // Store token
  localStorage.setItem('hm_token', data.token);
  localStorage.setItem('hm_email', data.email);

  return data;
};

// ============================================================================
// AI API METHODS
// ============================================================================

export const chat = async (prompt) => {
  return apiCall('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt })
  });
};

export const detectIntent = async (message, formToken) => {
  return apiCall('/api/detect-intent', {
    method: 'POST',
    body: JSON.stringify({ message, formToken })
  });
};

export const extractInfo = async (conversation, formToken) => {
  return apiCall('/api/extract-info', {
    method: 'POST',
    body: JSON.stringify({ conversation, formToken })
  });
};

export const smartRoute = async (intent, message, urgency, formToken) => {
  return apiCall('/api/smart-route', {
    method: 'POST',
    body: JSON.stringify({ intent, message, urgency, formToken })
  });
};

export const faqSearch = async (query, conversation, formToken) => {
  return apiCall('/api/faq-search', {
    method: 'POST',
    body: JSON.stringify({ query, conversation, formToken })
  });
};

export const createTicket = async (ticketData, formToken) => {
  return apiCall('/api/create-ticket', {
    method: 'POST',
    body: JSON.stringify({ ...ticketData, formToken })
  });
};

export const analyzeSentiment = async (message, conversation, formToken) => {
  return apiCall('/api/analyze-sentiment', {
    method: 'POST',
    body: JSON.stringify({ message, conversation, formToken })
  });
};

export const detectLanguage = async (message, formToken) => {
  return apiCall('/api/detect-language', {
    method: 'POST',
    body: JSON.stringify({ message, formToken })
  });
};

export const getQuickReplies = async (message, conversation, formToken) => {
  return apiCall('/api/quick-replies', {
    method: 'POST',
    body: JSON.stringify({ message, conversation, formToken })
  });
};

export const summarizeConversation = async (conversation, formToken) => {
  return apiCall('/api/summarize-conversation', {
    method: 'POST',
    body: JSON.stringify({ conversation, formToken })
  });
};

export const shouldEscalate = async (message, conversation, sentiment, intent, formToken) => {
  return apiCall('/api/should-escalate', {
    method: 'POST',
    body: JSON.stringify({ message, conversation, sentiment, intent, formToken })
  });
};

// ============================================================================
// QR CODE SETUP
// ============================================================================

export const setupQR = async () => {
  return apiCall('/api/auth/setup-qr', {
    method: 'POST'
  });
};

export const verifyQRSetup = async (code) => {
  return apiCall('/api/auth/verify-qr-setup', {
    method: 'POST',
    body: JSON.stringify({ code })
  });
};

export const disableQR = async () => {
  return apiCall('/api/auth/disable-qr', {
    method: 'POST'
  });
};

export default {
  // Auth
  isAuthenticated,
  getUserEmail,
  checkSession,
  requestOTP,
  verifyOTP,
  loginWithQR,
  logout,

  // AI
  chat,
  detectIntent,
  extractInfo,
  smartRoute,
  faqSearch,
  createTicket,
  analyzeSentiment,
  detectLanguage,
  getQuickReplies,
  summarizeConversation,
  shouldEscalate,

  // QR
  setupQR,
  verifyQRSetup,
  disableQR
};


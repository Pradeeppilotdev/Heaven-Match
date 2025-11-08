/**
 * Security Utilities for Recommendations Page
 * Implements input sanitization, data validation, encryption, and security monitoring
 */

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters and patterns
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick, onerror, etc.)
    .replace(/&lt;script/gi, '') // Remove encoded script tags
    .replace(/&lt;iframe/gi, '') // Remove encoded iframe tags
    .trim();
};

/**
 * Validate profile data structure
 * @param {Object} profile - Profile object to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateProfile = (profile) => {
  const errors = [];
  
  if (!profile || typeof profile !== 'object') {
    return { valid: false, errors: ['Profile is not a valid object'] };
  }
  
  // Required fields
  if (!profile.id || typeof profile.id !== 'string') {
    errors.push('Profile ID is missing or invalid');
  }
  
  if (!profile.name || typeof profile.name !== 'string' || profile.name.length > 100) {
    errors.push('Profile name is missing, invalid, or too long');
  }
  
  if (profile.age && (typeof profile.age !== 'number' || profile.age < 18 || profile.age > 100)) {
    errors.push('Profile age is invalid');
  }
  
  // Sanitize string fields
  if (profile.name) profile.name = sanitizeInput(profile.name);
  if (profile.bio) profile.bio = sanitizeInput(profile.bio);
  if (profile.profession) profile.profession = sanitizeInput(profile.profession);
  if (profile.education) profile.education = sanitizeInput(profile.education);
  if (profile.location) profile.location = sanitizeInput(profile.location);
  
  // Validate interests array
  if (profile.interests && !Array.isArray(profile.interests)) {
    errors.push('Interests must be an array');
  } else if (profile.interests) {
    profile.interests = profile.interests.map(interest => sanitizeInput(String(interest))).filter(Boolean);
  }
  
  // Validate image URL
  if (profile.image && typeof profile.image === 'string') {
    // Basic URL validation
    try {
      new URL(profile.image);
    } catch (e) {
      // If not a valid URL, it might be a relative path or data URI - allow it
      if (!profile.image.startsWith('/') && !profile.image.startsWith('data:')) {
        errors.push('Profile image URL is invalid');
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitizedProfile: profile
  };
};

/**
 * Simple encryption for sensitive data in localStorage
 * Note: This is client-side encryption for basic protection. For production, use server-side encryption.
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted string
 */
export const encryptLocalData = (data) => {
  if (!data) return '';
  
  try {
    const key = localStorage.getItem('heavenMatch_encryptionKey') || generateEncryptionKey();
    if (!localStorage.getItem('heavenMatch_encryptionKey')) {
      localStorage.setItem('heavenMatch_encryptionKey', key);
    }
    
    // Simple XOR encryption (for basic protection)
    // In production, use proper encryption libraries like crypto-js
    const encrypted = btoa(JSON.stringify(data))
      .split('')
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
      .join('');
    
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
    return data; // Return original if encryption fails
  }
};

/**
 * Decrypt data from localStorage
 * @param {string} encryptedData - Encrypted data string
 * @returns {any} Decrypted data
 */
export const decryptLocalData = (encryptedData) => {
  if (!encryptedData) return null;
  
  try {
    const key = localStorage.getItem('heavenMatch_encryptionKey');
    if (!key) return encryptedData; // No key means data wasn't encrypted
    
    const decoded = atob(encryptedData);
    const decrypted = decoded
      .split('')
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
      .join('');
    
    return JSON.parse(atob(decrypted));
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Generate a simple encryption key
 * @returns {string} Encryption key
 */
const generateEncryptionKey = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Track profile views to prevent excessive viewing/scraping
 */
const profileViewStore = new Map();

/**
 * Check if user can view a profile (rate limiting for profile views)
 * @param {string} profileId - Profile ID
 * @returns {Object} - { allowed: boolean, remaining: number, resetTime: number }
 */
export const checkProfileViewLimit = (profileId) => {
  const userId = getUserIdentifier();
  const key = `view_${userId}_${profileId}`;
  const now = Date.now();
  
  const record = profileViewStore.get(key);
  const maxViews = 3; // Max 3 views per profile per hour
  const windowMs = 3600000; // 1 hour
  
  if (!record || (now - record.windowStart) > windowMs) {
    profileViewStore.set(key, {
      count: 1,
      windowStart: now,
      profileId,
      userId
    });
    return {
      allowed: true,
      remaining: maxViews - 1,
      resetTime: now + windowMs
    };
  }
  
  if (record.count >= maxViews) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.windowStart + windowMs,
      message: 'Profile view limit reached. Please try again later.'
    };
  }
  
  record.count++;
  profileViewStore.set(key, record);
  
  return {
    allowed: true,
    remaining: maxViews - record.count,
    resetTime: record.windowStart + windowMs
  };
};

/**
 * Get user identifier for tracking
 * @returns {string} User identifier
 */
const getUserIdentifier = () => {
  let userId = localStorage.getItem('heavenMatch_userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('heavenMatch_userId', userId);
  }
  return userId;
};

/**
 * Generate browser fingerprint for request tracking
 * @returns {string} Browser fingerprint
 */
export const generateBrowserFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('HeavenMatch', 2, 2);
  
  const fingerprint = {
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    canvas: canvas.toDataURL().substring(0, 50),
    userAgent: navigator.userAgent.substring(0, 50)
  };
  
  return btoa(JSON.stringify(fingerprint)).substring(0, 32);
};

/**
 * Security event logger
 */
const securityEvents = [];

/**
 * Log security event
 * @param {string} eventType - Type of security event
 * @param {Object} details - Event details
 */
export const logSecurityEvent = (eventType, details = {}) => {
  const event = {
    type: eventType,
    timestamp: Date.now(),
    userId: getUserIdentifier(),
    fingerprint: generateBrowserFingerprint(),
    details
  };
  
  securityEvents.push(event);
  
  // Keep only last 100 events in memory
  if (securityEvents.length > 100) {
    securityEvents.shift();
  }
  
  // In production, send to security monitoring service
  if (eventType.includes('SUSPICIOUS') || eventType.includes('ATTACK')) {
    console.warn('Security Event:', event);
    // TODO: Send to security monitoring API
  }
  
  // Store in localStorage for persistence (limited)
  try {
    const stored = JSON.parse(localStorage.getItem('heavenMatch_securityLog') || '[]');
    stored.push(event);
    // Keep only last 50 events in localStorage
    const limited = stored.slice(-50);
    localStorage.setItem('heavenMatch_securityLog', JSON.stringify(limited));
  } catch (e) {
    console.error('Failed to store security event:', e);
  }
};

/**
 * Get security events
 * @returns {Array} Array of security events
 */
export const getSecurityEvents = () => {
  return [...securityEvents];
};

/**
 * Detect suspicious activity patterns
 * @param {string} action - Action being performed
 * @returns {boolean} True if suspicious
 */
export const detectSuspiciousActivity = (action) => {
  const userId = getUserIdentifier();
  const now = Date.now();
  const key = `activity_${userId}`;
  
  let activity = JSON.parse(sessionStorage.getItem(key) || '[]');
  
  // Filter activities from last 5 minutes
  activity = activity.filter(a => (now - a.timestamp) < 300000);
  
  // Check for rapid-fire actions (potential bot)
  const rapidActions = activity.filter(a => (now - a.timestamp) < 10000);
  if (rapidActions.length > 20) {
    logSecurityEvent('SUSPICIOUS_RAPID_ACTIONS', {
      count: rapidActions.length,
      action
    });
    return true;
  }
  
  // Check for pattern-based actions (potential scraping)
  const actionCounts = {};
  activity.forEach(a => {
    actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
  });
  
  const repeatedAction = Object.entries(actionCounts).find(([_, count]) => count > 15);
  if (repeatedAction) {
    logSecurityEvent('SUSPICIOUS_PATTERN', {
      action: repeatedAction[0],
      count: repeatedAction[1]
    });
    return true;
  }
  
  // Record current action
  activity.push({ action, timestamp: now });
  sessionStorage.setItem(key, JSON.stringify(activity));
  
  return false;
};

/**
 * Validate and sanitize profile array
 * @param {Array} profiles - Array of profiles
 * @returns {Array} Validated and sanitized profiles
 */
export const validateAndSanitizeProfiles = (profiles) => {
  if (!Array.isArray(profiles)) {
    logSecurityEvent('INVALID_DATA_STRUCTURE', { type: 'profiles' });
    return [];
  }
  
  const validProfiles = [];
  
  profiles.forEach((profile, index) => {
    const validation = validateProfile(profile);
    if (validation.valid) {
      validProfiles.push(validation.sanitizedProfile);
    } else {
      logSecurityEvent('INVALID_PROFILE_DETECTED', {
        index,
        errors: validation.errors,
        profileId: profile?.id
      });
    }
  });
  
  return validProfiles;
};

/**
 * Secure localStorage operations with encryption for sensitive data
 */
export const secureLocalStorage = {
  setItem: (key, value, encrypt = false) => {
    try {
      const data = encrypt ? encryptLocalData(value) : value;
      localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to set ${key}:`, error);
      logSecurityEvent('STORAGE_ERROR', { key, error: error.message });
    }
  },
  
  getItem: (key, decrypt = false) => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      if (decrypt) {
        return decryptLocalData(data);
      }
      
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      logSecurityEvent('STORAGE_ERROR', { key, error: error.message });
      return null;
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
    }
  }
};


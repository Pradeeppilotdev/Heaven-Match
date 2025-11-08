/**
 * Rate Limiter Utility
 * Prevents API abuse by limiting requests per user/IP within a timeframe
 */

// In-memory store (in production, use Redis or similar)
const requestStore = new Map();

/**
 * Rate limit configuration
 */
const RATE_LIMITS = {
  recommendations: {
    maxRequests: 10, // Max requests per window
    windowMs: 60000, // 1 minute window
    keyPrefix: 'rec_'
  },
  chatbot: {
    maxRequests: 20, // Max requests per window
    windowMs: 60000, // 1 minute window
    keyPrefix: 'chat_'
  },
  profileRefresh: {
    maxRequests: 5, // Max requests per window
    windowMs: 60000, // 1 minute window
    keyPrefix: 'refresh_'
  }
};

/**
 * Get a unique identifier for the user (browser fingerprint)
 */
const getUserIdentifier = () => {
  // Use localStorage to create a semi-persistent identifier
  let userId = localStorage.getItem('heavenMatch_userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('heavenMatch_userId', userId);
  }
  return userId;
};

/**
 * Check if a request should be rate limited
 * @param {string} type - Type of request ('recommendations', 'chatbot', 'profileRefresh')
 * @returns {Object} - { allowed: boolean, remaining: number, resetTime: number }
 */
export const checkRateLimit = (type = 'recommendations') => {
  const config = RATE_LIMITS[type] || RATE_LIMITS.recommendations;
  const userId = getUserIdentifier();
  const key = `${config.keyPrefix}${userId}`;
  
  const now = Date.now();
  const record = requestStore.get(key);
  
  if (!record || (now - record.windowStart) > config.windowMs) {
    // New window or expired window
    requestStore.set(key, {
      count: 1,
      windowStart: now
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    };
  }
  
  if (record.count >= config.maxRequests) {
    // Rate limit exceeded
    const resetTime = record.windowStart + config.windowMs;
    return {
      allowed: false,
      remaining: 0,
      resetTime: resetTime,
      message: `Rate limit exceeded. Please wait ${Math.ceil((resetTime - now) / 1000)} seconds.`
    };
  }
  
  // Increment count
  record.count++;
  requestStore.set(key, record);
  
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.windowStart + config.windowMs
  };
};

/**
 * Clear rate limit for a user (useful for testing or admin actions)
 */
export const clearRateLimit = (type = 'recommendations') => {
  const config = RATE_LIMITS[type] || RATE_LIMITS.recommendations;
  const userId = getUserIdentifier();
  const key = `${config.keyPrefix}${userId}`;
  requestStore.delete(key);
};

/**
 * Get current rate limit status
 */
export const getRateLimitStatus = (type = 'recommendations') => {
  const config = RATE_LIMITS[type] || RATE_LIMITS.recommendations;
  const userId = getUserIdentifier();
  const key = `${config.keyPrefix}${userId}`;
  
  const record = requestStore.get(key);
  if (!record) {
    return {
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs
    };
  }
  
  const now = Date.now();
  if ((now - record.windowStart) > config.windowMs) {
    return {
      remaining: config.maxRequests,
      resetTime: now + config.windowMs
    };
  }
  
  return {
    remaining: config.maxRequests - record.count,
    resetTime: record.windowStart + config.windowMs
  };
};

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestStore.entries()) {
    // Remove entries older than 5 minutes
    if ((now - record.windowStart) > 300000) {
      requestStore.delete(key);
    }
  }
}, 60000); // Run cleanup every minute


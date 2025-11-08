/**
 * API Utilities for handling rate limiting, retries, caching, and request queuing
 * Usage: Import these utilities in your component files to handle 429 errors
 */

// ==================== EXPONENTIAL BACKOFF RETRY ====================

/**
 * Retries a fetch operation with exponential backoff
 * @param {Function} fetchFn - Async function that performs the API call
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} baseDelay - Base delay in milliseconds (default: 1000)
 * @returns {Promise<any>} - Result from the fetch operation
 */
export async function fetchWithRetry(fetchFn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFn();
    } catch (error) {
      const is429Error = error.message.includes('429') || error.status === 429;
      const shouldRetry = is429Error && i < maxRetries - 1;
      
      if (shouldRetry) {
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
        console.log(`Rate limited (429). Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// ==================== CACHING ====================

class APICache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Get cached data or fetch new data
   * @param {string} cacheKey - Unique identifier for the cached data
   * @param {Function} fetchFn - Async function to fetch data if not cached
   * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
   * @returns {Promise<any>} - Cached or freshly fetched data
   */
  async getOrFetch(cacheKey, fetchFn, ttl = 300000) {
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cached.data;
    }
    
    console.log(`Cache miss for key: ${cacheKey}. Fetching...`);
    const data = await fetchWithRetry(fetchFn);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  }

  /**
   * Clear a specific cache entry
   * @param {string} cacheKey - Key to clear
   */
  clear(cacheKey) {
    this.cache.delete(cacheKey);
  }

  /**
   * Clear all cache entries
   */
  clearAll() {
    this.cache.clear();
  }

  /**
   * Remove expired cache entries
   * @param {number} ttl - Time to live in milliseconds
   */
  cleanup(ttl = 300000) {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiCache = new APICache();

// ==================== REQUEST QUEUE ====================

/**
 * Queue to manage concurrent API requests and rate limiting
 */
class RequestQueue {
  constructor(maxConcurrent = 1, minInterval = 6000) {
    this.queue = [];
    this.active = 0;
    this.maxConcurrent = maxConcurrent;
    this.minInterval = minInterval;
    this.lastRequest = 0;
  }

  /**
   * Add a request to the queue
   * @param {Function} fetchFn - Async function to execute
   * @returns {Promise<any>} - Result from the fetch operation
   */
  async add(fetchFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fetchFn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.active >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    const timeSinceLastRequest = Date.now() - this.lastRequest;
    if (timeSinceLastRequest < this.minInterval) {
      setTimeout(() => this.process(), this.minInterval - timeSinceLastRequest);
      return;
    }
    
    const { fetchFn, resolve, reject } = this.queue.shift();
    this.active++;
    this.lastRequest = Date.now();
    
    try {
      const result = await fetchWithRetry(fetchFn);
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.active--;
      this.process();
    }
  }

  /**
   * Get current queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.active,
      maxConcurrent: this.maxConcurrent
    };
  }
}

// Create a shared queue instance optimized for Gemini API limits
// 5 requests per 30 seconds = 1 request every 6 seconds
// Using 1 concurrent request with 6 second spacing for safety
export const apiQueue = new RequestQueue(1, 6000);

// ==================== ERROR HANDLER ====================

/**
 * Standardized error handler for API calls
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @returns {object} - Formatted error response
 */
export function handleAPIError(error, context = 'API call') {
  console.error(`Failed during ${context}:`, error);
  
  if (error.message.includes('429') || error.status === 429) {
    return {
      success: false,
      error: 'Too many requests. Please wait a moment and try again.',
      type: 'RATE_LIMIT'
    };
  }
  
  if (error.message.includes('401') || error.status === 401) {
    return {
      success: false,
      error: 'Authentication failed. Please check your API key.',
      type: 'AUTH_ERROR'
    };
  }
  
  if (error.message.includes('404') || error.status === 404) {
    return {
      success: false,
      error: 'API endpoint not found. Please check the model name.',
      type: 'NOT_FOUND'
    };
  }
  
  if (error.message.includes('500') || error.status === 500) {
    return {
      success: false,
      error: 'Server error. Please try again later.',
      type: 'SERVER_ERROR'
    };
  }
  
  return {
    success: false,
    error: error.message || 'An unexpected error occurred.',
    type: 'UNKNOWN_ERROR'
  };
}
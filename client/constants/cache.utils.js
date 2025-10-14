// localStorage cache utilities for habit data
export const CACHE_CONFIG = {
  MAX_CACHE_DAYS: 180, // 6 months cache
  TODAY_CACHE_MINUTES: 5,
  PAST_CACHE_HOURS: 24,
  VERSION: 'v1' // For cache invalidation when structure changes
};

export const CACHE_KEYS = {
  HABIT_LOGS: 'habit_logs_cache',
  CACHE_META: 'habit_cache_meta',
  USER_PREFIX: 'user_'
};

// Get user-specific cache key
export const getUserCacheKey = (userId, baseKey) => {
  return `${CACHE_KEYS.USER_PREFIX}${userId}_${baseKey}`;
};

// Save data to localStorage with expiry
export const setCacheData = (userId, date, data) => {
  try {
    const cacheKey = getUserCacheKey(userId, CACHE_KEYS.HABIT_LOGS);
    const metaKey = getUserCacheKey(userId, CACHE_KEYS.CACHE_META);
    
    // Get existing cache
    const existingCache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
    const existingMeta = JSON.parse(localStorage.getItem(metaKey) || '{}');
    
    // Create date key
    const dateKey = formatDateKey(date);
    const now = Date.now();
    const isToday = isDateToday(date);
    
    // Calculate expiry time
    const expiryMinutes = isToday ? CACHE_CONFIG.TODAY_CACHE_MINUTES : CACHE_CONFIG.PAST_CACHE_HOURS * 60;
    const expiryTime = now + (expiryMinutes * 60 * 1000);
    
    // Save data
    existingCache[dateKey] = {
      data,
      timestamp: now,
      version: CACHE_CONFIG.VERSION
    };
    
    existingMeta[dateKey] = {
      expiry: expiryTime,
      isToday,
      lastAccess: now
    };
    
    // Clean old cache before saving
    cleanExpiredCache(existingCache, existingMeta);
    
    localStorage.setItem(cacheKey, JSON.stringify(existingCache));
    localStorage.setItem(metaKey, JSON.stringify(existingMeta));
    
    console.log(`[Cache] Saved data for ${dateKey} (expires in ${expiryMinutes} minutes)`);
    return true;
  } catch (error) {
    console.error('[Cache] Error saving cache:', error);
    return false;
  }
};

// Get data from localStorage
export const getCacheData = (userId, date) => {
  try {
    const cacheKey = getUserCacheKey(userId, CACHE_KEYS.HABIT_LOGS);
    const metaKey = getUserCacheKey(userId, CACHE_KEYS.CACHE_META);
    
    const cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
    const meta = JSON.parse(localStorage.getItem(metaKey) || '{}');
    
    const dateKey = formatDateKey(date);
    const cacheEntry = cache[dateKey];
    const metaEntry = meta[dateKey];
    
    if (!cacheEntry || !metaEntry) {
      return null;
    }
    
    // Check version
    if (cacheEntry.version !== CACHE_CONFIG.VERSION) {
      console.log(`[Cache] Version mismatch for ${dateKey}, invalidating`);
      return null;
    }
    
    // Check expiry
    const now = Date.now();
    if (now > metaEntry.expiry) {
      console.log(`[Cache] Expired data for ${dateKey}`);
      return null;
    }
    
    // Update last access
    metaEntry.lastAccess = now;
    localStorage.setItem(metaKey, JSON.stringify(meta));
    
    console.log(`[Cache] Hit for ${dateKey}`);
    return cacheEntry.data;
  } catch (error) {
    console.error('[Cache] Error reading cache:', error);
    return null;
  }
};

// Check if cache is valid for a date
export const isCacheValid = (userId, date) => {
  try {
    const metaKey = getUserCacheKey(userId, CACHE_KEYS.CACHE_META);
    const meta = JSON.parse(localStorage.getItem(metaKey) || '{}');
    
    const dateKey = formatDateKey(date);
    const metaEntry = meta[dateKey];
    
    if (!metaEntry) return false;
    
    const now = Date.now();
    return now <= metaEntry.expiry;
  } catch (_error) {
    return false;
  }
};

// Clean expired cache entries
export const cleanExpiredCache = (cache, meta) => {
  const now = Date.now();
  const maxAge = CACHE_CONFIG.MAX_CACHE_DAYS * 24 * 60 * 60 * 1000;
  
  Object.keys(meta).forEach(dateKey => {
    const metaEntry = meta[dateKey];
    
    // Remove expired entries
    if (now > metaEntry.expiry) {
      delete cache[dateKey];
      delete meta[dateKey];
      console.log(`[Cache] Cleaned expired entry: ${dateKey}`);
      return;
    }
    
    // Remove very old entries
    if (now - metaEntry.lastAccess > maxAge) {
      delete cache[dateKey];
      delete meta[dateKey];
      console.log(`[Cache] Cleaned old entry: ${dateKey}`);
      return;
    }
  });
};

// Clear all cache for user
export const clearUserCache = (userId) => {
  try {
    const cacheKey = getUserCacheKey(userId, CACHE_KEYS.HABIT_LOGS);
    const metaKey = getUserCacheKey(userId, CACHE_KEYS.CACHE_META);
    
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(metaKey);
    
    console.log('[Cache] Cleared all cache for user');
    return true;
  } catch (error) {
    console.error('[Cache] Error clearing cache:', error);
    return false;
  }
};

// Get cache statistics
export const getCacheStats = (userId) => {
  try {
    const cacheKey = getUserCacheKey(userId, CACHE_KEYS.HABIT_LOGS);
    const metaKey = getUserCacheKey(userId, CACHE_KEYS.CACHE_META);
    
    const cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
    const meta = JSON.parse(localStorage.getItem(metaKey) || '{}');
    
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;
    
    Object.keys(meta).forEach(dateKey => {
      const metaEntry = meta[dateKey];
      if (now <= metaEntry.expiry) {
        validEntries++;
      } else {
        expiredEntries++;
      }
      
      if (cache[dateKey]) {
        totalSize += JSON.stringify(cache[dateKey]).length;
      }
    });
    
    return {
      validEntries,
      expiredEntries,
      totalSize,
      sizeKB: Math.round(totalSize / 1024)
    };
  } catch (_error) {
    return { validEntries: 0, expiredEntries: 0, totalSize: 0, sizeKB: 0 };
  }
};

// Helper functions
const formatDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const isDateToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return today.toDateString() === checkDate.toDateString();
};

// Clean expired cache on app start
export const initializeCache = (userId) => {
  try {
    const cacheKey = getUserCacheKey(userId, CACHE_KEYS.HABIT_LOGS);
    const metaKey = getUserCacheKey(userId, CACHE_KEYS.CACHE_META);
    
    const cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
    const meta = JSON.parse(localStorage.getItem(metaKey) || '{}');
    
    cleanExpiredCache(cache, meta);
    
    localStorage.setItem(cacheKey, JSON.stringify(cache));
    localStorage.setItem(metaKey, JSON.stringify(meta));
    
    const stats = getCacheStats(userId);
    console.log('[Cache] Initialized cache:', stats);
  } catch (error) {
    console.error('[Cache] Error initializing cache:', error);
  }
};
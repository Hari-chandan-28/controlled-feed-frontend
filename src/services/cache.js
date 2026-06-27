// Simple in-memory cache — survives tab switches within the same browser session
// Clears when page refreshes (which is fine)

const cache = new Map();

export const cacheGet = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

export const cacheSet = (key, data, ttlSeconds = 60) => {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

export const cacheDelete = (key) => cache.delete(key);
export const cacheClear = () => cache.clear();
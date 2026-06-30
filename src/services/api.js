import axios from 'axios';
import { cacheGet, cacheSet } from './cache';
import { cacheDelete } from './cache';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || ''
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}
);

API.interceptors.response.use((response) => response,
(error) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
// Add this after your API axios instance creation
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      console.warn('Rate limited — using cached data if available');
      // Don't throw — return empty data so UI doesn't break
      return Promise.resolve({
        data: error.config?._cachedData || [],
        _rateLimited: true,
      });
    }
    return Promise.reject(error);
  }
);
// Native browser EventSource — connects to the SSE stream on the backend.
// Returns the EventSource instance so the caller can close() it on unmount.
// EventSource is a native browser API — it does NOT go through axios,
// so we read the same VITE_API_URL env var directly here
const API_BASE = import.meta.env.VITE_API_URL || '';

// export const createLiveF1Stream = (onMessage, onError) => {
//   const token = localStorage.getItem('token');
//   const url = `${API_BASE}/api/f1/live/stream?token=${token}`;

//   const es = new EventSource(url);

//   es.onmessage = (event) => {
//     try {
//       const data = JSON.parse(event.data);
//       onMessage(data);
//     } catch (err) {
//       console.error('Failed to parse SSE data:', err);
//     }
//   };

//   es.onerror = (err) => {
//     console.error('SSE connection error:', err);
//     if (onError) onError(err);
//   };

//   return es;
// };
// In-flight request deduplication
// If the same request is already in progress, return the same promise
const inFlight = new Map();

export const dedupe = (key, requestFn) => {
  if (inFlight.has(key)) return inFlight.get(key);
  const promise = requestFn().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
};
export const getSessionContext = () => API.get('/api/f1/live/session-context');
export const getCircuitLayout = (circuitKey, year) =>
  API.get(`/api/f1/circuit/${circuitKey}/${year}`);
export const getAllCircuits = (year) => API.get(`/api/f1/circuits/${year}`);
export const getCurrentDrivers = () => API.get('/api/f1/drivers/current');

// Auth
export const signup = (data) => API.post('/api/auth/signup', data);
export const login = (data) => API.post('/api/auth/login', data);

// Profile
export const createProfile = (data) => API.post('/api/profile/create', data);
// export const getProfile = () => API.get('/api/profile/me');
export const uploadPicture = (formData) => API.post('/api/profile/upload-picture', formData);

// Feed

// YouTube
export const fetchF1Videos = () => API.get('/api/youtube/f1');
export const fetchICCVideos = () => API.get('/api/youtube/icc');

// F1 Dashboard
// export const getDriverStandings = () => API.get('/api/f1/standings');
// export const getConstructorStandings = () => API.get('/api/f1/constructors');
// export const getRaceResults = () => API.get('/api/f1/results');
// export const getRaceSchedule = () => API.get('/api/f1/schedule');
export const getLivePositions = () => API.get('/api/f1/live/positions');
export const getLiveTiming = () => API.get('/api/f1/live/timing');
export const getLiveIntervals = () => API.get('/api/f1/live/intervals');

// Add this export
export const invalidateProfileCache = () => {
  cacheDelete('profile');
};
// Cricket
// export const getLiveMatches = () => API.get('/api/cricket/live');
// export const getUpcomingMatches = () => API.get('/api/cricket/upcoming');
export const getScorecard = (matchId) => API.get(`/api/cricket/scorecard/${matchId}`);
export const updateUsername = (data) => API.put('/api/profile/update-name', data);
// Chat
export const askQuestion = (question) => API.post('/api/chat/ask', { question });
export const updateProfile = (data) => API.put('/api/profile/update', data);
export const createLiveF1Stream = (onMessage, onError) => {
  const token = localStorage.getItem('token');
  const url = `${API_BASE}/api/f1/live/stream?token=${token}`;

  const es = new EventSource(url);

  es.onopen = () => console.log('SSE connection opened');
  es.onmessage = (event) => {
    try {
      onMessage(JSON.parse(event.data));
    } catch (err) {
      console.error('Failed to parse SSE data:', err);
    }
  };
  es.onerror = (err) => {
    console.error('SSE connection error:', err);
    if (onError) onError(err);
  };

  return es;
};

// KEEP/UPDATE these:
// export const getArticlesFeed = () => API.get('/api/rss/feed');
export const getArticlesByCategory = (category) =>
  API.get(`/api/rss/articles?category=${category}`);
// export const getVideosByCategory = (category, page = 0, size = 18) =>
//   API.get(`/api/feed/videos/category?category=${category}&page=${page}&size=${size}`);
export const getRandomFeed = (size = 18) =>
  API.get(`/api/feed/videos/random?size=${size}`);
export const getFeed = (page = 0, size = 18) =>
  API.get(`/api/feed?page=${page}&pageSize=${size}`);
  
//Schedule 
export const getRaceDetail = (season, round) =>
  API.get(`/api/f1/race/${season}/${round}`);
export default API;

export const fetchVideosByCategory = (category) =>
  API.get(`/api/youtube/fetch?category=${category}`);

export const fetchAllVideos = () => API.get('/api/youtube/fetch/all');
// Cached version of getVideosByCategory
// Tab switching to F1 twice in 60s = 1 API call not 2
export const getVideosByCategory = async (category, page = 0, size = 20) => {
  const key = `videos-${category}-${page}-${size}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const res = await API.get(
    `/api/feed/videos/category?category=${category}&page=${page}&size=${size}`
  );
  cacheSet(key, res, 60); // cache 60 seconds
  return res;
};

// Cached version of getRandomFeed
// export const getRandomFeed = async (size = 20) => {
//   const key = `random-${size}`;
//   const cached = cacheGet(key);
//   if (cached) return cached;

//   const res = await API.get(`/api/feed/videos/random?size=${size}`);
//   cacheSet(key, res, 30); // cache 30 seconds
//   return res;
// };

// Cached version of getArticlesFeed
export const getArticlesFeed = async () => {
  const key = 'articles-feed';
  const cached = cacheGet(key);
  if (cached) return cached;

  const res = await API.get('/api/rss/feed');
  cacheSet(key, res, 120); // cache 2 minutes
  return res;
};

// Cached version of getProfile
// export const getProfile = async () => {
//   const key = 'profile';
//   const cached = cacheGet(key);
//   if (cached) return cached;

//   const res = await API.get('/api/profile/me');
//   cacheSet(key, res, 300); // cache 5 minutes
//   return res;
// };

// Cached F1 data — changes at most once per hour
export const getDriverStandings = async () => {
  const key = 'f1-standings';
  const cached = cacheGet(key);
  if (cached) return cached;

  const res = await API.get('/api/f1/standings');
  cacheSet(key, res, 3600); // cache 1 hour
  return res;
};

export const getConstructorStandings = async () => {
  const key = 'f1-constructors';
  const cached = cacheGet(key);
  if (cached) return cached;

  const res = await API.get('/api/f1/constructors');
  cacheSet(key, res, 3600);
  return res;
};

export const getRaceResults = async () => {
  const key = 'f1-results';
  const cached = cacheGet(key);
  if (cached) return cached;

  const res = await API.get('/api/f1/results');
  cacheSet(key, res, 3600);
  return res;
};

export const getRaceSchedule = async () => {
  const key = 'f1-schedule';
  const cached = cacheGet(key);
  if (cached) return cached;

  const res = await API.get('/api/f1/schedule');
  cacheSet(key, res, 3600);
  return res;
};

// Cricket — cache 30 seconds (live data changes)
export const getLiveMatches = async () => {
  const key = 'cricket-live';
  const cached = cacheGet(key);
  if (cached) return cached;

  const res = await API.get('/api/cricket/live');
  cacheSet(key, res, 30);
  return res;
};

export const getUpcomingMatches = async () => {
  const key = 'cricket-upcoming';
  const cached = cacheGet(key);
  if (cached) return cached;

  const res = await API.get('/api/cricket/upcoming');
  cacheSet(key, res, 3600);
  return res;
};
export const getProfile = () =>
  dedupe('profile', async () => {
    const key = 'profile';
    const cached = cacheGet(key);
    if (cached) return cached;
    const res = await API.get('/api/profile/me');
    cacheSet(key, res, 300);
    return res;
  });
import axios from 'axios';

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
export const getProfile = () => API.get('/api/profile/me');
export const uploadPicture = (formData) => API.post('/api/profile/upload-picture', formData);

// Feed
export const getFeed = (page = 0, size = 10) => API.get(`/api/feed?page=${page}&pageSize=${size}`);

// YouTube
export const fetchF1Videos = () => API.get('/api/youtube/f1');
export const fetchICCVideos = () => API.get('/api/youtube/icc');

// RSS
export const getF1Articles = () => API.get('/api/rss/f1');
export const getCricketArticles = () => API.get('/api/rss/cricket');
export const getArticlesFeed = () => API.get('/api/rss/feed');

// F1 Dashboard
export const getDriverStandings = () => API.get('/api/f1/standings');
export const getConstructorStandings = () => API.get('/api/f1/constructors');
export const getRaceResults = () => API.get('/api/f1/results');
export const getRaceSchedule = () => API.get('/api/f1/schedule');
export const getLivePositions = () => API.get('/api/f1/live/positions');
export const getLiveTiming = () => API.get('/api/f1/live/timing');
export const getLiveIntervals = () => API.get('/api/f1/live/intervals');

// Cricket
export const getLiveMatches = () => API.get('/api/cricket/live');
export const getUpcomingMatches = () => API.get('/api/cricket/upcoming');
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
    
export default API;

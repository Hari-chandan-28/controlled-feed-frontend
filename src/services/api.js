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

// Chat
export const askQuestion = (question) => API.post('/api/chat/ask', { question });
export const updateProfile = (data) => API.put('/api/profile/update', data);
export default API;
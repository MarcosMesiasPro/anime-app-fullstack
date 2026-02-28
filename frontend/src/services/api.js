import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me')
};

// Favorites endpoints
export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (animeData) => api.post('/favorites', animeData),
  remove: (id) => api.delete(`/favorites/${id}`),
  removeByAnimeId: (animeId) => api.delete(`/favorites/anime/${animeId}`),
  check: (animeId) => api.get(`/favorites/check/${animeId}`)
};

// Comments endpoints
export const commentsAPI = {
  getByAnime: (animeId, params) => api.get(`/comments/anime/${animeId}`, { params }),
  create: (commentData) => api.post('/comments', commentData),
  update: (id, text) => api.put(`/comments/${id}`, { text }),
  delete: (id) => api.delete(`/comments/${id}`),
  toggleLike: (id) => api.post(`/comments/${id}/like`),
  getStats: (animeId) => api.get(`/comments/stats/${animeId}`)
};

// User endpoints
export const userAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put('/users/profile', data),
  getFavorites: (userId, params) => api.get(`/users/${userId}/favorites`, { params }),
  getComments: (userId, params) => api.get(`/users/${userId}/comments`, { params })
};

export default api;
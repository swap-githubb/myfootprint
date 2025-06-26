import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
});

// Interceptor to add the auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth ---
export const registerUser = (credentials) => apiClient.post('/users/register', credentials);
export const loginUser = (credentials) => {
    const formData = new URLSearchParams({ username: credentials.username, password: credentials.password });
    return apiClient.post('/token', formData);
};

// --- Users & Follows ---
export const getUserProfile = (username) => apiClient.get(`/users/${username}`);
export const followUser = (username) => apiClient.post(`/users/${username}/follow`);
export const unfollowUser = (username) => apiClient.delete(`/users/${username}/follow`);

// --- Content & Feed ---
export const getContentForUser = (username) => apiClient.get(`/users/${username}/content`);
export const getFeed = () => apiClient.get('/feed');
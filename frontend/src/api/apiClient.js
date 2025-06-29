import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
});

// Interceptor to add the auth token to every subsequent request after login
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


/**
 * Registers a new user.
 * @param {object} credentials - { username, email, password }
 */
export const registerUser = async (credentials) => {
  const response = await apiClient.post('/users/register', credentials);
  return response.data;
};

/**
 * Logs a user in to get an access token.
 * @param {object} credentials - { username, password }
 */
export const loginUser = async (credentials) => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);

  const response = await apiClient.post('/token', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
};



/**
 * Fetches a user's public profile information.
 * @param {string} username
 */
export const getUserProfile = async (username) => {
  const response = await apiClient.get(`/users/${username}`);
  return response.data;
};

/**
 * Follows another user.
 * @param {string} username
 */
export const followUser = (username) => apiClient.post(`/users/${username}/follow`);

/**
 * Unfollows another user.
 * @param {string} username
 */
export const unfollowUser = (username) => apiClient.delete(`/users/${username}/follow`);

// For searching users by username
export const searchUsers = async (query) => {
  const response = await apiClient.get(`/search/users?query=${query}`);
  return response.data;
};

// For getting the list of users that the user is following
export const getFollowing = async (username) => {
  const response = await apiClient.get(`/users/${username}/following`);
  return response.data;
};

// For getting the list of followers for the user
export const getFollowers = async (username) => {
  const response = await apiClient.get(`/users/${username}/followers`);
  return response.data;
};


/**
 * Fetches all content items for a specific user.
 * @param {string} username
 */
export const getContentForUser = async (username) => {
  const response = await apiClient.get(`/users/${username}/content`);
  return response.data;
};

/**
 * Fetches the personalized feed for the currently logged-in user.
 */
export const getFeed = async () => {
  const response = await apiClient.get('/feed');
  return response.data;
};
import axios from 'axios';

const API_BASE_URL = "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const registerUser = async (credentials) => {
  // credentials = { username, email, password }
  const response = await apiClient.post('/users/register', credentials);
  return response.data;
};

export const loginUser = async (credentials) => {
  // credentials = { username, password }
  const formData = new URLSearchParams();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);

  const response = await apiClient.post('/token', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
};
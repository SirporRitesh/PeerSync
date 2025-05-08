// src/services/api.js
import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attaches the JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Authentication ---
export const login = async (email, password) => {
  const sanitizedEmail = email.trim().toLowerCase(); // Sanitize email
  const response = await apiClient.post('/auth/login', { email: sanitizedEmail, password });
  return response.data; // { message: '...', token: '...' }
};

export const signup = async (userData) => {
  try {
    const response = await apiClient.post('/auth/signup', {
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      email: String(userData.email).trim(), // Ensure email is properly formatted
      password: userData.password,
      workspaceName: userData.workspaceName,
    });
    return response.data; // { message: '...', token: '...', user: { ... } }
  } catch (error) {
    throw error; // Rethrow error for handling in AuthContext
  }
};

export const getUserInfo = async (token) => {
  const response = await apiClient.get('/auth/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data; // Ensure your backend has an endpoint to return user info
};

// --- Workspaces ---
export const fetchWorkspaces = async () => {
  const response = await apiClient.get('/workspace');
  return response.data; // Array of workspaces
};

export const fetchWorkspaceDetails = async (workspaceId) => {
  const response = await apiClient.get(`/workspace/${workspaceId}`);
  return response.data; // Single workspace object with channels populated
};

// --- Channels ---
export const fetchChannelDetails = async (channelId) => {
  const response = await apiClient.get(`/channels/${channelId}`);
  return response.data; // Channel object potentially with messages
};

// --- Messages ---
export const postMessage = async (channelId, content) => {
  const response = await apiClient.post('/messages', { channelId, content });
  return response.data; // { message: 'Message sent', message: populatedMessageObject }
};

export const fetchMessagesForChannel = async (channelId) => {
  const response = await apiClient.get(`/messages/${channelId}/messages`);
  return response.data; // Array of messages
};

// Add other API calls as needed (create workspace, create channel, invite user, etc.)

export default apiClient; // Export the configured instance if needed elsewhere
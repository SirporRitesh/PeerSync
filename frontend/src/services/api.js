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
    // Prepare the payload based on signup action
    const payload = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      email: String(userData.email).trim().toLowerCase(),
      password: userData.password,
    };

    // Add workspace-specific data based on the action
    if (userData.inviteCode) {
      payload.inviteCode = userData.inviteCode.toUpperCase();
      payload.action = 'join';
    } else if (userData.workspaceName) {
      payload.workspaceName = userData.workspaceName.trim();
      payload.action = 'create';
    }

    console.log('Attempting signup with payload:', {
      ...payload,
      password: '[REDACTED]'
    });

    const response = await apiClient.post('/auth/signup', payload);
    console.log('Signup success response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Signup API error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw error;
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

export const joinWorkspace = async (inviteCode) => {
  const response = await apiClient.post('/workspace/join', { inviteCode });
  return response.data; // { message: 'Successfully joined workspace' }
};

// Add other API calls as needed (create workspace, create channel, invite user, etc.)

export default apiClient; // Export the configured instance if needed elsewhere


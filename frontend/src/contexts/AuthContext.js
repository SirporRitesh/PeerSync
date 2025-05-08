import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode as jwtDecode } from 'jwt-decode'; // Correct import for jwt-decode
import * as api from '../services/api'; // Import API functions

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start loading until checked
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const decoded = jwtDecode(storedToken); // Now contains userId, username
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          // Fetch full user details or rely on token + initial login/signup response
          const storedUserDetails = localStorage.getItem('userDetails');
          if (storedUserDetails) {
            setUser(JSON.parse(storedUserDetails));
          } else {
            setUser({ userId: decoded.userId, username: decoded.username }); // Fallback
          }
          setIsAuthenticated(true);
        } else {
          // Token expired
          localStorage.removeItem('token');
          localStorage.removeItem('userDetails');
        }
      }
    } catch (e) {
      console.error('AuthContext: Error processing token from localStorage', e);
      localStorage.removeItem('token'); // Clear invalid token
      localStorage.removeItem('userDetails');
    } finally {
      setIsLoading(false); // Finished initial check
    }
  }, []);

  const loginUser = async (email, password) => {
    setError(null); // Clear previous errors
    try {
      const data = await api.login(email, password); // data.token, data.user
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userDetails', JSON.stringify(data.user)); // Store full user details
        setToken(data.token);
        setUser(data.user); // Set user with username, firstName, etc.
        setIsAuthenticated(true);
        return true; // Indicate success
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check credentials.';
      console.error('AuthContext: Login error -', errorMessage);
      setError(errorMessage);
      localStorage.removeItem('token');
      localStorage.removeItem('userDetails');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      return false; // Indicate failure
    }
  };

  const signupUser = async (userData) => {
    setError(null);
    try {
      console.log('Signup Payload Sent to API:', userData);

      // Make sure email is a string before sending
      const payload = {
        ...userData,
        email: String(userData.email).trim(), // Ensure email is a string and trim it
      };

      const data = await api.signup(payload);
      console.log('Signup API Response:', data);

      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userDetails', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      }
    } catch (err) {
      console.error('Signup API Error:', err);
      const errorMessage =
        err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      return false;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userDetails'); // Clear userDetails on logout
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    console.log('AuthContext: Logout successful');
  };

  const value = {
    token,
    user, // contains { userId, username, firstName, lastName, email }
    isAuthenticated,
    isLoading,
    error,
    loginUser,
    signupUser,
    logoutUser,
    clearError: () => setError(null), // Helper to clear errors manually if needed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily consume the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const signup = async (userData) => {
  console.log('Mock Signup API Called:', userData);
  return {
    token: 'mockToken123',
    user: {
      userId: 'mockUserId',
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
    },
  };
};
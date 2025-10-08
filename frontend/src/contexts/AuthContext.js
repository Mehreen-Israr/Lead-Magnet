import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          console.log('🔐 Checking auth status with token:', token.substring(0, 20) + '...');
          console.log('🔐 API URL:', `${API_BASE_URL}/api/auth/me`);
          
          // Verify token with backend with retry logic
          let response;
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            try {
              response = await axios.get(`${API_BASE_URL}/api/auth/me`);
              break; // Success, exit retry loop
            } catch (error) {
              retryCount++;
              console.log(`🔐 Auth check attempt ${retryCount} failed:`, error.response?.status, error.message);
              
              if (retryCount >= maxRetries) {
                throw error; // Re-throw the error after max retries
              }
              
              // Wait before retry (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }
          
          if (response && response.data.success) {
            console.log('✅ Auth check successful');
            setUser(response.data.user);
            setIsLoggedIn(true);
          } else {
            console.log('❌ Auth check failed - invalid response');
            // Token is invalid, clear storage
            logout();
          }
        } catch (error) {
          console.error('❌ Auth check failed after retries:', error);
          console.error('❌ Error response:', error.response?.data);
          console.error('❌ Error status:', error.response?.status);
          
          // Only logout if it's a 401 (unauthorized) or 403 (forbidden)
          // Don't logout for network errors or server errors
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('🔐 Token is invalid, logging out');
            logout();
          } else {
            console.log('🔐 Network/server error, keeping user logged in with cached data');
            // Keep user logged in with cached data for network/server errors
            try {
              const cachedUser = JSON.parse(userData);
              setUser(cachedUser);
              setIsLoggedIn(true);
            } catch (parseError) {
              console.error('❌ Failed to parse cached user data:', parseError);
              logout();
            }
          }
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
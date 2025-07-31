import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Récupère l'utilisateur du localStorage au démarrage
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setError(null);
        }
      } catch (error) {
        setUser(null);
        setError('Erreur lors de la vérification de l\'authentification');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      // First, get the CSRF token
      const csrfResponse = await axiosInstance.get('/api/csrf/');
      const csrfToken = csrfResponse.headers['x-csrftoken'];
      
      if (!csrfToken) {
        throw new Error('Failed to get CSRF token');
      }
      
      // Store the CSRF token in localStorage
      localStorage.setItem('csrftoken', csrfToken);
      
      // Make the login request with the CSRF token in headers
      const response = await axiosInstance.post('/api/token/', credentials, {
        headers: {
          'X-CSRFToken': csrfToken
        }
      });

      if (response.data) {
        // Store tokens and user data
        const { access, refresh, user } = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Set the default Authorization header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        setUser(user);
        setError(null);
        return true;
      } else {
        throw new Error('Login failed: No data received');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      setUser(null);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('csrftoken');
    
    // Clear axios headers
    delete axiosInstance.defaults.headers.common['Authorization'];
    delete axiosInstance.defaults.headers.common['X-CSRFToken'];
    
    setUser(null);
    setError(null);
    
    // Redirect to login
    window.location.href = '/login';
  };

  // Add token refresh logic
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axiosInstance.post('/api/token/refresh/', {
        refresh: refreshToken
      });
      
      const { access } = response.data;
      localStorage.setItem('access_token', access);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      return access;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
      throw error;
    }
  };

  // Add request interceptor to add auth token
  axiosInstance.interceptors.request.use(
    async (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle 401 errors and token refresh
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If error is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const newToken = await refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          logout();
          return Promise.reject(refreshError);
        }
      }
      
      // For 403 errors, log the user out
      if (error.response?.status === 403) {
        logout();
      }
      
      return Promise.reject(error);
    }
  );

  // Fonction pour vérifier si l'utilisateur est authentifié
  const isAuthenticated = () => {
    // Vérifie si l'utilisateur est dans le state et dans le localStorage
    const storedUser = localStorage.getItem('user');
    return user !== null && storedUser !== null;
  };

  const changePassword = async (passwordData) => {
    try {
      // Récupérer le token CSRF
      const csrfResponse = await axiosInstance.get('/api/csrf/');
      const csrfToken = csrfResponse.data.csrf_token;
      
      // Mettre à jour le mot de passe
      const response = await axiosInstance.post('/api/change-password/', passwordData, {
        headers: {
          'X-CSRFToken': csrfToken
        }
      });

      if (response.data && response.data.message) {
        return response.data;
      } else {
        throw new Error('Échec du changement de mot de passe');
      }
    } catch (error) {
      throw error.response?.data?.error || 'Erreur lors du changement de mot de passe';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated,
        changePassword
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
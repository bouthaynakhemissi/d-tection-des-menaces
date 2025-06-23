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
        const response = await fetch('/user_profile/', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Non connecté');
        const data = await response.json();
        setUser(data);
        setError(null);
        localStorage.setItem('user', JSON.stringify(data));
      } catch (err) {
        setUser(null);
        setError('Veuillez vous connecter');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axiosInstance.post('/login/', credentials);
      const userData = response.data.user || response.data;
      setUser(userData);
      setError(null);
      localStorage.setItem('user', JSON.stringify(userData));
      return {
        success: true,
        user: userData
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Échec de la connexion';
      setUser(null);
      setError(errorMessage);
      localStorage.removeItem('user');
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/logout/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        login,
        logout
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
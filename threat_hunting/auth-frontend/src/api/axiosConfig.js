import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // URL de votre backend Django
  withCredentials: true, // Important pour les cookies de session
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Intercepteur pour ajouter le token CSRF à chaque requête
axiosInstance.interceptors.request.use(
  async (config) => {
    // Récupérer le token CSRF depuis les cookies
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Gestion des réponses d'erreur
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si l'erreur est 401 et qu'on ne tente pas déjà de rafraîchir le token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Essayer de rafraîchir le token
        await axiosInstance.post('/users/refresh-token/');
        // Réessayer la requête originale
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Si le rafraîchissement échoue, rediriger vers la page de connexion
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
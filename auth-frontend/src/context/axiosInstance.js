import axios from 'axios';
import { getCookie } from '../utils/csrf';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true // important pour que le cookie soit envoyé !
});

// Ajouter le token CSRF à chaque requête
axiosInstance.interceptors.request.use(
    config => {
        const csrftoken = getCookie('csrftoken');
        if (csrftoken) {
            config.headers['X-CSRFToken'] = csrftoken;
        }
        return config;
    },
    error => Promise.reject(error)
);

export default axiosInstance;
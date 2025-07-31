import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, Button, TextField, Typography, Paper, Avatar,
  Alert, Checkbox, FormControlLabel, Stack, IconButton, Divider,
  Snackbar, CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import TwitterIcon from '@mui/icons-material/Twitter';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';
import securityBg from '../assets/arriere-plan.png';
import { getCookie } from '../utils/csrf';

// Configuration de l'instance axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Ajout d'un intercepteur pour gérer le token CSRF
axiosInstance.interceptors.request.use(
  (config) => {
    const csrftoken = getCookie('csrftoken');
    if (csrftoken) {
      config.headers['X-CSRFToken'] = csrftoken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Ajout d'un intercepteur pour gérer les réponses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Gérer l'erreur d'authentification
      console.error('Erreur d\'authentification:', error.response.data);
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// Style personnalisé pour les icônes des réseaux sociaux
const SocialIcon = styled('div')(({ theme, provider }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
  ...(provider === 'Google' && {
    backgroundColor: '#fff',
    color: '#4285F4',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      backgroundColor: '#f8f9fa',
      color: '#1a73e8',
    }
  }),
  ...(provider === 'Facebook' && {
    backgroundColor: '#3b5998',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#2d4373',
    }
  }),
  ...(provider === 'Twitter' && {
    backgroundColor: '#1da1f2',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#0d95e8',
    }
  }),
  ...(provider === 'GitHub' && {
    backgroundColor: '#333',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#2d2d2d',
    }
  }),
}));

// Style personnalisé pour l'icône de succès
const SuccessIcon = styled(CheckCircleIcon)(({ theme }) => ({
  fontSize: 32,
  color: '#4caf50',
  animation: 'rotate 1s ease-in-out',
  '@keyframes rotate': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
}));

// Style personnalisé pour l'animation de progression
const ProgressContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  zIndex: 1300,
  transition: 'opacity 0.3s ease',
}));

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
    icon: false
  });
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Récupération du token CSRF au chargement
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axiosInstance.get('http://localhost:8000/api/csrf/');
        console.log('CSRF Token récupéré:', response.data);
      } catch (error) {
        console.error('Erreur CSRF:', error);
        setSnackbar({
          open: true,
          message: 'Erreur de connexion au serveur',
          severity: 'error'
        });
      }
    };

    fetchCsrfToken();
  }, []);

  // Gestion des changements de formulaire
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Début de la connexion');
    
    try {
        // Récupérer le CSRF token
        await axiosInstance.get('/api/csrf/');
        
        // Connexion
        const response = await axiosInstance.post('/login/', {
            username: form.username,
            password: form.password
        });

        console.log('Réponse:', response.data);
        
        if (response.data.error) {
            throw new Error(response.data.error);
        }

        // Redirection vers le dashboard
        navigate('/dashboard');
        
    } catch (error) {
        console.error('Erreur:', error);
        setSnackbar({
            open: true,
            message: error.message || 'Erreur de connexion',
            severity: 'error',
            icon: true
        });
    } finally {
        setLoading(false);
    }
};

  // Fermeture du Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Gestion de la connexion sociale
  const socialLogin = (provider) => {
    window.location.href = `http://localhost:8000/social/login/${provider.toLowerCase()}/`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        backgroundImage: `url(${securityBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        backgroundBlendMode: 'overlay',
      
      }}
    >
      {/* Affichage de l'animation de progression pendant la redirection */}
      {redirecting && (
        <ProgressContainer>
          <CircularProgress size={50} color="primary" />
        </ProgressContainer>
      )}
      <Paper
        elevation={10}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderRadius: 2,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ 
            m: 1, 
            bgcolor: '#1976d2',
            width: 70,
            height: 70,
            boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
          }}>
            <LockOutlinedIcon sx={{ fontSize: 35 }} />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ color: '#1976d2', fontWeight: 600 }}>
            Connexion
          </Typography>
        </Box>

        <Divider sx={{ my: 2, width: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            CONNECTEZ-VOUS AVEC
          </Typography>
        </Divider>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ 
          mb: 3,
          p: 2,
          backgroundColor: '#f8f9fa',
          borderRadius: 1,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        }}>
          {['Google', 'Facebook', 'Twitter', 'GitHub'].map((provider) => (
            <IconButton
              key={provider}
              onClick={() => socialLogin(provider)}
              disabled={loading}
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <SocialIcon provider={provider}>
                {provider === 'Google' && <GoogleIcon sx={{ fontSize: 24 }} />}
                {provider === 'Facebook' && <FacebookIcon sx={{ fontSize: 24 }} />}
                {provider === 'Twitter' && <TwitterIcon sx={{ fontSize: 24 }} />}
                {provider === 'GitHub' && <GitHubIcon sx={{ fontSize: 24 }} />}
              </SocialIcon>
            </IconButton>
          ))}
        </Stack>

        <Divider sx={{ my: 2, width: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            OU
          </Typography>
        </Divider>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nom d'utilisateur"
            name="username"
            autoComplete="username"
            autoFocus
            value={form.username}
            onChange={handleChange}
            disabled={loading}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#666',
              },
              '& .MuiOutlinedInput-input': {
                color: '#333',
              }
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type="password"
            id="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#666',
              },
              '& .MuiOutlinedInput-input': {
                color: '#333',
              }
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                value="remember"
                color="primary"
                disabled={loading}
              />
            }
            label="Se souvenir de moi"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ 
              mt: 2, 
              mb: 2, 
              py: 1.5,
              bgcolor: '#1976d2',
              color: '#fff',
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(25, 118, 210, 0.2)',
              '&:hover': {
                bgcolor: '#1565c0',
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                bgcolor: '#1976d2',
                opacity: 0.7,
                boxShadow: 'none',
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Se connecter'
            )}
          </Button>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
              <Typography 
                variant="body2" 
                color="#1976d2" 
                sx={{ 
                  '&:hover': { 
                    textDecoration: 'underline',
                    color: '#1565c0',
                  },
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
              >
                Mot de passe oublié ?
              </Typography>
            </Link>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                fontWeight: 500,
              }}
            >
              Pas encore de compte ?{' '}
              <Link 
                to="/register" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#1976d2',
                  fontWeight: 'bold',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: '#1565c0',
                  },
                }}
              >
                S'inscrire
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 2,
          }}
        >
          {snackbar.icon && <SuccessIcon />}
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Login;
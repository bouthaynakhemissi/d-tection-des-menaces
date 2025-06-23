import React, { useState, useEffect } from 'react';
import axiosInstance from '../context/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, Button, TextField, Typography, Paper, Avatar,
  Alert, Checkbox, FormControlLabel, Stack, IconButton, Divider,
  Snackbar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import TwitterIcon from '@mui/icons-material/Twitter';
import securityBg from '../assets/security-bg.jpg';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  // 1. Récupérer le cookie CSRF AVANT tout POST
  useEffect(() => {
    axiosInstance.get('/csrf/').catch(() => {});
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post('/login/', {
        username: form.username,
        password: form.password
      });

      if (response.status === 200) {
        await login({
          username: form.username,
          password: form.password
        });

        setSnackbar({
          open: true,
          message: 'Connexion réussie ! Redirection en cours...',
          severity: 'success'
        });

        // Attend 1 seconde pour que l'utilisateur voie le message, puis redirige
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error) {
      let errorMessage = "Une erreur s'est produite lors de la connexion";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data) {
        const errors = [];
        for (let key in error.response.data) {
          if (Array.isArray(error.response.data[key])) {
            errors.push(...error.response.data[key]);
          } else {
            errors.push(error.response.data[key]);
          }
        }
        errorMessage = errors.join(' ');
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const socialLogin = (provider) => {
    window.location.href = `http://localhost:8000/api/social/login/${provider.toLowerCase()}/`;
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
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Connexion
          </Typography>
        </Box>

        <Divider sx={{ my: 2, width: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            CONNECTEZ-VOUS AVEC
          </Typography>
        </Divider>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
          {['Google', 'Facebook', 'Twitter', 'GitHub'].map((provider) => (
            <IconButton
              key={provider}
              onClick={() => socialLogin(provider)}
              sx={{
                bgcolor: '#fff',
                '&:hover': { bgcolor: '#f5f5f5' },
                border: '1px solid #e0e0e0'
              }}
            >
              {provider === 'Google' && <GoogleIcon />}
              {provider === 'Facebook' && <FacebookIcon />}
              {provider === 'Twitter' && <TwitterIcon />}
              {provider === 'GitHub' && <GitHubIcon />}
            </IconButton>
          ))}
        </Stack>

        <Divider sx={{ my: 2, width: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            OU
          </Typography>
        </Divider>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
            sx={{ mt: 3, mb: 2, py: 1.5 }}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Link to="/forgot-password" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography variant="body2" color="primary">
                Mot de passe oublié ?
              </Typography>
            </Link>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Pas encore de compte ?{' '}
              <Link to="/register" style={{ textDecoration: 'none', color: 'primary' }}>
                S'inscrire
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Login;
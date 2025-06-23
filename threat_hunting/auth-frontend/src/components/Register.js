import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../context/axiosInstance';
import {
  Box, Button, TextField, Typography, Paper, Checkbox, FormControlLabel, Alert
} from '@mui/material';

function Register() {
  const [form, setForm] = useState({
    username: '',  // Changé de 'name' à 'username' pour correspondre à l'API
    email: '',
    password: '',
    password2: '',
    terms: false,
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs
    if (!form.terms) {
      setMessage({ text: "Vous devez accepter les conditions d'utilisation", type: 'error' });
      return;
    }
    
    if (form.password !== form.password2) {
      setMessage({ text: "Les mots de passe ne correspondent pas", type: 'error' });
      return;
    }

    try {
      const response = await axiosInstance.post('/api/register/', {
        username: form.username,
        email: form.email,
        password: form.password
      });
      
      setMessage({ 
        text: 'Inscription réussie ! Redirection...', 
        type: 'success' 
      });
      
      // Redirection après un court délai
      setTimeout(() => navigate('/login'), 1500);
      
    } catch (err) {
      console.error('Erreur d\'inscription:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMessage = 'Erreur lors de la création du compte';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data) {
        // Gestion des erreurs de validation Django
        const errors = [];
        for (let key in err.response.data) {
          if (Array.isArray(err.response.data[key])) {
            errors.push(...err.response.data[key]);
          } else {
            errors.push(err.response.data[key]);
          }
        }
        errorMessage = errors.join(' ');
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setMessage({ text: errorMessage, type: 'error' });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f6fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper elevation={10} sx={{
        width: 400,
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        {/* Bandeau bleu */}
        <Box sx={{
          bgcolor: 'primary.main',
          color: 'white',
          p: 3,
          textAlign: 'center',
        }}>
          <Typography variant="h5" fontWeight="bold">
            Inscrivez-vous dès aujourd'hui
          </Typography>
          <Typography variant="body2">
            Entrez vos informations pour créer un compte
          </Typography>
        </Box>
        
        {/* Formulaire */}
        <Box sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              fullWidth
              name="username"
              label="Nom d'utilisateur"
              value={form.username}
              onChange={handleChange}
              required
            />
            <TextField
              margin="normal"
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <TextField
              margin="normal"
              fullWidth
              name="password2"
              label="Confirmer le mot de passe"
              type="password"
              value={form.password2}
              onChange={handleChange}
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="terms"
                  checked={form.terms}
                  onChange={handleChange}
                  color="primary"
                  required
                />
              }
              label={
                <span>
                  J'accepte les <Link to="#">Conditions d'utilisation</Link>
                </span>
              }
              sx={{ mt: 1, mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 1, py: 1.2, fontWeight: 'bold', fontSize: '1rem' }}
            >
              S'INSCRIRE
            </Button>
            {message.text && (
              <Alert 
                severity={message.type} 
                sx={{ mt: 2 }}
                onClose={() => setMessage({ text: '', type: '' })}
              >
                {message.text}
              </Alert>
            )}
          </form>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Register;
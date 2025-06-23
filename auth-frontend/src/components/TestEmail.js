import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  InputAdornment,
  Grid
} from '@mui/material';
import axios from 'axios';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import SubjectIcon from '@mui/icons-material/Subject';
import MessageIcon from '@mui/icons-material/Message';

export default function TestEmail() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestEmail = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      if (!token) {
        setTestResult({
          type: 'error',
          message: "Vous devez être connecté pour envoyer l'email",
        });
        return;
      }

      const response = await axios.post(
        'http://localhost:8000/test-email/',
        {
          email,
          subject,
          message,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      setTestResult({
        type: 'success',
        message: response.data?.message || 'Email envoyé avec succès !',
      });
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      // Affiche le message d'erreur détaillé du backend si disponible
      let backendError = error.response?.data?.error || error.response?.data?.message;
      setTestResult({
        type: 'error',
        message: backendError || 'Erreur lors de l\'envoi de l\'email',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 2, md: 4 },
        borderRadius: 3,
        background: 'white',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        maxWidth: 800,
        mx: 'auto',
        mt: 2
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        pb: 2,
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
      }}>
        <EmailIcon 
          sx={{ 
            fontSize: 40, 
            color: '#4a5568',
            mr: 2,
            backgroundColor: 'rgba(74, 85, 104, 0.1)',
            p: 1,
            borderRadius: '50%'
          }} 
        />
        <Box>
          <Typography variant="h5" sx={{ 
            fontWeight: 600,
            color: '#2d3748',
            mb: 0.5
          }}>
            Envoyer un email
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vérifiez la configuration de votre service d'emails
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email de destination"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            variant="outlined"
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e2e8f0',
                },
                '&:hover fieldset': {
                  borderColor: '#cbd5e0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4a5568',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#4a5568',
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Sujet"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            margin="normal"
            variant="outlined"
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SubjectIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e2e8f0',
                },
                '&:hover fieldset': {
                  borderColor: '#cbd5e0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4a5568',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#4a5568',
              }
            }}
          />
        </Grid>
      </Grid>

      <TextField
        fullWidth
        label="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        margin="normal"
        variant="outlined"
        size="medium"
        multiline
        rows={4}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ mt: 1, alignItems: 'flex-start' }}>
              <MessageIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          mt: 3,
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
              borderColor: '#cbd5e0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4a5568',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#4a5568',
          }
        }}
      />

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleTestEmail}
          disabled={isLoading || !email || !subject || !message}
          startIcon={!isLoading && <SendIcon />}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontSize: '1rem',
            backgroundColor: '#4a5568',
            '&:hover': {
              backgroundColor: '#2d3748'
            },
            '&:disabled': {
              backgroundColor: '#e2e8f0',
              color: '#a0aec0'
            }
          }}
        >
          {isLoading ? 'Envoi en cours...' : 'Envoyer l\'email'}
        </Button>
      </Box>

      {testResult && (
        <Alert
          severity={testResult.type}
          sx={{ 
            mt: 3,
            borderRadius: 2,
            backgroundColor: testResult.type === 'success' ? '#f0fff4' : '#fff5f5',
            color: testResult.type === 'success' ? '#276749' : '#9b2c2c',
            '& .MuiAlert-icon': {
              color: testResult.type === 'success' ? '#38a169' : '#e53e3e'
            }
          }}
        >
          <AlertTitle sx={{ 
            fontWeight: 600,
            color: testResult.type === 'success' ? '#276749' : '#9b2c2c'
          }}>
            {testResult.type === 'success' ? 'Succès' : 'Erreur'}
          </AlertTitle>
          {testResult.message}
        </Alert>
      )}
    </Paper>
  );
}
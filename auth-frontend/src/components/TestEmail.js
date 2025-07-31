import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  InputAdornment,
  Grid,
  CircularProgress,
  LinearProgress,
  Fade,
  useTheme
} from '@mui/material';
import axios from 'axios';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import SubjectIcon from '@mui/icons-material/Subject';
import MessageIcon from '@mui/icons-material/Message';
import { keyframes } from '@emotion/react';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
`;

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export default function TestEmail() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const theme = useTheme();

  // Palette de couleurs
  const colors = {
    primary: '#2563eb',
    secondary: '#1e40af',
    success: '#10b981',
    error: '#ef4444',
    background: '#f8fafc',
    surface: '#edf2f7',
    text: '#1f2937',
    border: '#e2e8f0',
    hover: '#cbd5e1',
    focus: '#60a5fa',
    icon: '#6b7280',
    active: '#3b82f6',
    disabled: '#d1d5db',
    shadow: 'rgba(0, 0, 0, 0.1)',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    progress: '#4f46e5',
    info: '#3b82f6',
    gradient1: '#6366f1',
    gradient2: '#4338ca',
    gradient3: '#3730a3'
  };

  // Fonction utilitaire pour récupérer un cookie par son nom
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // Effet de fond animé
  const animatedBackground = {
    background: `linear-gradient(135deg, 
      ${colors.gradient1} 0%,
      ${colors.gradient2} 50%,
      ${colors.gradient3} 100%
    )`,
    backgroundSize: '400% 400%',
    animation: `${gradientAnimation} 15s ease infinite`
  };

  const handleTestEmail = async () => {
    try {
      setIsLoading(true);
      setTestResult(null);
        
      console.log('Envoi de l\'email avec les données:', {
        email,
        subject,
        message
      });
  
      const response = await axios.post(
        'http://localhost:8000/api/test-email/',
        {
          email,
          subject,
          message
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
          },
        }
      );
  
      console.log('Réponse du serveur:', response.data);
        
      setTestResult({
        type: 'success',
        message: response.data?.message || 'Email de test envoyé avec succès !',
      });
        
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
        
      let errorMessage = 'Erreur lors de l\'envoi de l\'email';
        
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
        errorMessage = error.response.data?.error || 
                      error.response.data?.message || 
                      `Erreur ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        console.error('Pas de réponse du serveur');
        errorMessage = 'Pas de réponse du serveur. Vérifiez votre connexion.';
      } else {
        console.error('Erreur de configuration:', error.message);
        errorMessage = `Erreur de configuration: ${error.message}`;
      }
        
      setTestResult({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      width: '100%',
      minHeight: '100vh',
      background: colors.background,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      position: 'relative',
      overflow: 'hidden',
      pt: 4
    }}>
      {/* Effet de fond animé */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          ...animatedBackground
        }}
      />

      {/* Contenu principal */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, md: 4 },
          borderRadius: 3,
          background: colors.surface,
          boxShadow: `0 8px 32px ${colors.shadow}`,
          maxWidth: 800,
          mx: 'auto',
          mt: 0,
          animation: `${fadeIn} 0.5s ease-out`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 12px 24px ${colors.shadow}`,
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4,
          pb: 2,
          borderBottom: `1px solid ${colors.border}`,
          animation: `${fadeIn} 0.5s ease-out 0.2s`
        }}>
          <EmailIcon 
            sx={{ 
              fontSize: 40, 
              color: colors.primary,
              mr: 2,
              backgroundColor: theme.palette.primary.light,
              p: 1,
              borderRadius: '50%',
              animation: `${pulse} 2s ease infinite`
            }} 
          />
          <Box>
            <Typography variant="h5" sx={{ 
              fontWeight: 600,
              color: colors.text,
              mb: 0.5,
              animation: `${fadeIn} 0.5s ease-out 0.3s`
            }}>
              Envoyer un email
            </Typography>
            <Typography variant="body1" color={colors.icon} sx={{
              animation: `${fadeIn} 0.5s ease-out 0.4s`
            }}>
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
                    <EmailIcon color="primary" sx={{
                      animation: `${pulse} 2s ease infinite`
                    }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: `0 2px 4px ${colors.shadow}`
                  },
                  '& fieldset': {
                    borderColor: colors.border,
                  },
                  '&:hover fieldset': {
                    borderColor: colors.hover,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: colors.focus,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: colors.focus,
                },
                '& .MuiOutlinedInput-root.Mui-error': {
                  '& fieldset': {
                    borderColor: colors.error,
                  }
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
                    <SubjectIcon color="primary" sx={{
                      animation: `${pulse} 2s ease infinite`
                    }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: `0 2px 4px ${colors.shadow}`
                  },
                  '& fieldset': {
                    borderColor: colors.border,
                  },
                  '&:hover fieldset': {
                    borderColor: colors.hover,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: colors.focus,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: colors.focus,
                },
                '& .MuiOutlinedInput-root.Mui-error': {
                  '& fieldset': {
                    borderColor: colors.error,
                  }
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
                <MessageIcon color="primary" sx={{
                  animation: `${pulse} 2s ease infinite`
                }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mt: 3,
            '& .MuiOutlinedInput-root': {
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: `0 2px 4px ${colors.shadow}`
              },
              '& fieldset': {
                borderColor: colors.border,
              },
              '&:hover fieldset': {
                borderColor: colors.hover,
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.focus,
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: colors.focus,
            },
            '& .MuiOutlinedInput-root.Mui-error': {
              '& fieldset': {
                borderColor: colors.error,
              }
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
              backgroundColor: colors.primary,
              '&:hover': {
                backgroundColor: `${colors.primary}1A`,  // 10% d'opacité
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${colors.shadow}`,
                animation: `${pulse} 0.5s ease infinite`
              },
              '&:disabled': {
                backgroundColor: colors.disabled,
                color: colors.icon
              },
              '&:active': {
                backgroundColor: colors.active,
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
              animation: `${fadeIn} 0.5s ease-out`,
              backgroundColor: testResult.type === 'success' ? 
                `${colors.success}1A` : 
                `${colors.error}1A`,
              color: testResult.type === 'success' ? 
                colors.success : 
                colors.error,
              '& .MuiAlert-icon': {
                color: testResult.type === 'success' ? 
                  colors.success : 
                  colors.error
              },
              transition: 'all 0.3s ease'
            }}
          >
            <AlertTitle sx={{ 
              fontWeight: 600,
              color: testResult.type === 'success' ? 
                colors.success : 
                colors.error
            }}>
              {testResult.type === 'success' ? 'Succès' : 'Erreur'}
            </AlertTitle>
            {testResult.message}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
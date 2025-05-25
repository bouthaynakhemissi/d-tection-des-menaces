
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Visibility,
  VisibilityOff
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
function getCookie(name) {
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
}
export default function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [open, setOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Récupérer les données utilisateur avec les cookies
        const response = await fetch("http://localhost:8000/user_profile/", {
          credentials: 'include',
           headers: {
          'Content-Type': 'application/json',
        },
        });

        if (!response.ok) {
          throw new Error('Non connecté');
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      const csrftoken = getCookie('csrftoken');
      const response = await fetch("http://localhost:8000/change-password/", {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.detail || 'Erreur lors du changement de mot de passe');
      }
      
      setSuccess("Mot de passe modifié avec succès");
      setOldPassword("");
      setNewPassword("");
      setTimeout(handleClose, 2000);
    } catch (err) {
      console.error("Erreur lors du changement de mot de passe:", err);
      setError(
        err.message || "Une erreur s'est produite lors du changement de mot de passe"
      );
    }
  };

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        sx={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e0e6ed 100%)',
          borderRadius: 2
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        sx={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e0e6ed 100%)',
          borderRadius: 2
        }}
      >
        <Typography variant="h5" color="error">
          Données utilisateur non disponibles
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      maxWidth: 800, 
      mx: "auto",
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e0e6ed 100%)'
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          borderRadius: 3,
          background: 'white',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4,
          pb: 3,
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
        }}>
          <AccountCircleIcon 
            sx={{ 
              fontSize: 60, 
              color: '#4a5568',
              mr: 3,
              backgroundColor: 'rgba(74, 85, 104, 0.1)',
              p: 1.5,
              borderRadius: '50%'
            }} 
          />
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 600,
              color: '#2d3748',
              mb: 1
            }}>
              Profile Utilisateur
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gérer vos informations personnelles et votre mot de passe
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ 
            mb: 3, 
            color: '#4a5568', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center'
          }}>
            <AccountCircleIcon sx={{ mr: 1, color: '#4a5568' }} />
            Informations du compte
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gap: 2,
            mb: 4
          }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc'
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ 
                display: 'block', 
                mb: 0.5,
                color: '#64748b'
              }}>
                Nom d'utilisateur
              </Typography>
              <Typography variant="body1" sx={{ 
                fontWeight: 500, 
                fontSize: '1.1rem',
                color: '#1e293b'
              }}>
                {userData.username}
              </Typography>
            </Paper>

            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc'
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ 
                display: 'block', 
                mb: 0.5,
                color: '#64748b'
              }}>
                Adresse email
              </Typography>
              <Typography variant="body1" sx={{ 
                fontWeight: 500, 
                fontSize: '1.1rem',
                color: '#1e293b'
              }}>
                {userData.email}
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              onClick={handleOpen}
              startIcon={<VpnKeyIcon />}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
                backgroundColor: '#4a5568',
                '&:hover': {
                  backgroundColor: '#2d3748'
                }
              }}
            >
              Changer le mot de passe
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              onClick={handleLogout}
              startIcon={<ExitToAppIcon />}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
                borderColor: '#e53e3e',
                color: '#e53e3e',
                '&:hover': {
                  backgroundColor: '#fff5f5',
                  borderColor: '#e53e3e'
                }
              }}
            >
              Se déconnecter
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600,
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          color: '#2d3748'
        }}>
          <VpnKeyIcon sx={{ mr: 1.5, color: '#4a5568' }} />
          Changer le mot de passe
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  alignItems: 'center',
                  backgroundColor: '#fff5f5',
                  color: '#9b2c2c',
                  '& .MuiAlert-icon': {
                    color: '#e53e3e'
                  }
                }}
              >
                {error}
              </Alert>
            )}
            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  alignItems: 'center',
                  backgroundColor: '#f0fff4',
                  color: '#276749',
                  '& .MuiAlert-icon': {
                    color: '#38a169'
                  }
                }}
              >
                {success}
              </Alert>
            )}
            
            <TextField
              autoFocus
              margin="dense"
              label="Ancien mot de passe"
              type="password"
              fullWidth
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              sx={{ 
                mb: 2,
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
              variant="outlined"
              size="medium"
            />
            <TextField
              margin="dense"
              label="Nouveau mot de passe"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
              variant="outlined"
              size="medium"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
            <Button 
              onClick={handleClose}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontSize: '1rem',
                color: '#64748b',
                '&:hover': {
                  backgroundColor: '#f8fafc'
                }
              }}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontSize: '1rem',
                backgroundColor: '#4a5568',
                '&:hover': {
                  backgroundColor: '#2d3748'
                }
              }}
            >
              Enregistrer
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
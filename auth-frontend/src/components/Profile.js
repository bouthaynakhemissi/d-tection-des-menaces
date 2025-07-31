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
  Avatar,
  Fade,
  Zoom,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  InputAdornment,
  Snackbar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoCard from './InfoCard';

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
  gradient1: '#6366f1',
  gradient2: '#4338ca',
  gradient3: '#3730a3'
};

const animatedBackground = {
  background: `linear-gradient(135deg, 
    ${colors.gradient1} 0%,
    ${colors.gradient2} 50%,
    ${colors.gradient3} 100%
  )`,
  backgroundSize: '400% 400%',
  animation: `gradientAnimation 15s ease infinite`
};

const gradientAnimation = {
  '0%': {
    backgroundPosition: '0% 50%'
  },
  '50%': {
    backgroundPosition: '100% 50%'
  },
  '100%': {
    backgroundPosition: '0% 50%'
  }
}

// Fonction pour obtenir le cookie CSRF
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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
      });
    }
  }, [userData]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const csrftoken = getCookie('csrftoken');
      console.log('Envoi des données au serveur:', formData);
      
      const response = await fetch("http://localhost:8000/update-profile/", {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(formData)
      });

      console.log('Réponse du serveur - Statut:', response.status);
      const data = await response.json();
      console.log('Réponse du serveur - Données:', data);
      
      if (!response.ok) {
        console.error('Erreur du serveur:', data);
        throw new Error(data.error || 'Erreur lors de la mise à jour du profil');
      }
      
      // Mettre à jour les données utilisateur avec la date de dernière modification
      setUserData(prev => ({
        ...prev,
        ...data,
        last_modified: data.last_modified || new Date().toISOString()
      }));
      
      setIsEditing(false);
      showSnackbar(data.message || 'Profil mis à jour avec succès', 'success');
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      showSnackbar(err.message || "Une erreur s'est produite", 'error');
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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
      const response = await fetch("http://localhost:8000/api/change-password/", {
        method: 'POST',
        credentials: 'include',  // Important pour inclure les cookies de session
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: oldPassword,
          new_password: newPassword,
          confirm_password: newPassword
        })
      });
  
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur lors du changement de mot de passe');
      }
      
      setSuccess(responseData.message || "Mot de passe modifié avec succès");
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
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        sx={{ 
          background: colors.background,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          pt: 4
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
          background: colors.background,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          pt: 4
        }}
      >
        <Typography variant="h5" color="error">
          Données utilisateur non disponibles
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{
        width: '100%',
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              marginBottom: '20px',
              marginRight: '20px',
              minWidth: '300px',
              '&.MuiAlert-filledSuccess': {
                backgroundColor: '#4caf50',
              },
              '&.MuiAlert-filledError': {
                backgroundColor: '#f44336',
              }
            }
          }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            variant="filled"
            iconMapping={{
              success: <CheckCircleIcon fontSize="inherit" />,
              error: <ErrorIcon fontSize="inherit" />
            }}
            sx={{
              width: '100%',
              alignItems: 'center',
              '& .MuiAlert-message': {
                display: 'flex',
                alignItems: 'center',
                fontWeight: 500,
                fontSize: '0.95rem'
              },
              '& .MuiSvgIcon-root': {
                fontSize: '1.5rem',
                marginRight: '8px'
              }
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Box sx={{ 
          maxWidth: 1000, 
          mx: 'auto',
          animation: 'fadeIn 0.5s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(10px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          }
        }}>
          {/* Header Section */}
          <Box sx={{ 
            mb: 4,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' },
            gap: 3,
            p: 3,
            borderRadius: 3,
            background: colors.surface,
            boxShadow: `0 4px 20px ${colors.shadow}`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: 4,
              background: 'linear-gradient(90deg, #4f46e5, #7c3aed)'
            }
          }}>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100,
                bgcolor: 'primary.main',
                fontSize: 48,
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
              }}
            >
              {userData?.username?.charAt(0).toUpperCase()}
            </Avatar>
            
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700,
                mb: 1,
                background: 'linear-gradient(90deg, #1e293b, #475569)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                {isEditing ? (
                  <TextField
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    variant="standard"
                    sx={{ 
                      width: '100%',
                      '& .MuiInput-root': {
                        fontSize: 24,
                        fontWeight: 700,
                        color: 'text.primary',
                        bgcolor: 'transparent',
                        border: 'none',
                        padding: 0,
                        '&:hover': {
                          bgcolor: 'transparent',
                        },
                        '&.Mui-focused': {
                          bgcolor: 'transparent',
                        },
                      }
                    }}
                  />
                ) : (
                  userData?.username
                )}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', md: 'flex-start' },
                mb: 2
              }}>
                <Chip 
                  icon={<EmailIcon fontSize="small" />} 
                  label={isEditing ? (
                    <TextField
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      variant="standard"
                      sx={{ 
                        width: '100%',
                        '& .MuiInput-root': {
                          fontSize: 14,
                          fontWeight: 500,
                          color: 'text.primary',
                          bgcolor: 'transparent',
                          border: 'none',
                          padding: 0,
                          '&:hover': {
                            bgcolor: 'transparent',
                          },
                          '&.Mui-focused': {
                            bgcolor: 'transparent',
                          },
                        }
                      }}
                    />
                  ) : (
                    userData?.email
                  )}
                  size="small"
                  sx={{ 
                    bgcolor: '#f0f9ff',
                    color: '#0369a1',
                    fontWeight: 500,
                    '& .MuiChip-icon': { color: '#0ea5e9' }
                  }}
                />
                <Chip 
                  icon={<PersonIcon fontSize="small" />} 
                  label="Administrateur" 
                  size="small"
                  sx={{ 
                    bgcolor: '#f0fdf4',
                    color: '#166534',
                    fontWeight: 500,
                    '& .MuiChip-icon': { color: '#22c55e' }
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600 }}>
                Gérez vos informations personnelles, votre mot de passe et vos préférences de compte.
              </Typography>
            </Box>
            
            <Box sx={{ 
              ml: 'auto',
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'row', sm: 'column' },
              mt: { xs: 2, md: 0 },
              width: { xs: '100%', sm: 'auto' },
              '& .MuiButton-root': {
                minWidth: 180,
                justifyContent: 'flex-start',
                px: 2,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }
            }}>
              <Button 
                variant="contained"
                onClick={handleOpen}
                startIcon={<VpnKeyIcon />}
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' }
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
                  borderColor: 'error.main',
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'rgba(239, 68, 68, 0.04)',
                    borderColor: 'error.dark'
                  }
                }}
              >
                Déconnexion
              </Button>
            </Box>
          </Box>

          {/* Account Information Section */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, md: 3 },
              mb: 4,
              borderRadius: 3,
              background: colors.surface,
              boxShadow: `0 4px 20px ${colors.shadow}`,
              maxWidth: 800,
              width: '100%',
              animation: `fadeIn 0.5s ease-out`,
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
              justifyContent: 'space-between', 
              mb: 3
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Informations personnelles
              </Typography>
              
              {isEditing ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Annuler">
                    <IconButton 
                      onClick={handleEditToggle}
                      sx={{ color: 'error.main' }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Enregistrer">
                    <IconButton 
                      onClick={handleSaveProfile}
                      color="primary"
                    >
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <Tooltip title="Modifier le profil">
                  <IconButton 
                    onClick={handleEditToggle}
                    color="primary"
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(79, 70, 229, 0.1)'
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
              mb: 3
            }}>
              <InfoCard 
                icon={<PersonIcon />} 
                title="Nom d'utilisateur" 
                value={isEditing ? (
                  <TextField
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    variant="standard"
                    sx={{ 
                      width: '100%',
                      '& .MuiInput-root': {
                        fontSize: 16,
                        fontWeight: 500,
                        color: 'text.primary',
                        bgcolor: 'transparent',
                        border: 'none',
                        padding: 0,
                        '&:hover': {
                          bgcolor: 'transparent',
                        },
                        '&.Mui-focused': {
                          bgcolor: 'transparent',
                        },
                      }
                    }}
                  />
                ) : (
                  userData?.username
                )}
                color="#3b82f6"
              />
              <InfoCard 
                icon={<EmailIcon />} 
                title="Adresse email" 
                value={isEditing ? (
                  <TextField
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    variant="standard"
                    sx={{ 
                      width: '100%',
                      '& .MuiInput-root': {
                        fontSize: 16,
                        fontWeight: 500,
                        color: 'text.primary',
                        bgcolor: 'transparent',
                        border: 'none',
                        padding: 0,
                        '&:hover': {
                          bgcolor: 'transparent',
                        },
                        '&.Mui-focused': {
                          bgcolor: 'transparent',
                        },
                      }
                    }}
                  />
                ) : (
                  userData?.email
                )}
                color="#8b5cf6"
              />
              <InfoCard 
                icon={<LockIcon />}
                title="Dernière modification"
                value={userData?.last_modified ? new Date(userData.last_modified).toLocaleString('fr-FR') : 'Non disponible'}
                color="#10b981"
                sx={{ mt: 2 }}
              />
              <InfoCard 
                icon={<AccountCircleIcon />} 
                title="Compte créé" 
                value={new Date().toLocaleDateString()}
                color="#f59e0b"
              />
            </Box>
          </Paper>

          {/* Security Section */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              background: colors.surface,
              boxShadow: `0 4px 20px ${colors.shadow}`,
              maxWidth: 800,
              width: '100%',
              animation: `fadeIn 0.5s ease-out`,
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
              mb: 3,
              pb: 2,
              borderBottom: '1px solid rgba(0,0,0,0.06)'
            }}>
              <LockIcon sx={{ mr: 1.5, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Sécurité du compte
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                Force du mot de passe
              </Typography>
              <Box sx={{ 
                height: 8, 
                bgcolor: 'grey.200', 
                borderRadius: 4,
                overflow: 'hidden',
                mb: 1
              }}>
                <Box sx={{ 
                  width: '75%', 
                  height: '100%', 
                  bgcolor: 'success.main',
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #10b981, #34d399)'
                }} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Fort • Dernière modification il y a 3 mois
              </Typography>
            </Box>

            <Button 
              variant="outlined"
              onClick={handleOpen}
              startIcon={<VpnKeyIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                borderColor: 'primary.light',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(79, 70, 229, 0.04)',
                  borderColor: 'primary.main'
                }
              }}
            >
              Mettre à jour le mot de passe
            </Button>
          </Paper>
        </Box>

        {/* Password Change Dialog */}
        <Dialog 
          open={open} 
          onClose={handleClose} 
          maxWidth="sm" 
          fullWidth
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            fontWeight: 600,
            pb: 2,
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            '& .MuiSvgIcon-root': {
              mr: 1.5
            }
          }}>
            <VpnKeyIcon />
            Changer le mot de passe
          </DialogTitle>
          
          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ py: 3, px: 3 }}>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'error.light',
                    bgcolor: 'error.50',
                    '& .MuiAlert-icon': {
                      color: 'error.main'
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
                    border: '1px solid',
                    borderColor: 'success.light',
                    bgcolor: 'success.50',
                    '& .MuiAlert-icon': {
                      color: 'success.main'
                    }
                  }}
                >
                  {success}
                </Alert>
              )}
              
              <TextField
                autoFocus
                margin="normal"
                label="Ancien mot de passe"
                type="password"
                fullWidth
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                variant="outlined"
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: 1,
                    },
                  }
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                label="Nouveau mot de passe"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                variant="outlined"
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: 1,
                    },
                  }
                }}
              />
              
              <Typography variant="caption" color="text.secondary" sx={{ 
                display: 'block', 
                mt: 1.5,
                fontSize: '0.75rem',
                lineHeight: 1.5
              }}>
                Assurez-vous que votre mot de passe contient au moins 8 caractères, 
                dont des majuscules, des chiffres et des caractères spéciaux.
              </Typography>
            </DialogContent>
            
            <DialogActions sx={{ 
              px: 3, 
              py: 2,
              borderTop: '1px solid rgba(0,0,0,0.08)'
            }}>
              <Button 
                onClick={handleClose}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: 'action.hover'
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
                  fontWeight: 500,
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                }}
              >
                Enregistrer les modifications
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Fade>
  );
}
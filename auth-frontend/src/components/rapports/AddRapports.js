import React, { useState, useEffect } from 'react';
import axiosInstance from '../../context/axiosInstance';
import { keyframes } from '@emotion/react';
import { styled } from '@mui/material/styles';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Fade,
  Grow,
  Slide,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
  Title as TitleIcon,
  Event as EventIcon,
  EventAvailable as EventAvailableIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Composants stylisés
const AnimatedBox = styled(Box)({
  animation: `${fadeIn} 0.5s ease-out forwards`,
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition: 'all 0.3s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: 2,
      boxShadow: `0 0 0 3px ${theme.palette.primary.light}80`,
    },
  },
  '& .MuiInputBase-input': {
    padding: '10px 14px',
  },
}));

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition: 'all 0.3s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: 2,
      boxShadow: `0 0 0 3px ${theme.palette.primary.light}80`,
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 12,
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    transition: 'all 0.3s ease',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderWidth: 2,
    boxShadow: `0 0 0 3px ${theme.palette.primary.light}80`,
  },
}));

const TYPE_RAPPORT = [
  { 
    value: 'INCIDENT', 
    label: 'Rapport d\'Incident', 
    icon: <EventIcon fontSize="small" />,
    color: '#ff9800'
  },
  { 
    value: 'SECURITE', 
    label: 'Rapport de Sécurité', 
    icon: <DescriptionIcon fontSize="small" />,
    color: '#f44336'
  },
  { 
    value: 'AUDIT', 
    label: 'Rapport d\'Audit', 
    icon: <DescriptionIcon fontSize="small" />,
    color: '#4caf50'
  }
];


const AddRapports = ({ onRefresh, onClose, showButton = true }) => {
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [typeRapport, setTypeRapport] = useState('');
  const [dateDebut, setDateDebut] = useState(null);
  const [dateFin, setDateFin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [userId, setUserId] = useState(1);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserId(user.id);
    }
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    setTitre('');
    setDescription('');
    setTypeRapport('');
    setDateDebut(null);
    setDateFin(null);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!titre || !typeRapport) {
      setSnackbar({
        open: true,
        message: 'Veuillez remplir tous les champs obligatoires',
        severity: 'error'
      });
      return;
    }
  
    setLoading(true);
  
    try {
      // Récupérer le token CSRF avant de faire la requête
      await axiosInstance.get('/api/csrf/');
      
      // Créer l'objet de données
      const rapportData = {
        titre: titre,
        description: description || '',
        type_rapport: typeRapport,
        statut: 'BROUILLON'
      };
  
      // Ajouter les dates si elles existent
      if (dateDebut) {
        rapportData.date_debut = dateDebut.toISOString().split('T')[0];
      }
      if (dateFin) {
        rapportData.date_fin = dateFin.toISOString().split('T')[0];
      }
  
      // Utilisation de l'instance Axios configurée
      const response = await axiosInstance.post(
        '/api/rapports/create/',
        JSON.stringify(rapportData),
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.cookie
              .split('; ')
              .find(row => row.startsWith('csrftoken='))
              ?.split('=')[1] || ''
          },
          withCredentials: true
        }
      );
  
      setSnackbar({
        open: true,
        message: 'Rapport créé avec succès !',
        severity: 'success'
      });
      
      if (onRefresh) onRefresh();
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la création du rapport:', error);
      
      let errorMessage = 'Erreur lors de la création du rapport';
      
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
        
        if (error.response.status === 403) {
          errorMessage = 'Erreur d\'authentification ou de permission';
        } else if (error.response.data) {
          if (typeof error.response.data === 'object') {
            errorMessage = Object.values(error.response.data).flat().join('\n');
          } else {
            errorMessage = error.response.data.toString();
          }
        }
      } else if (error.request) {
        console.error('Aucune réponse du serveur:', error.request);
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
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

  const renderMenuItem = (type) => (
    <MenuItem 
      key={type.value} 
      value={type.value}
      sx={{
        padding: '8px 16px',
        margin: '4px 8px',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: `${type.color}15`,
          '& .MuiSvgIcon-root': {
            transform: 'scale(1.2)',
          }
        },
        '&.Mui-selected': {
          backgroundColor: `${type.color}20`,
          borderLeft: `4px solid ${type.color}`,
          '&:hover': {
            backgroundColor: `${type.color}25`,
          },
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box sx={{ 
          color: type.color,
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center'
        }}>
          {type.icon}
        </Box>
        <Typography variant="body2" fontWeight={500}>
          {type.label}
        </Typography>
      </Box>
    </MenuItem>
  );

  return (
    <>
      {showButton && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
            background: 'linear-gradient(45deg, #1976d2 0%, #2196f3 100%)',
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-2px)',
              animation: `${pulse} 1.5s infinite`
            }
          }}
        >
          Nouveau Rapport
        </Button>
      )}

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        TransitionComponent={Slide}
        transitionDuration={400}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 24,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          }
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 2,
          background: 'linear-gradient(45deg, #1976d2 0%, #2196f3 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <DescriptionIcon sx={{ 
              fontSize: 28,
              animation: `${pulse} 2s infinite`
            }} />
            <Typography variant="h6" fontWeight={600}>
              Nouveau Rapport
            </Typography>
          </Box>
          <IconButton 
            onClick={handleClose} 
            disabled={loading}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
            <Grow in={true} timeout={500}>
              <AnimatedBox sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Box display="flex" alignItems="center" mb={1.5} gap={1.5}>
                    <CategoryIcon color="primary" sx={{ fontSize: 22 }} />
                    <Typography variant="subtitle1" color="text.primary" fontWeight={500}>
                      Type de Rapport
                    </Typography>
                  </Box>
                  <FormControl fullWidth size="small">
                    <StyledSelect
                      value={typeRapport}
                      onChange={(e) => setTypeRapport(e.target.value)}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return <Typography color="text.secondary">Sélectionnez un type</Typography>;
                        }
                        const type = TYPE_RAPPORT.find(t => t.value === selected);
                        return (
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Box sx={{ color: type.color }}>{type.icon}</Box>
                            <Typography>{type.label}</Typography>
                          </Box>
                        );
                      }}
                    >
                      {TYPE_RAPPORT.map(renderMenuItem)}
                    </StyledSelect>
                  </FormControl>
                </Box>

                <Box>
                  <Box display="flex" alignItems="center" mb={1.5} gap={1.5}>
                    <TitleIcon color="primary" sx={{ fontSize: 22 }} />
                    <Typography variant="subtitle1" color="text.primary" fontWeight={500}>
                      Titre du Rapport
                    </Typography>
                  </Box>
                  <StyledTextField
                    fullWidth
                    size="small"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder="Entrez le titre du rapport"
                    required
                  />
                </Box>

                <Box>
                  <Box display="flex" alignItems="center" mb={1.5} gap={1.5}>
                    <DescriptionIcon color="primary" sx={{ fontSize: 22 }} />
                    <Typography variant="subtitle1" color="text.primary" fontWeight={500}>
                      Description
                    </Typography>
                  </Box>
                  <StyledTextField
                    fullWidth
                    multiline
                    rows={4}
                    size="small"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez le contenu du rapport"
                  />
                </Box>

                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" mb={1.5} gap={1.5}>
                        <EventIcon color="primary" sx={{ fontSize: 22 }} />
                        <Typography variant="subtitle1" color="text.primary" fontWeight={500}>
                          Date de Début
                        </Typography>
                      </Box>
                      <StyledDatePicker
                        value={dateDebut}
                        onChange={(newValue) => setDateDebut(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'primary.main',
                                },
                                '&.Mui-focused fieldset': {
                                  borderWidth: 2,
                                  boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.2)',
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </Box>
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" mb={1.5} gap={1.5}>
                        <EventAvailableIcon color="primary" sx={{ fontSize: 22 }} />
                        <Typography variant="subtitle1" color="text.primary" fontWeight={500}>
                          Date de Fin
                        </Typography>
                      </Box>
                      <StyledDatePicker
                        value={dateFin}
                        minDate={dateDebut}
                        onChange={(newValue) => setDateFin(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'primary.main',
                                },
                                '&.Mui-focused fieldset': {
                                  borderWidth: 2,
                                  boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.2)',
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </LocalizationProvider>
              </AnimatedBox>
            </Grow>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          background: 'rgba(0, 0, 0, 0.02)'
        }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            startIcon={<CancelIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            onClick={handleSubmit}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              minWidth: 120,
              background: 'linear-gradient(45deg, #1976d2 0%, #2196f3 100%)',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
                background: 'linear-gradient(45deg, #1565c0 0%, #1976d2 100%)',
              },
              '&:active': {
                transform: 'translateY(0)',
              }
            }}
          >
            {loading ? 'Création...' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: 3,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddRapports;
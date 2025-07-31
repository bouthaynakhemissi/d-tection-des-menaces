import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../context/axiosInstance';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Step,
  StepLabel,
  Stepper,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Add as AddIcon,
  Close as CloseIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  Title as TitleIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const steps = ['Type de règle', 'Détails', 'Contenu'];

const checkmarkAnimation = keyframes`
  0% { 
    transform: scale(0) rotate(-45deg); 
    opacity: 0; 
  }
  50% { 
    transform: scale(1.2) rotate(5deg);
    opacity: 1; 
  }
  75% {
    transform: scale(0.95) rotate(-2deg);
  }
  100% { 
    transform: scale(1) rotate(0);
    opacity: 1; 
  }
`;

const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(46, 200, 102, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(46, 200, 102, 0); }
  100% { box-shadow: 0 0 0 0 rgba(46, 200, 102, 0); }
`;

const successMessageStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)',
  color: 'white',
  padding: '30px 50px',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  boxShadow: '0 10px 30px rgba(46, 125, 50, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  textAlign: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    padding: '2px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
  },
  '& svg': {
    fontSize: '5rem',
    marginBottom: '1.5rem',
    animation: `${checkmarkAnimation} 1s ease-in-out forwards`,
    filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))',
  },
  '& h3': {
    margin: '0.75rem 0',
    fontSize: '1.8rem',
    fontWeight: 700,
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    background: 'linear-gradient(to right, #fff, #e0f7fa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  '& p': {
    margin: '0.5rem 0',
    fontSize: '1.1rem',
    opacity: 0.95,
    maxWidth: '300px',
    lineHeight: 1.5,
  },
  '& .countdown': {
    marginTop: '1rem',
    width: '100%',
    height: '4px',
    background: 'rgba(255,255,255,0.3)',
    borderRadius: '2px',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      display: 'block',
      height: '100%',
      width: '100%',
      background: 'linear-gradient(90deg, #fff, #b9f6ca)',
      borderRadius: '2px',
      animation: 'countdown 3s linear forwards',
    },
    '@keyframes countdown': {
      '0%': { transform: 'translateX(0)' },
      '100%': { transform: 'translateX(-100%)' },
    },
  },
};

function AddRegle({ onRefresh, onClose, showButton = true }) {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [nom, setNom] = useState('');
  const [typeRegle, setTypeRegle] = useState('');
  const [contenu, setContenu] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const theme = useTheme();

  const TYPE_REGLE = [
    { 
      value: 'YARA', 
      label: 'Règle YARA', 
      icon: <SecurityIcon fontSize="large" />, 
      description: 'Détection de malwares et menaces',
      color: 'primary.main'
    },
    { 
      value: 'SIGMA', 
      label: 'Règle SIGMA', 
      icon: <BugReportIcon fontSize="large" />, 
      description: 'Détection d\'anomalies et de menaces',
      color: 'secondary.main'
    }
  ];

  const handleOpen = () => {
    setOpen(true);
    setError(null);
    setActiveStep(0);
  };

  const handleClose = () => {
    setOpen(false);
    setActiveStep(0);
    setNom('');
    setTypeRegle('');
    setContenu('');
    setDescription('');
    setError(null);
  };

  const handleNext = () => {
    if (activeStep === 0 && !typeRegle) {
      setError('Veuillez sélectionner un type de règle');
      return;
    }
    if (activeStep === 1 && !nom) {
      setError('Le nom de la règle est requis');
      return;
    }
    setError(null);
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeStep !== steps.length - 1) {
      handleNext();
      return;
    }

    if (!typeRegle || !nom || !contenu) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get CSRF token first
      await axiosInstance.get('/api/csrf/');
      
      // Then make the POST request with the CSRF token
      const response = await axiosInstance.post('/api/regles/', {
        nom,
        type: typeRegle,
        contenu,
        description
      });

      const nouvelleRegle = response.data;
      
      if (typeof onRefresh === 'function') {
        onRefresh();
      }
      
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        handleClose();
      }, 3000);
      
    } catch (error) {
      console.error('Erreur:', error);
      setError({
        type: 'error',
        message: 'Erreur lors de la création de la règle',
        details: error.response?.data?.detail || 
                error.response?.data?.message || 
                error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sélectionnez le type de règle
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choisissez le type de règle que vous souhaitez créer
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2, 
              mt: 3 
            }}>
              {TYPE_REGLE.map((type) => (
                <Paper
                  key={type.value}
                  onClick={() => {
                    setTypeRegle(type.value);
                    setError(null);
                  }}
                  elevation={typeRegle === type.value ? 3 : 1}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    border: `2px solid ${typeRegle === type.value ? theme.palette.primary.main : 'transparent'}`,
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    },
                    backgroundColor: typeRegle === type.value ? 
                      alpha(theme.palette.primary.light, 0.1) : 'background.paper',
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 1
                  }}>
                    <Box sx={{ 
                      color: typeRegle === type.value ? type.color : 'text.secondary',
                      mb: 1
                    }}>
                      {type.icon}
                    </Box>
                    <Typography variant="subtitle1" fontWeight={500}>
                      {type.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {type.description}
                    </Typography>
                    {typeRegle === type.value && (
                      <Box sx={{ 
                        mt: 1,
                        color: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        <CheckCircleIcon fontSize="small" />
                        <Typography variant="caption">Sélectionné</Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Détails de la règle
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Renseignez les informations de base de votre règle
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <TextField
                label="Nom de la règle"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <TitleIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <DescriptionIcon color="action" sx={{ mr: 1, mt: 1, alignSelf: 'flex-start' }} />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
                helperText="Décrivez l'objectif de cette règle (optionnel)"
              />
            </Box>
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Contenu de la règle
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Saisissez le code de votre règle {typeRegle}
                </Typography>
              </Box>
              <Tooltip title={`Documentation ${typeRegle}`}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => window.open(
                    typeRegle === 'YARA' 
                      ? 'https://yara.readthedocs.io/' 
                      : 'https://github.com/SigmaHQ/sigma',
                    '_blank'
                  )}
                  startIcon={<DescriptionIcon />}
                >
                  Documentation
                </Button>
              </Tooltip>
            </Box>
            
            <TextField
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              multiline
              rows={12}
              required
              fullWidth
              variant="outlined"
              placeholder={`// Saisissez votre règle ${typeRegle} ici...\n// Exemple :\n${typeRegle === 'YARA' ? 
  'rule ExampleRule\n{\n    meta:\n        description = "Exemple de règle YARA"\n    \n    strings:\n        $text_string = "malware"\n    \n    condition:\n        $text_string\n}'
  : 
  'title: Exemple de règle Sigma\ndescription: Détection d\'une activité suspecte\nstatus: experimental\nauthor: Votre Nom\ndate: 2023/01/01\nlogsource:\n    category: process_creation\n    product: windows\ndetection:\n    selection:\n        CommandLine|contains: "suspicious_command"\n    condition: selection\nlevel: high'}`}
              InputProps={{
                style: {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                },
                startAdornment: (
                  <CodeIcon color="action" sx={{ mr: 1, mt: 1, alignSelf: 'flex-start' }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: 'monospace',
                },
                '& textarea': {
                  fontFamily: 'monospace',
                  lineHeight: 1.5,
                },
              }}
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Astuce : Utilisez la syntaxe appropriée pour les règles {typeRegle}
              </Typography>
            </Box>
          </Box>
        );
      
      default:
        return 'Étape inconnue';
    }
  };

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
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: theme.shadows[2],
            },
          }}
        >
          Nouvelle Règle
        </Button>
      )}

      {showSuccess && (
        <Box sx={successMessageStyle}>
          <CheckCircleOutlineIcon />
          <Typography variant="h3">Succès !</Typography>
          <Typography>La règle a été créée avec succès.</Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            Vous serez redirigé dans quelques instants...
          </Typography>
          <Box className="countdown" />
        </Box>
      )}

      <Dialog 
        open={open} 
        onClose={!loading ? handleClose : null}
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: '60vh',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          },
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box>
            <Typography variant="h6" component="div">
              Créer une nouvelle règle
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {steps[activeStep]}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleClose} 
            disabled={loading}
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <Box sx={{ px: 3, pt: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <DialogContent sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
          {error && (
            <Alert 
              severity={error.type || 'error'} 
              sx={{ 
                mb: 3,
                '& .MuiAlert-message': {
                  width: '100%',
                }
              }}
            >
              <Box>
                <Typography fontWeight={500}>{error.message}</Typography>
                {error.details && typeof error.details === 'object' ? (
                  <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
                    {Object.entries(error.details).map(([key, value]) => (
                      <Box component="li" key={key}>
                        <Typography variant="body2">
                          <strong>{key}:</strong> {value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {error.details}
                  </Typography>
                )}
              </Box>
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ flex: 1 }}>
              {renderStepContent(activeStep)}
            </Box>

            <DialogActions sx={{ 
              p: 0, 
              pt: 2,
              mt: 'auto',
              borderTop: `1px solid ${theme.palette.divider}`,
              justifyContent: 'space-between',
            }}>
              <Button 
                onClick={activeStep === 0 ? handleClose : handleBack}
                disabled={loading}
                sx={{
                  minWidth: 100,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                {activeStep === 0 ? 'Annuler' : 'Retour'}
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading || (activeStep === 0 && !typeRegle) || (activeStep === 1 && !nom)}
                    sx={{
                      minWidth: 100,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: theme.shadows[2],
                      },
                    }}
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || !nom || !contenu}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{
                      minWidth: 120,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: theme.shadows[2],
                      },
                    }}
                  >
                    {loading ? 'Création...' : 'Créer la règle'}
                  </Button>
                )}
              </Box>
            </DialogActions>
          </Box>
        </DialogContent>

      </Dialog>
    </>
  );
}

export default AddRegle;
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../context/axiosInstance';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  Typography,
  IconButton,
  Paper,
  Divider,
  CircularProgress,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  Title as TitleIcon
} from '@mui/icons-material';

function EditRegle({ open, onClose, onRefresh, regle }) {
  // Fonction utilitaire pour récupérer un cookie par son nom
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Vérifier si le cookie commence par le nom recherché
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const [nom, setNom] = useState('');
  const [typeRegle, setTypeRegle] = useState('');
  const [contenu, setContenu] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    if (regle) {
      setNom(regle.nom);
      setTypeRegle(regle.type);
      setContenu(regle.contenu);
      setDescription(regle.description || '');
    }
  }, [regle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== Début de handleSubmit ===');
    console.log('Données du formulaire:', { nom, typeRegle, contenu, description });

    if (!nom || !contenu) {
      const errorMsg = 'Veuillez remplir tous les champs obligatoires';
      console.error('Validation error:', errorMsg);
      setError(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Envoi de la requête PATCH vers /api/regles/${regle.id}/`);
      
      // Créer l'objet de données à envoyer
      const dataToSend = {
        nom,
        type: typeRegle,
        contenu,
        description: description || ''
      };
      
      console.log('Données à envoyer:', JSON.stringify(dataToSend, null, 2));
      
      // Afficher les en-têtes de la requête
      const csrfToken = getCookie('csrftoken');
      console.log('CSRF Token:', csrfToken);
      
      const response = await axiosInstance.patch(
        `/api/regles/${regle.id}/`, 
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          },
          withCredentials: true
        }
      );
      
      console.log('Réponse du serveur:', response);
      console.log('Données de la réponse:', response.data);

      if (onRefresh) {
        console.log('Rafraîchissement de la liste des règles...');
        onRefresh();
      }
      
      console.log('Fermeture du dialogue...');
      onClose();
      
    } catch (error) {
      console.error('=== ERREUR ===');
      console.error('Erreur complète:', error);
      
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un statut d'erreur
        console.error('Statut de la réponse:', error.response.status);
        console.error('En-têtes de la réponse:', error.response.headers);
        console.error('Données de la réponse:', error.response.data);
        
        if (error.response.status === 403) {
          setError('Erreur d\'authentification. Veuillez vous reconnecter.');
        } else if (error.response.data) {
          // Essayer d'extraire un message d'erreur plus détaillé
          const data = error.response.data;
          if (typeof data === 'string') {
            setError(data);
          } else if (data.detail) {
            setError(data.detail);
          } else if (data.message) {
            setError(data.message);
          } else if (data.non_field_errors) {
            setError(data.non_field_errors.join(' '));
          } else {
            setError('Une erreur est survenue lors de la mise à jour de la règle');
          }
        } else {
          setError(`Erreur ${error.response.status}: ${error.response.statusText}`);
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error('Pas de réponse du serveur:', error.request);
        setError('Pas de réponse du serveur. Vérifiez votre connexion.');
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error('Erreur de configuration de la requête:', error.message);
        setError('Erreur de configuration de la requête: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setError(null);
  };

  return (
    <Dialog 
      open={open} 
      onClose={!loading ? handleClose : null}
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2,
        bgcolor: 'primary.main',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <DescriptionIcon />
          <Typography variant="h6">
            Modifier la règle
          </Typography>
        </Box>
        <IconButton 
          onClick={handleClose} 
          disabled={loading}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 0,
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <Box mb={3}>
            <Box display="flex" alignItems="center" mb={1}>
              <TitleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Nom de la règle
              </Typography>
            </Box>
            <TextField
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Entrez le nom de la règle"
              required
              disabled={loading}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9'
                }
              }}
            />
          </Box>

          <Box mb={3}>
            <Box display="flex" alignItems="center" mb={1}>
              <DescriptionIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Description
                <Typography component="span" variant="caption" color="text.disabled" ml={1}>
                  (optionnel)
                </Typography>
              </Typography>
            </Box>
            <TextField
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              size="small"
              variant="outlined"
              placeholder="Ajoutez une description à votre règle"
              disabled={loading}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9'
                }
              }}
            />
          </Box>

          <Box>
            <Box display="flex" alignItems="center" mb={1} justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <CodeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Contenu de la règle
                </Typography>
              </Box>
              <Tooltip title="Formater le code">
                <Button 
                  size="small" 
                  variant="text" 
                  color="primary"
                  disabled={loading}
                  sx={{ textTransform: 'none' }}
                >
                  Formater
                </Button>
              </Tooltip>
            </Box>
            <Paper 
              variant="outlined" 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                borderColor: theme.palette.divider
              }}
            >
              <TextField
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                fullWidth
                multiline
                rows={12}
                variant="outlined"
                required
                disabled={loading}
                placeholder={`// Saisissez le contenu de votre règle ici\n// Exemple de format pour une règle Yara ou Sigma`}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    fontFamily: '"Fira Code", "Roboto Mono", monospace',
                    fontSize: '0.875rem',
                    '& textarea': {
                      lineHeight: 1.5,
                      padding: 2
                    }
                  }
                }}
              />
            </Paper>
            <Box mt={1} display="flex" justifyContent="flex-end">
              <Typography variant="caption" color="text.disabled">
                {contenu.length} caractères
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          startIcon={<CancelIcon />}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            minWidth: 120
          }}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditRegle;
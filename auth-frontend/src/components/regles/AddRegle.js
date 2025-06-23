import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function AddRegle({ onRefresh, onClose, showButton = true }) {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState('');
  const [typeRegle, setTypeRegle] = useState('');
  const [contenu, setContenu] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const TYPE_REGLE = [
    { value: 'YARA', label: 'Règle YARA', icon: '', description: 'Règle pour la détection de malwares' },
    { value: 'SIGMA', label: 'Règle SIGMA', icon: '', description: 'Règle pour la détection d\'anomalies' }
  ];

  const handleOpen = () => {
    setOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setNom('');
    setTypeRegle('');
    setContenu('');
    setDescription('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!typeRegle || !nom || !contenu) {
      setError('Les champs obligatoires doivent être remplis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8000/regles/', {
        nom,
        type: typeRegle,
        contenu,
        description
      });

      // Récupérer les données de la nouvelle règle
      const nouvelleRegle = response.data;
      
      // Afficher un message de succès avec les détails de la règle
      alert(`Règle créée avec succès !\n\nNom: ${nouvelleRegle.nom}\nType: ${nouvelleRegle.type}\nDate de création: ${new Date(nouvelleRegle.date_creation).toLocaleDateString()}`);
      
      // Rafraîchir la liste des règles
      if (typeof onRefresh === 'function') {
        onRefresh();
      }
      handleClose();
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.detail || 
               error.response?.data?.message || 
               error.message || 
               'Erreur lors de la création de la règle');
    } finally {
      setLoading(false);
    }
  };

  const renderTypeRegle = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
      <Typography variant="h6">Type de Règle</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
        {TYPE_REGLE.map((type) => (
          <Button
            key={type.value}
            variant={typeRegle === type.value ? 'contained' : 'outlined'}
            onClick={() => setTypeRegle(type.value)}
            fullWidth
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 3,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: typeRegle === type.value ? 'primary.main' : 'action.hover'
              }
            }}
          >
            <Box component="span" sx={{ fontSize: 32, mb: 1 }}>
              {type.icon}
            </Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {type.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {type.description}
            </Typography>
          </Button>
        ))}
      </Box>
    </Box>
  );

  return (
    <div>
      {showButton && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Nouvelle Règle
        </Button>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Nouvelle Règle</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {renderTypeRegle()}
            
            <TextField
              label="Nom de la règle"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              fullWidth
              sx={{ mt: 2 }}
            />

            <TextField
              label="Description (optionnelle)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              fullWidth
              sx={{ mt: 2 }}
            />

            <TextField
              label="Contenu de la règle"
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              multiline
              rows={10}
              required
              fullWidth
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
            {loading ? 'Création...' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AddRegle;
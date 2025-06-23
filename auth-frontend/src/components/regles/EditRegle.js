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
import EditIcon from '@mui/icons-material/Edit';

function EditRegle({ open, onClose, onRefresh, regle }) {
  const [nom, setNom] = useState('');
  const [typeRegle, setTypeRegle] = useState('');
  const [contenu, setContenu] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    if (!nom || !contenu) {
      setError('Les champs obligatoires doivent être remplis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.patch(`http://localhost:8000/regles/${regle.id}/`, {
        nom,
        contenu,
        description
      });

      alert('Règle mise à jour avec succès !');
      if (onRefresh) onRefresh();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.detail || 
               error.response?.data?.message || 
               error.message || 
               'Erreur lors de la mise à jour de la règle');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setNom('');
    setTypeRegle('');
    setContenu('');
    setDescription('');
    setError(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Modifier la Règle</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
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
          {loading ? 'Mise à jour...' : 'Mettre à jour'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditRegle;
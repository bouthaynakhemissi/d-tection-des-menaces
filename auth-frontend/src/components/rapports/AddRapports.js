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
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function AddRapports({ onRefresh, onClose, showButton = true }) {
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [typeRapport, setTypeRapport] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [fichier, setFichier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(1);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserId(user.id);
    }
  }, []);

  const TYPE_RAPPORT = [
    { value: 'INCIDENT', label: 'Rapport d\'Incident' },
    { value: 'SECURITE', label: 'Rapport de Sécurité' },
    { value: 'AUDIT', label: 'Rapport d\'Audit' }
  ];

  const handleOpen = () => {
    setOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setTitre('');
    setDescription('');
    setTypeRapport('');
    setDateDebut('');
    setDateFin('');
    setFichier(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titre) {
      setError('Le titre est obligatoire');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('description', description);
      formData.append('type_rapport', typeRapport);
      formData.append('date_debut', dateDebut);
      formData.append('date_fin', dateFin);
      formData.append('statut', 'BROUILLON');
      formData.append('createur', userId);

    

      await axios.post('http://localhost:8000/rapports/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });

      alert('Rapport créé avec succès !');
      if (onRefresh) onRefresh();
      handleClose();
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.detail || 
               error.response?.data?.message || 
               error.message || 
               'Erreur lors de la création du rapport');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFichier(e.target.files[0]);
  };

  return (
    <div>
      {showButton && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Nouveau Rapport
        </Button>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Nouveau Rapport</DialogTitle>
        <DialogContent>
          {error && (
            <Box sx={{ color: 'error.main', mb: 2 }}>
              {error}
            </Box>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type de Rapport</InputLabel>
              <Select
                value={typeRapport}
                onChange={(e) => setTypeRapport(e.target.value)}
              >
                {TYPE_RAPPORT.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              required
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="date"
                label="Date de Début"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: '100%' }}
              />
              <TextField
                type="date"
                label="Date de Fin"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: '100%' }}
              />
            </Box>
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

export default AddRapports;
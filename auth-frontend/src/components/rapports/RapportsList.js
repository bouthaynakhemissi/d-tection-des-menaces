import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../context/axiosInstance';
import {
  TableContainer, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  CircularProgress,
  Box,
  Typography,
  Paper,
  IconButton,
  Alert,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  alpha,
  useTheme,
  Snackbar,
  Slide,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddRapports from './AddRapports';
import { 
  Visibility as VisibilityIcon, 
  Delete as DeleteIcon, 
  Download as DownloadIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import jsPDF from 'jspdf';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const getCreateurName = (rapport) => {
  if (!rapport) return 'Non spécifié';
  
  // Vérifier si createur_username existe directement
  if (rapport.createur_username) {
    return String(rapport.createur_username);
  }
  
  // Vérifier si createur est un objet avec une propriété username
  if (rapport.createur && typeof rapport.createur === 'object') {
    return String(rapport.createur.username || 'Utilisateur inconnu');
  }
  
  // Si createur est un ID ou autre chose
  return String(rapport.createur || 'Utilisateur inconnu');
};

function RapportsList({ onRefresh }) {
  const [rapports, setRapports] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
    transition: Fade
  });
  const theme = useTheme();

  const filteredRapports = useMemo(() => {
    return (rapports || []).filter(rapport => {
      if (!rapport) return false;
      
      const titre = String(rapport.titre || '').toLowerCase();
      const type = String(rapport.type_rapport || '').toLowerCase();
      const createur = String(getCreateurName(rapport)).toLowerCase();

      const search = String(searchTerm || '').toLowerCase();
      return (
        titre.includes(search) ||
        type.includes(search) ||
        createur.includes(search)
      );
    });
  }, [rapports, searchTerm]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchRapports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/api/rapports/');
      // Vérifier si la réponse est un tableau ou un objet avec une propriété 'results'
      const data = Array.isArray(response.data) ? response.data : 
                 (response.data && Array.isArray(response.data.results) ? response.data.results : []);
      
      setRapports(data);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      setError('Erreur lors du chargement des rapports');
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Erreur lors du chargement des rapports',
        severity: 'error',
        transition: Slide
      });
      
      // Rediriger vers la page de connexion si non authentifié
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteRapport = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      try {
        // D'abord, obtenir un nouveau token CSRF
        await axiosInstance.get('/api/csrf/');
        
        // Envoyer la requête avec les informations d'authentification
        const response = await axiosInstance.delete(`/api/rapports/${id}/`, {
          withCredentials: true,
          headers: {
            'X-CSRFToken': document.cookie
              .split('; ')
              .find(row => row.startsWith('csrftoken='))
              ?.split('=')[1],
          },
        });
        
        // Mettre à jour la liste des rapports
        fetchRapports();
        
        // Afficher un message de succès
        setSnackbar({
          open: true,
          message: response.data?.message || 'Rapport supprimé avec succès !',
          severity: 'success',
          transition: Slide
        });
        
      } catch (error) {
        console.error('Erreur lors de la suppression du rapport:', error);
        
        // Afficher un message d'erreur personnalisé
        let errorMessage = 'Erreur lors de la suppression du rapport';
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = 'Veuillez vous reconnecter pour effectuer cette action';
            window.location.href = '/login';
          } else if (error.response.status === 403) {
            errorMessage = 'Vous n\'avez pas la permission de supprimer ce rapport';
          } else if (error.response.data?.error) {
            errorMessage = error.response.data.error;
          }
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
          transition: Slide
        });
      }
    }
  };

  const handleOpen = (rapport) => {
    setSelectedRapport(rapport);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRapport(null);
  };

  const handleDownloadPDF = () => {
    if (!selectedRapport) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFillColor(248, 249, 250);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setFillColor(52, 152, 219, 0.1);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(31, 119, 180);
    doc.text(selectedRapport.titre || "Rapport", 20, 30);
    doc.setLineWidth(0.5);
    doc.setDrawColor(52, 152, 219);
    doc.line(20, 40, 190, 40);

    const cardWidth = 170;
    const cardHeight = 30;
    const cardMargin = 15;
    let currentY = 50;

    doc.setFillColor(255, 255, 255);
    doc.rect(20, currentY, cardWidth, cardHeight, 'F');
    doc.setFillColor(52, 152, 219, 0.1);
    doc.rect(20, currentY, cardWidth, 5, 'F');
    doc.setFontSize(12);
    doc.setTextColor(155, 89, 182);
    doc.text(`Type de Rapport: ${selectedRapport.type_rapport}`, 25, currentY + 20);
    currentY += cardHeight + cardMargin;

    doc.setFillColor(255, 255, 255);
    doc.rect(20, currentY, cardWidth, 50, 'F');
    doc.setFillColor(52, 152, 219, 0.1);
    doc.rect(20, currentY, cardWidth, 5, 'F');
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text(`Description:`, 25, currentY + 10);
    const descriptionLines = doc.splitTextToSize(selectedRapport.description, 150);
    doc.text(descriptionLines, 25, currentY + 15);
    currentY += 60;

    doc.setFillColor(255, 255, 255);
    doc.rect(20, currentY, cardWidth, cardHeight, 'F');
    doc.setFillColor(52, 152, 219, 0.1);
    doc.rect(20, currentY, cardWidth, 5, 'F');
    doc.setFontSize(12);
    doc.setTextColor(211, 84, 0);
    doc.text(
      `Période: De ${new Date(selectedRapport.date_debut).toLocaleDateString()} à ${new Date(selectedRapport.date_fin).toLocaleDateString()}`,
      25,
      currentY + 20
    );
    currentY += cardHeight + cardMargin;

    doc.setFillColor(255, 255, 255);
    doc.rect(20, currentY, cardWidth, cardHeight, 'F');
    doc.setFillColor(52, 152, 219, 0.1);
    doc.rect(20, currentY, cardWidth, 5, 'F');
    doc.setFontSize(12);
    doc.setTextColor(39, 174, 96);
    const createurName = getCreateurName(selectedRapport);
    doc.text(`Créateur: ${createurName}`, 25, currentY + 20);
    currentY += cardHeight + cardMargin;

    if (selectedRapport.fichier_rapport) {
      doc.setFillColor(255, 255, 255);
      doc.rect(20, currentY, cardWidth, cardHeight, 'F');
      doc.setFillColor(52, 152, 219, 0.1);
      doc.rect(20, currentY, cardWidth, 5, 'F');
      doc.setFontSize(12);
      doc.setTextColor(52, 73, 94);
      doc.text(`Fichier Attaché: ${selectedRapport.fichier_rapport}`, 25, currentY + 20);
      currentY += cardHeight + cardMargin;
    }

    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Généré le: ${currentDate}`, 20, 280);

    doc.save(`rapport_${selectedRapport.id}.pdf`);
    
    // Afficher l'alerte de succès
    setSnackbar({
      open: true,
      message: 'PDF téléchargé avec succès !',
      severity: 'success',
      transition: Slide
    });
  };

  useEffect(() => {
    fetchRapports();
  }, [onRefresh]);

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        TransitionComponent={snackbar.transition}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbar-root': {
            width: '100%',
            maxWidth: 500,
            margin: '0 auto'
          }
        }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            bgcolor: snackbar.severity === 'success' ? '#d4edda' : '#f8d7da',
            color: snackbar.severity === 'success' ? '#155724' : '#721c24',
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography component="h2" variant="h6" color="primary">
              Liste des Rapports
            </Typography>
            <TextField
              size="small"
              placeholder="Rechercher un rapport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fff',
                  borderRadius: 1,
                  '& fieldset': {
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => fetchRapports()}
              size="small"
              sx={{
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  animation: `${pulse} 1s infinite`
                }
              }}
            >
              <RefreshIcon sx={{ color: theme.palette.primary.main }} />
            </IconButton>
            <Typography variant="subtitle1" color="text.secondary">
              Total: {rapports.length} rapports
            </Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date Début</TableCell>
                <TableCell>Date Fin</TableCell>
                <TableCell>Créateur</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="error" variant="h6">
                      {error}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : !filteredRapports.length ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary" variant="h6">
                      Aucun rapport trouvé
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRapports.map((rapport) => (
                  <TableRow key={rapport.id}>
                    <TableCell>{rapport.titre}</TableCell>
                    <TableCell>{rapport.type_rapport}</TableCell>
                    <TableCell>
                      {new Date(rapport.date_debut).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(rapport.date_fin).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {getCreateurName(rapport)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Voir les détails">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpen(rapport)}
                            size="small"
                            sx={{
                              bgcolor: '#87CEEB',
                              '&:hover': {
                                bgcolor: '#00BFFF'
                              },
                              '&:active': {
                                bgcolor: '#0099CC'
                              }
                            }}
                          >
                            <VisibilityIcon sx={{ color: '#00BFFF' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton 
                            color="error" 
                            onClick={() => deleteRapport(rapport.id)}
                            size="small"
                            sx={{
                              bgcolor: '#FF6B6B',
                              '&:hover': {
                                bgcolor: '#FF4757'
                              },
                              '&:active': {
                                bgcolor: '#FF3D00'
                              }
                            }}
                          >
                            <DeleteIcon sx={{ color: '#FF4757' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={!!selectedRapport} onClose={() => setSelectedRapport(null)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedRapport?.titre || 'Détails du Rapport'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Type: {selectedRapport?.type_rapport}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Créateur: {getCreateurName(selectedRapport)}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Période: {new Date(selectedRapport?.date_debut).toLocaleDateString()} - {new Date(selectedRapport?.date_fin).toLocaleDateString()}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {selectedRapport?.description}
            </Typography>
            {selectedRapport?.fichier_rapport && (
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Fichier Attaché: {selectedRapport?.fichier_rapport}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDownloadPDF} 
            variant="contained" 
            color="primary"
            startIcon={<DownloadIcon />}
            sx={{
              bgcolor: '#ADD8E6',
              '&:hover': {
                bgcolor: '#87CEEB'
              }
            }}
          >
            Télécharger PDF
          </Button>
        </DialogActions>
      </Dialog>

      <AddRapports
        open={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          fetchRapports();
        }}
        onRefresh={fetchRapports}
      />
    </Box>
  );
}

export default RapportsList;
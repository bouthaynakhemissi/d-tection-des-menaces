import React, { useState, useEffect } from 'react';
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
  Fade
} from '@mui/material';
import AddRegle from './AddRegle';
import EditRegle from './EditRegle';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';

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

function ReglesList() {
  const [regles, setRegles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRegle, setSelectedRegle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
    transition: Fade
  });
  const theme = useTheme();

  const fetchRegles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/api/regles/');
      
      // Gestion des différents formats de réponse
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        data = response.data.results;
      } else if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      }
  
      console.log('Données récupérées:', data);
      setRegles(data);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des règles:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setError('Erreur lors du chargement des règles');
      setSnackbar({
        open: true,
        message: 'Erreur lors du chargement des règles',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (regleId, regleName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la règle "${regleName}" ?`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/regles/${regleId}/`);
      setSnackbar({
        open: true,
        message: 'Règle supprimée avec succès',
        severity: 'success',
        transition: Slide
      });
      fetchRegles();
    } catch (error) {
      console.error('Error deleting regle:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la suppression de la règle',
        severity: 'error',
        transition: Slide
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({...snackbar, open: false});
  };

  const handleEdit = (regle) => {
    setSelectedRegle(regle);
    setEditOpen(true);
  };

  const filteredRegles = regles.filter(regle => 
    regle.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    regle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (regle.description && regle.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    fetchRegles();
  }, []);

  const getTypeColor = (type) => {
    switch(type.toLowerCase()) {
      case 'yara':
        return 'primary';
      case 'sigma':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper 
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[1],
          '&:hover': {
            boxShadow: theme.shadows[3],
          },
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Box 
          sx={{
            p: 3,
            bgcolor: 'background.paper',
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Box>
            <Typography variant="h5" component="h1" fontWeight={600}>
              Gestion des Règles
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredRegles.length} {filteredRegles.length <= 1 ? 'règle' : 'règles'} trouvée{filteredRegles.length > 1 ? 's' : ''}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Rechercher une règle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 2,
                  minWidth: 250,
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={fetchRegles}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <RefreshIcon 
                    sx={{
                      transition: 'transform 0.5s ease-in-out',
                      transform: loading ? 'rotate(360deg)' : 'rotate(0deg)'
                    }} 
                  />
                )
              }
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                minWidth: 140,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease',
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                '&.Mui-disabled': {
                  background: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled,
                  boxShadow: 'none'
                }
              }}
            >
              {loading ? 'Actualisation...' : 'Actualiser'}
            </Button>
            <AddRegle onRefresh={fetchRegles} showButton={true} />
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date de Création</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Chargement des règles...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        maxWidth: 500, 
                        mx: 'auto',
                        '& .MuiAlert-message': {
                          width: '100%',
                        }
                      }}
                    >
                      <Box>
                        <Typography fontWeight={500}>{error}</Typography>
                        <Button 
                          onClick={fetchRegles} 
                          color="error" 
                          size="small" 
                          sx={{ mt: 1 }}
                        >
                          Réessayer
                        </Button>
                      </Box>
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : filteredRegles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                      <SearchIcon 
                        sx={{ 
                          fontSize: 60, 
                          color: 'text.disabled', 
                          mb: 2,
                          animation: `${pulse} 2s infinite`,
                        }} 
                      />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Aucune règle trouvée
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {searchTerm ? 
                          'Aucune règle ne correspond à votre recherche.' : 
                          'Commencez par ajouter votre première règle.'
                        }
                      </Typography>
                      {!searchTerm && <AddRegle onRefresh={fetchRegles} showButton={true} />}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRegles.map((regle) => (
                  <TableRow 
                    key={regle.id}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      },
                      '&:last-child td': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={500}>
                        {regle.nom}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={regle.type}
                        color={getTypeColor(regle.type)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '300px',
                        }}
                      >
                        {regle.description || 'Aucune description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(regle.date_creation).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(regle)}
                            sx={{
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(regle.id, regle.nom)}
                            sx={{
                              '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
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

      <EditRegle
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedRegle(null);
        }}
        onRefresh={fetchRegles}
        regle={selectedRegle}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        TransitionComponent={snackbar.transition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 'unset',
            borderRadius: 2,
            boxShadow: theme.shadows[6]
          }
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          iconMapping={{
            success: <SuccessIcon fontSize="inherit" />,
            error: <ErrorIcon fontSize="inherit" />
          }}
          sx={{
            width: '100%',
            alignItems: 'center',
            '& .MuiAlert-message': {
              display: 'flex',
              alignItems: 'center'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ReglesList;
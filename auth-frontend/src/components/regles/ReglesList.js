import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TableContainer, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Alert
} from '@mui/material';
import AddRegle from './AddRegle';
import EditRegle from './EditRegle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function ReglesList() {
  const [regles, setRegles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRegle, setSelectedRegle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRegles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/regles/');
      const data = Array.isArray(response.data) ? response.data : [];
      setRegles(data);
    } catch (error) {
      console.error('Error fetching regles:', error);
      setError('Erreur lors du chargement des règles');
      setRegles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (regleId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette règle ?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/regles/${regleId}/`);
      fetchRegles();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression de la règle');
    }
  };

  const handleEdit = (regle) => {
    setSelectedRegle(regle);
    setEditOpen(true);
  };

  useEffect(() => {
    fetchRegles();
  }, []);

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography variant="h6" id="tableTitle" component="div">
              Liste des Règles
            </Typography>
            <AddRegle onRefresh={fetchRegles} showButton={true} />
          </Toolbar>
        </AppBar>
        <TableContainer>
          <Table aria-label="customized table">
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Date de Création</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Alert severity="error">{error}</Alert>
                  </TableCell>
                </TableRow>
              ) : (
                regles.map((regle) => (
                  <TableRow key={regle.id}>
                    <TableCell>{regle.nom}</TableCell>
                    <TableCell>{regle.type}</TableCell>
                    <TableCell>{regle.description || 'Aucune description'}</TableCell>
                    <TableCell>{new Date(regle.date_creation).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(regle)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(regle.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
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
    </Box>
  );
}

export default ReglesList;
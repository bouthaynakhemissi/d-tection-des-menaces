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
  Toolbar
} from '@mui/material';
import AddRapports from './AddRapports';
import jsPDF from "jspdf";

function RapportsList({ onRefresh }) {
  const [rapports, setRapports] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchRapports();
  }, [onRefresh]);

  const fetchRapports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/get-rapports/',{ withCredentials: true });
      const data = Array.isArray(response.data) ? response.data : [];
      setRapports(data);
    } catch (error) {
      console.error('Error fetching rapports:', error);
      setError('Erreur lors du chargement des rapports');
      setRapports([]);
    } finally {
      setLoading(false);
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
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(selectedRapport.titre || "Rapport", 10, 15);

  doc.setFontSize(12);
  doc.text(`Type: ${selectedRapport.type_rapport}`, 10, 30);
  doc.text(`Description: ${selectedRapport.description}`, 10, 40);
  doc.text(
    `Dates: De ${new Date(selectedRapport.date_debut).toLocaleDateString()} à ${new Date(selectedRapport.date_fin).toLocaleDateString()}`,
    10,
    50
  );
  doc.text(`Créateur: ${selectedRapport.createur}`, 10, 60);

  doc.save(`${selectedRapport.titre || "rapport"}.pdf`);
};

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography variant="h6" id="tableTitle" component="div">
              Liste des Rapports
            </Typography>
            
          </Toolbar>
        </AppBar>
        <TableContainer>
          <Table aria-label="customized table">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Titre</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Date de Début</TableCell>
                <TableCell>Date de Fin</TableCell>
                <TableCell>Créateur</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="error">{error}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rapports.map((rapport) => (
                  <TableRow key={rapport.id}>
                    <TableCell>{rapport.type_rapport}</TableCell>
                    <TableCell>{rapport.titre}</TableCell>
                    <TableCell>{rapport.description}</TableCell>
                    <TableCell>{new Date(rapport.date_debut).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(rapport.date_fin).toLocaleDateString()}</TableCell>
                    <TableCell>{rapport.createur}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpen(rapport)}
                      >
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog de détail */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedRapport?.titre}</DialogTitle>
        <DialogContent>
          {selectedRapport && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Type:</Typography>
              <Typography variant="body1">{selectedRapport.type_rapport}</Typography>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>Description:</Typography>
              <Typography variant="body1">{selectedRapport.description}</Typography>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>Dates:</Typography>
              <Typography variant="body1">
                De {new Date(selectedRapport.date_debut).toLocaleDateString()} à {new Date(selectedRapport.date_fin).toLocaleDateString()}
              </Typography>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>Créateur:</Typography>
              <Typography variant="body1">{selectedRapport.createur}</Typography>

              {selectedRapport.fichier_rapport && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Fichier:</Typography>
                  <a href={selectedRapport.fichier_rapport} target="_blank" rel="noopener noreferrer">
                    {selectedRapport.fichier_rapport.split('/').pop()}
                  </a>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Fermer</Button>
        </DialogActions>
        <DialogActions>
  <Button onClick={handleDownloadPDF} variant="contained" color="primary">
    Télécharger en PDF
  </Button>
</DialogActions>
      </Dialog>

      {/* Dialog d'ajout */}
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
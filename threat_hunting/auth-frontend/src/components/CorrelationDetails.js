import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Paper,
  Box,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  Event as EventIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

const CorrelationDetails = ({ open, onClose, correlation }) => {
  if (!correlation) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="warning" />
          Détails de la corrélation #{correlation.id}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informations générales
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Description" 
                    secondary={correlation.description} 
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EventIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Date de détection" 
                    secondary={new Date(correlation.date_creation).toLocaleString()} 
                  />
                </ListItem>
              </List>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Niveau de menace
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" alignItems="center" gap={2}>
              <Chip
                label={correlation.score_confiance > 0.7 ? 'Élevé' : correlation.score_confiance > 0.4 ? 'Moyen' : 'Faible'}
                color={correlation.score_confiance > 0.7 ? 'error' : correlation.score_confiance > 0.4 ? 'warning' : 'success'}
                variant="outlined"
              />
                <Box flexGrow={1}>
                  <Box
                    height={8}
                    bgcolor={
                      correlation.score_confiance > 0.7 ? 'error.main' : 
                      correlation.score_confiance > 0.4 ? 'warning.main' : 'success.main'
                    }
                    borderRadius={4}
                  />
                </Box>
                <Typography variant="body2">
                  {Math.round(correlation.score_confiance * 100)}%
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Résultats associés
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {correlation.resultats && correlation.resultats.length > 0 ? (
                <List>
                  {correlation.resultats.map((resultat, index) => (
                    <Accordion key={index} variant="outlined">
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" gap={1} width="100%">
                          {resultat.type_analyse === 'YARA' ? (
                            <CodeIcon color="primary" />
                          ) : (
                            <InfoIcon color="secondary" />
                          )}
                          <Typography>
                            {resultat.type_analyse} - {resultat.regle?.nom || 'Sans nom'}
                          </Typography>
                          <Box flexGrow={1} />
                          <Chip
                            label={resultat.severite}
                            size="small"
                            color={
                              resultat.severite === 'HIGH' ? 'error' :
                              resultat.severite === 'MEDIUM' ? 'warning' : 'info'
                            }
                            variant="outlined"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" component="div">
                          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                            {JSON.stringify(resultat.resultat, null, 2)}
                          </pre>
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Aucun résultat associé
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CorrelationDetails;
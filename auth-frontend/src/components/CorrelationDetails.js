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
  AccordionDetails,
  keyframes,
  styled
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  Event as EventIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

// Palette de couleurs
const colors = {
  primary: '#2563eb',
  secondary: '#1e40af',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  background: '#f8fafc',
  surface: '#edf2f7',
  text: '#1f2937',
  border: '#e2e8f0',
  hover: '#cbd5e1',
  focus: '#60a5fa',
  icon: '#6b7280',
  active: '#3b82f6',
  disabled: '#d1d5db',
  shadow: 'rgba(0, 0, 0, 0.1)',
  gradient1: '#6366f1',
  gradient2: '#4338ca',
  gradient3: '#3730a3'
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
  animation: `${fadeIn} 0.5s ease-out`
}));

const StyledChip = styled(Chip)(({ theme, color }) => ({
  animation: `${fadeIn} 0.5s ease-out`,
  '& .MuiChip-label': {
    fontWeight: 500,
  },
  backgroundColor: color ? alpha(colors[color], 0.1) : alpha(colors.primary, 0.1),
  '&:hover': {
    backgroundColor: color ? alpha(colors[color], 0.2) : alpha(colors.primary, 0.2),
  }
}));

const CorrelationDetails = ({ open, onClose, correlation }) => {
  if (!correlation) return null;

  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          background: colors.surface,
          boxShadow: `0 8px 32px ${colors.shadow}`
        }
      }}
    >
      <DialogTitle sx={{
        p: 3,
        background: colors.primary,
        color: 'white',
        borderRadius: '16px 16px 0 0'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon sx={{ color: 'white' }} />
          <Typography variant="h6" color="white">
            Détails de la corrélation #{correlation.id}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledPaper variant="outlined">
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{
                  color: colors.text,
                  fontWeight: 600,
                  animation: `${fadeIn} 0.5s ease-out`
                }}
              >
                Informations générales
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <DescriptionIcon sx={{ color: colors.primary }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Description" 
                    secondary={correlation.description} 
                    secondaryTypographyProps={{ 
                      component: 'div',
                      color: colors.icon
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EventIcon sx={{ color: colors.info }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Date de détection" 
                    secondary={new Date(correlation.date_creation).toLocaleString()} 
                    secondaryTypographyProps={{ color: colors.icon }}
                  />
                </ListItem>
              </List>
            </StyledPaper>

            <StyledPaper variant="outlined">
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{
                  color: colors.text,
                  fontWeight: 600,
                  animation: `${fadeIn} 0.5s ease-out 0.2s`
                }}
              >
                Niveau de menace
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" alignItems="center" gap={2}>
                <StyledChip
                  label={correlation.score_confiance > 0.7 ? 'Élevé' : 
                         correlation.score_confiance > 0.4 ? 'Moyen' : 'Faible'}
                  color={correlation.score_confiance > 0.7 ? 'error' : 
                         correlation.score_confiance > 0.4 ? 'warning' : 'success'}
                />
                <Box flexGrow={1}>
                  <Box
                    height={8}
                    bgcolor={
                      correlation.score_confiance > 0.7 ? colors.error : 
                      correlation.score_confiance > 0.4 ? colors.warning : colors.success
                    }
                    borderRadius={4}
                    sx={{
                      animation: `${fadeIn} 0.5s ease-out 0.3s`
                    }}
                  />
                </Box>
                <Typography 
                  variant="body2"
                  sx={{
                    color: colors.text,
                    animation: `${fadeIn} 0.5s ease-out 0.4s`
                  }}
                >
                  {Math.round(correlation.score_confiance * 100)}%
                </Typography>
              </Box>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledPaper variant="outlined">
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{
                  color: colors.text,
                  fontWeight: 600,
                  animation: `${fadeIn} 0.5s ease-out 0.5s`
                }}
              >
                Résultats associés
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {correlation.resultats && correlation.resultats.length > 0 ? (
                <List>
                  {correlation.resultats.map((resultat, index) => (
                    <Accordion 
                      key={index} 
                      variant="outlined"
                      sx={{
                        mb: 1,
                        animation: `${fadeIn} 0.5s ease-out ${0.6 + index * 0.1}s`
                      }}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMoreIcon sx={{ color: colors.icon }} />}
                      >
                        <Box display="flex" alignItems="center" gap={1} width="100%">
                          {resultat.type_analyse === 'YARA' ? (
                            <CodeIcon sx={{ color: colors.primary }} />
                          ) : (
                            <InfoIcon sx={{ color: colors.secondary }} />
                          )}
                          <Typography sx={{
                            color: colors.text,
                            fontWeight: 500
                          }}>
                            {resultat.type_analyse} - {resultat.regle?.nom || 'Sans nom'}
                          </Typography>
                          <Box flexGrow={1} />
                          <StyledChip
                            label={resultat.severite}
                            size="small"
                            color={getSeverityColor(resultat.severite)}
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography 
                          variant="body2" 
                          component="div"
                          sx={{
                            color: colors.text,
                            animation: `${fadeIn} 0.5s ease-out ${0.7 + index * 0.1}s`
                          }}
                        >
                          <pre style={{ 
                            whiteSpace: 'pre-wrap', 
                            fontFamily: 'monospace',
                            color: colors.text
                          }}>
                            {JSON.stringify(resultat.resultat, null, 2)}
                          </pre>
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </List>
              ) : (
                <Typography 
                  variant="body2" 
                  color={colors.icon}
                  sx={{
                    animation: `${fadeIn} 0.5s ease-out 0.8s`
                  }}
                >
                  Aucun résultat associé
                </Typography>
              )}
            </StyledPaper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{
        p: 3,
        background: colors.surface,
        borderRadius: '0 0 16px 16px'
      }}>
        <Button 
          onClick={onClose} 
          color="primary"
          sx={{
            bgcolor: colors.primary,
            color: 'white',
            textTransform: 'none',
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontSize: '1rem',
            animation: `${fadeIn} 0.5s ease-out 0.9s`,
            '&:hover': {
              bgcolor: colors.secondary,
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 12px ${colors.shadow}`
            },
            '&:disabled': {
              bgcolor: colors.disabled,
              color: colors.icon
            }
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CorrelationDetails;
// Ajoutez ces imports en haut du fichier
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Chip
  } from '@mui/material';
  import {
    Code as CodeIcon,
    Description as DescriptionIcon,
    CalendarToday as CalendarIcon,
    Category as CategoryIcon,
    Security as SecurityIcon
  } from '@mui/icons-material';
  
  // Ajoutez ce composant avant le composant ReglesList
  const RegleDetails = ({ open, onClose, regle }) => {
    if (!regle) return null;
  
    return (
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 2,
          bgcolor: 'primary.main',
          color: 'white',
          py: 2
        }}>
          <SecurityIcon fontSize="large" />
          <Box>
            <Typography variant="h6">{regle.nom}</Typography>
            <Typography variant="subtitle2" color="rgba(255, 255, 255, 0.7)">
              Détails de la règle
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <CategoryIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Type de règle" 
                secondary={
                  <Chip 
                    label={regle.type} 
                    color={getTypeColor(regle.type)}
                    variant="outlined"
                    size="small"
                  />
                } 
              />
            </ListItem>
            
            <Divider variant="inset" component="li" />
  
            <ListItem>
              <ListItemIcon>
                <DescriptionIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Description" 
                secondary={regle.description || 'Aucune description disponible'} 
                secondaryTypographyProps={{ 
                  sx: { 
                    whiteSpace: 'pre-line',
                    color: 'text.primary'
                  } 
                }}
              />
            </ListItem>
  
            <Divider variant="inset" component="li" />
  
            <ListItem>
              <ListItemIcon>
                <CodeIcon color="primary" />
              </ListItemIcon>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Contenu de la règle
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: 300,
                    '& pre': {
                      margin: 0,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }
                  }}
                >
                  <pre>{regle.contenu || 'Aucun contenu disponible'}</pre>
                </Paper>
              </Box>
            </ListItem>
  
            <Divider variant="inset" component="li" />
  
            <ListItem>
              <ListItemIcon>
                <CalendarIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Date de création" 
                secondary={new Date(regle.date_creation).toLocaleString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })} 
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="primary" variant="outlined">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Dans le composant ReglesList, ajoutez ces états :
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRegleDetails, setSelectedRegleDetails] = useState(null);
  
  // Modifiez la fonction handleViewDetails :
  const handleViewDetails = (regle) => {
    setSelectedRegleDetails(regle);
    setDetailsOpen(true);
  };
  

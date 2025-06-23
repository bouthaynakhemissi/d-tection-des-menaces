import React, { useState, useEffect } from "react";
import { 
  Drawer, List, ListItem, ListItemIcon, ListItemText, 
  Box, Typography, Paper, Divider, CircularProgress,
  AppBar, Toolbar, Button, InputBase, styled, alpha, IconButton, TextField
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TableChartIcon from "@mui/icons-material/TableChart";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SecurityIcon from "@mui/icons-material/Security";
import DescriptionIcon from "@mui/icons-material/Description";
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import TimelineIcon from '@mui/icons-material/Timeline';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import FileAnalyzer from '../components/FileAnalyzer'; 
import axios from "axios";

const textColor = "#ffffff";
const API_BASE_URL = "http://localhost:8000"; // adapte si besoin

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.1),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(0, 0, 0, 0.6)',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'rgba(0, 0, 0, 0.87)',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [stats, setStats] = useState({
    alerts: 5,
    reports: 12,
    rules: 8
  });

  // Gestion des IPs
  const [ip, setIp] = useState('');
  const [machines, setMachines] = useState([]);

  const fetchMachines = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/machines/`);
      setMachines(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des machines:", error);
    }
  };

  const addMachine = async () => {
    if (!ip) return;
    try {
      await axios.post(`${API_BASE_URL}/machines/`, { ip_address: ip });
      setIp('');
      fetchMachines();
    } catch (error) {
      alert("Erreur lors de l'ajout de la machine: " + (error.response?.data?.ip_address || error.message));
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
        setLoading(false);
      }
    };
    fetchStats();
    fetchMachines();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Barre de navigation supérieure */}
      <AppBar 
        position="fixed" 
        sx={{ 
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: '240px' },
          backgroundColor: '#ffffff',
          color: 'rgba(0, 0, 0, 0.87)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: 'rgba(0, 0, 0, 0.87)'
            }}
          >
            <DashboardIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'rgba(0,0,0,0.87)' }}>
            <DashboardIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Tableau de bord
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'rgba(0, 0, 0, 0.87)' }}>
              {user.email}
            </Typography>
          )}
          </Box>
          <Button 
              color="inherit" 
              component={Link} 
              to="/profile"
              startIcon={<AccountCircleIcon />}
              sx={{ 
                color: 'rgba(0, 0, 0, 0.87)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Profile
            </Button>
            <Button 
              color="error"
              onClick={handleLogout}
              startIcon={<ExitToAppIcon />}
              sx={{ 
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.08)'
                }
              }}
            >
              Déconnexion
            </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: '#424242',
            color: textColor,
          },
          display: { xs: 'none', sm: 'block' }
        }}
      >
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <SecurityIcon sx={{ fontSize: 40, mb: 1, color: '#ffffff' }} />
          <Typography variant="h6">Threat Hunting</Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
        <List>
          <ListItem button component={Link} to="/dashboard">
            <ListItemIcon sx={{ color: textColor }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Tableau de bord" 
              primaryTypographyProps={{ style: { color: '#ffffff' } }} 
            />
          </ListItem>
          <ListItem button component={Link} to="/rapports">
            <ListItemIcon sx={{ color: textColor }}>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Rapports" 
              primaryTypographyProps={{ style: { color: '#ffffff' } }} 
            />
          </ListItem>
          <ListItem button component={Link} to="/regles">
            <ListItemIcon sx={{ color: textColor }}>
              <TableChartIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Règles" 
              primaryTypographyProps={{ style: { color: '#ffffff' } }} 
            />
          </ListItem>
          <ListItem button component={Link} to="/notifications">
            <ListItemIcon sx={{ color: textColor }}>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Alertes" 
              primaryTypographyProps={{ style: { color: '#ffffff' } }} 
            />
          </ListItem>
          
          <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.12)' }} />
          
          {/* Section Test Email et Corrélations */}
          <Box sx={{ p: 1 }}>
            <Button
              fullWidth
              color="inherit"
              component={Link}
              to="/test-email"
              startIcon={<EmailIcon />}
              sx={{
                justifyContent: 'flex-start',
                px: 3,
                py: 1.5,
                mb: 1,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              Envoyer un  Email
            </Button>
            <Button
              fullWidth
              color="inherit"
              component={Link}
              to="/correlation"
              startIcon={<TimelineIcon />}
              sx={{
                justifyContent: 'flex-start',
                px: 3,
                py: 1.5,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              Corrélations
            </Button>
          </Box>

          <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.12)' }} />
          
          {/* Section Analyse de Fichiers */}
          <Box sx={{ p: 1 }}>
            <Button
              fullWidth
              color="inherit"
              component={Link}
              to="/file-analyzer"
              startIcon={<DescriptionIcon />}
              sx={{
                justifyContent: 'flex-start',
                px: 3,
                py: 1.5,
                mb: 1,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              Analyse de fichier
            </Button>
            <Button
              fullWidth
              color="inherit"
              component={Link}
              to="/sigma-analyzer"
              startIcon={<TimelineIcon />}
              sx={{
                justifyContent: 'flex-start',
                px: 3,
                py: 1.5,
                mb: 1,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              Analyse les logs
            </Button>
          </Box>
        </List>
      </Drawer>

      {/* Contenu principal */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          pt: 10,
          backgroundColor: '#f5f5f5', 
          minHeight: '100vh',
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: '240px' }
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: '#424242' }}>
          Tableau de bord
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          mb: 4, 
          flexWrap: 'wrap' 
        }}>
          <Paper sx={{ 
            p: 3, 
            flex: 1, 
            minWidth: 250, 
            borderRadius: 2, 
            boxShadow: 3,
            backgroundColor: '#616161',
            color: 'white'
          }}>
            <Typography variant="h6" sx={{ color: 'white' }} gutterBottom>
              Alertes en cours
            </Typography>
            <Typography variant="h3" sx={{ color: 'white' }}>
              {stats.alerts}
            </Typography>
          </Paper>
        </Box>

        {/* Bloc gestion IP */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Gestion des adresses IP des machines</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Adresse IP"
              value={ip}
              onChange={e => setIp(e.target.value)}
              size="small"
              variant="outlined"
            />
            <Button variant="contained" color="primary" onClick={addMachine}>
              Ajouter
            </Button>
          </Box>
          <List>
            {machines.length === 0 ? (
              <ListItem>Aucune machine enregistrée.</ListItem>
            ) : (
              machines.map(machine => (
                <ListItem key={machine.id}>{machine.ip_address}</ListItem>
              ))
            )}
          </List>
        </Box>
      </Box>
    </Box>
  );
}
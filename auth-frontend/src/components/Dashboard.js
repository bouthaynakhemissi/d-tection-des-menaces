import React, { useState, useEffect } from "react";
import { 
  Drawer, List, ListItem, ListItemIcon, ListItemText, 
  Box, Typography, Paper, Divider, CircularProgress,
  AppBar, Toolbar, Button, InputBase, IconButton, TextField,
  styled, alpha, Grid
} from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import axios from "axios";
import { keyframes } from '@mui/material/styles';

const textColor = "#ffffff";
const API_BASE_URL = "http://localhost:8000";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
`;
const IconWrapper = styled(Box)`
  transition: transform 0.3s ease, opacity 0.3s ease;
  &:hover {
    transform: scale(1.1);
    opacity: 1;
  }
  animation: ${fadeIn} 0.5s ease-out;
`;


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

const DashboardContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#f5f7fa',
  minHeight: '100vh',
  transition: 'all 0.3s ease',
  '&:hover': {
    '& .stat-card': {
      transform: 'translateY(-5px)',
    },
  },
}));

const StatCard = styled(Box)(({ theme, color = '#43a047' }) => ({
  background: `linear-gradient(135deg, ${color} 0%, ${color}90 100%)`,
  color: 'white',
  borderRadius: '16px',
  padding: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  animation: `${fadeIn} 0.6s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px) !important',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '2.5rem',
    marginBottom: theme.spacing(1),
    opacity: 0.9,
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  paddingBottom: theme.spacing(1),
  marginBottom: theme.spacing(3),
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '60px',
    height: '4px',
    background: 'linear-gradient(90deg, #43a047, #2e7d32)',
    borderRadius: '2px',
  },
}));

const MachineItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '8px',
  marginBottom: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateX(5px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    '& .machine-actions': {
      opacity: 1,
      visibility: 'visible',
    },
  },
  '& .machine-actions': {
    opacity: 0,
    visibility: 'hidden',
    transition: 'all 0.2s ease',
  },
}));

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [stats] = useState({
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
    <DashboardContainer>
      <Box sx={{ display: 'flex' }}>
        {/* Barre de navigation supérieure */}
        <AppBar 
          position="fixed" 
          sx={{ 
            width: { sm: `calc(100% - 240px)` },
            ml: { sm: '240px' },
            backgroundColor: '#ffffff',
            color: 'rgba(0, 0, 0, 0.87)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            zIndex: 1300
          }}
        >
          <Toolbar sx={{ px: { sm: 3 } }}>
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
              <MuiIcons.Menu />
            </IconButton>
            
            <Typography variant="h6" component="div" sx={{ 
              flexGrow: 1, 
              color: 'rgba(0,0,0,0.87)',
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}>
              <IconWrapper>
                <MuiIcons.Dashboard sx={{ 
                  verticalAlign: 'middle', 
                  mr: 1, 
                  color: '#43a047',
                  animation: `${fadeIn} 0.5s ease-out`
                }} />
              </IconWrapper>
              Tableau de bord  
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Search>
                <SearchIconWrapper>
                  <MuiIcons.Search sx={{ color: 'rgba(0, 0, 0, 0.4)' }} />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Rechercher..."
                  inputProps={{ 'aria-label': 'search' }}
                />
              </Search>
              
              {user && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'rgba(0, 0, 0, 0.87)' }}>
                    {user.email}
                  </Typography>
                </Box>
              )}
              
              <Button 
                color="inherit" 
                component={Link} 
                to="/profile"
                startIcon={
                  <IconWrapper>
                    <MuiIcons.AccountCircle sx={{ color: '#43a047' }} />
                  </IconWrapper>
                }
                sx={{ 
                  color: 'rgba(0, 0, 0, 0.87)',
                  '&:hover': {
                    backgroundColor: 'rgba(67, 160, 71, 0.08)'
                  }
                }}
              >
                Profile
              </Button>
              <Button 
                color="error"
                onClick={handleLogout}
                startIcon={
                  <IconWrapper>
                    <MuiIcons.ExitToApp sx={{ color: '#ff1744' }} />
                  </IconWrapper>
                }
                sx={{ 
                  '&:hover': {
                    backgroundColor: 'rgba(255, 23, 68, 0.12)'
                  }
                }}
              >
                Déconnexion
              </Button>
            </Box>
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
              backgroundColor: '#2c3e50',
              color: textColor,
              borderRight: 'none'
            },
            display: { xs: 'none', sm: 'block' }
          }}
        >
          <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#2c3e50' }}>
            <IconWrapper>
              <MuiIcons.Security sx={{ fontSize: 40, mb: 1, color: '#43a047' }} />
            </IconWrapper>
            <Typography variant="h5" sx={{ color: textColor, fontWeight: 600 }}>
              Threat Hunting
            </Typography>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
          
          <List>
            {[
              { 
                icon: (
                  <IconWrapper>
                    <MuiIcons.Dashboard sx={{ 
                      color: textColor,
                      animation: `${fadeIn} 0.5s ease-out`
                    }} />
                  </IconWrapper>
                ), 
                text: 'Tableau de bord', 
                path: '/dashboard' 
              },
              { 
                icon: (
                  <IconWrapper>
                    <MuiIcons.Description sx={{ 
                      color: textColor,
                      animation: `${fadeIn} 0.5s ease-out`
                    }} />
                  </IconWrapper>
                ), 
                text: 'Rapports', 
                path: '/rapports' 
              },
              { 
                icon: (
                  <IconWrapper>
                    <MuiIcons.TableChart sx={{ 
                      color: textColor,
                      animation: `${fadeIn} 0.5s ease-out`
                    }} />
                  </IconWrapper>
                ), 
                text: 'Règles', 
                path: '/regles' 
              },
              { 
                icon: (
                  <IconWrapper>
                    <MuiIcons.Notifications sx={{ 
                      color: textColor,
                      animation: `${fadeIn} 0.5s ease-out`
                    }} />
                  </IconWrapper>
                ), 
                text: 'Alertes', 
                path: '/notifications' 
              },
            ].map((item) => (
              <ListItem 
                button 
                component={Link} 
                to={item.path}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(67, 160, 71, 0.2)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(67, 160, 71, 0.2)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: textColor }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    style: { 
                      color: textColor, 
                      fontWeight: 500 
                    } 
                  }} 
                />
              </ListItem>
            ))}

            <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.12)' }} />
            
            {/* Section Test Email et Corrélations */}
            <Box sx={{ p: 2 }}>
              <Button
                fullWidth
                color="inherit"
                component={Link}
                to="/test-email"
                startIcon={
                  <IconWrapper>
                    <MuiIcons.Email sx={{ color: textColor }} />
                  </IconWrapper>
                }
                sx={{
                  justifyContent: 'flex-start',
                  px: 3,
                  py: 1.5,
                  mb: 1,
                  textTransform: 'none',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(67, 160, 71, 0.2)'
                  }
                }}
              >
                <Typography variant="body2" sx={{ color: textColor }}>
                  Envoyer un Email
                </Typography>
              </Button>
              <Button
                fullWidth
                color="inherit"
                component={Link}
                to="/correlation"
                startIcon={
                  <IconWrapper>
                    <MuiIcons.Timeline sx={{ color: textColor }} />
                  </IconWrapper>
                }
                sx={{
                  justifyContent: 'flex-start',
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(67, 160, 71, 0.2)'
                  }
                }}
              >
                <Typography variant="body2" sx={{ color: textColor }}>
                  Corrélations
                </Typography>
              </Button>
            </Box>

            <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.12)' }} />
            
            {/* Section Analyse de Fichiers */}
            <Box sx={{ p: 2 }}>
              <Button
                fullWidth
                color="inherit"
                component={Link}
                to="/file-analyzer"
                startIcon={
                  <IconWrapper>
                    <MuiIcons.Description sx={{ color: textColor }} />
                  </IconWrapper>
                }
                sx={{
                  justifyContent: 'flex-start',
                  px: 3,
                  py: 1.5,
                  mb: 1,
                  textTransform: 'none',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(67, 160, 71, 0.2)'
                  }
                }}
              >
                <Typography variant="body2" sx={{ color: textColor }}>
                  Analyse de fichier
                </Typography>
              </Button>
              <Button
                fullWidth
                color="inherit"
                component={Link}
                to="/sigma-analyzer"
                startIcon={
                  <IconWrapper>
                    <MuiIcons.Timeline sx={{ color: textColor }} />
                  </IconWrapper>
                }
                sx={{
                  justifyContent: 'flex-start',
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(67, 160, 71, 0.2)'
                  }
                }}
              >
                <Typography variant="body2" sx={{ color: textColor }}>
                  Analyse les logs
                </Typography>
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
            backgroundColor: '#f8f9fa', 
            minHeight: '100vh',
            width: { sm: `calc(100% - 240px)` },
            ml: { sm: '240px' },
            transition: 'background-color 0.3s ease'
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ 
            color: '#2c3e50',
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}>
            Tableau de bord
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <StatCard className="stat-card" color="#43a047" style={{ animationDelay: '0.1s' }}>
                <IconWrapper>
                  <MuiIcons.Notifications />
                </IconWrapper>
                <Typography variant="subtitle1" sx={{ mb: 1, opacity: 0.9, fontWeight: 500 }}>
                  Alertes en cours
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                    {stats.alerts}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    +2.5% vs hier
                  </Typography>
                </Box>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <StatCard className="stat-card" color="#1976d2" style={{ animationDelay: '0.2s' }}>
                <IconWrapper>
                  <MuiIcons.Description />
                </IconWrapper>
                <Typography variant="subtitle1" sx={{ mb: 1, opacity: 0.9, fontWeight: 500 }}>
                  Rapports générés
                </Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {stats.reports}
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <StatCard className="stat-card" color="#9c27b0" style={{ animationDelay: '0.3s' }}>
                <IconWrapper>
                  <MuiIcons.TableChart />
                </IconWrapper>
                <Typography variant="subtitle1" sx={{ mb: 1, opacity: 0.9, fontWeight: 500 }}>
                  Règles actives
                </Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {stats.rules}
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <StatCard className="stat-card" color="#ff9800" style={{ animationDelay: '0.4s' }}>
                <IconWrapper>
                  <MuiIcons.Security />
                </IconWrapper>
                <Typography variant="subtitle1" sx={{ mb: 1, opacity: 0.9, fontWeight: 500 }}>
                  Machines surveillées
                </Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {machines.length}
                </Typography>
              </StatCard>
            </Grid>
          </Grid>

          <Box sx={{ mb: 4 }}>
            <SectionTitle variant="h5" sx={{ mb: 3 }}>
              Gestion des machines surveillées
            </SectionTitle>
            
            <Box sx={{ 
              backgroundColor: 'white',
              borderRadius: '12px',
              p: 3,
              boxShadow: '0 2px 15px rgba(0, 0, 0, 0.04)',
              mb: 3,
            }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                  label="Adresse IP"
                  value={ip}
                  onChange={e => setIp(e.target.value)}
                  size="small"
                  variant="outlined"
                  placeholder="Ex: 192.168.1.1"
                  sx={{
                    flex: '1 1 300px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                        transition: 'all 0.3s',
                      },
                      '&:hover fieldset': {
                        borderColor: '#43a047',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#43a047',
                        boxShadow: '0 0 0 2px rgba(67, 160, 71, 0.2)',
                      },
                    },
                  }}
                />
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={addMachine}
                  startIcon={
                    <IconWrapper>
                      <MuiIcons.Add />
                    </IconWrapper>
                  }
                  sx={{
                    px: 3,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(67, 160, 71, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 16px rgba(67, 160, 71, 0.4)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  Ajouter une machine
                </Button>
              </Box>
              
              <List sx={{ mt: 2 }}>
                {machines.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                  }}>
                    <Typography color="textSecondary" variant="body2">
                      Aucune machine n'est actuellement surveillée
                    </Typography>
                  </Box>
                ) : (
                  machines.map((machine, index) => (
                    <MachineItem 
                      key={machine.id}
                      sx={{ animation: `${fadeIn} 0.3s ease-out ${index * 0.05}s both` }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <IconWrapper>
                          <MuiIcons.FiberManualRecord sx={{ 
                            color: '#4caf50', 
                            fontSize: '12px',
                            mr: 1.5,
                            animation: `${pulse} 2s infinite`,
                          }} />
                        </IconWrapper>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Machine {index + 1}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {machine.ip_address}
                          </Typography>
                        </Box>
                        <Box className="machine-actions" sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" color="primary">
                            <IconWrapper>
                              <MuiIcons.Edit fontSize="small" />
                            </IconWrapper>
                          </IconButton>
                          <IconButton size="small" color="error">
                            <IconWrapper>
                              <MuiIcons.Delete fontSize="small" />
                            </IconWrapper>
                          </IconButton>
                        </Box>
                      </Box>
                    </MachineItem>
                  ))
                )}
              </List>
            </Box>
          </Box>
        </Box>
      </Box>
    </DashboardContainer>
  );
}
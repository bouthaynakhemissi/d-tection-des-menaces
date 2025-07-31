import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Tooltip,
  Fade,
  useTheme,
  styled
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  NotificationsActive as WebIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkEmailReadIcon,
  SmsFailed as SmsFailedIcon,
  Web as WebAssetIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { keyframes } from '@emotion/react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

const slideIn = keyframes`
  from { 
    opacity: 0;
    transform: translateX(-10px);
  }
  to { 
    opacity: 1;
    transform: translateX(0);
  }
`;

const scaleIn = keyframes`
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
`;

// Composants stylisés
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 4px 20px 0 rgba(31, 38, 135, 0.05)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  },
  '&:active': {
    transform: 'translateY(-1px)',
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  '& .MuiTab-root': {
    minHeight: 60,
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.9rem',
    letterSpacing: '0.3px',
    transition: 'all 0.2s ease',
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
    '&:hover': {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.action.hover,
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
  },
}));

const NotificationItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'unread' && prop !== 'index',
})(({ theme, unread, index }) => ({
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: 12,
  margin: '6px 12px',
  padding: '14px 20px',
  animation: `${fadeIn} 0.4s ease-out ${index * 0.05}s both`,
  backgroundColor: unread 
    ? theme.palette.mode === 'dark' 
      ? 'rgba(25, 118, 210, 0.15)' 
      : 'rgba(25, 118, 210, 0.05)'
    : theme.palette.background.paper,
  borderLeft: unread 
    ? `4px solid ${theme.palette.primary.main}` 
    : `4px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(6px)',
    boxShadow: theme.shadows[1],
  },
  '&:active': {
    transform: 'translateX(3px) scale(0.99)',
  },
  '& .MuiListItemSecondaryAction-root': {
    right: 20,
    transition: 'opacity 0.2s ease',
    opacity: 0,
  },
  '&:hover .MuiListItemSecondaryAction-root': {
    opacity: 1,
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    animation: `${pulse} 2s infinite`,
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
}));

const LoadingSkeleton = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: 16,
  '& > *': {
    animation: `${theme.palette.mode === 'dark' ? 'pulse' : 'pulse-light'} 1.5s ease-in-out infinite`,
  },
  '@keyframes pulse-light': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },
}));

const TypeChip = styled(Chip)(({ type, theme }) => ({
  textTransform: 'capitalize',
  fontWeight: 500,
  ...(type === 'EMAIL' && {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  }),
  ...(type === 'SMS' && {
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
  }),
  ...(type === 'WEB' && {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.getContrastText(theme.palette.grey[300]),
  }),
}));

const Notifications = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [tabValue, setTabValue] = useState('all');
  const [openNewNotification, setOpenNewNotification] = useState(false);
  const [newNotification, setNewNotification] = useState({
    type: 'web',
    message: '',
    recipient: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const open = Boolean(anchorEl);

  const getAuthToken = () => {
    return localStorage.getItem('access') || localStorage.getItem('token');
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Vous n'êtes pas authentifié.");
        setLoading(false);
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/user_notifications/`, {
        headers: { 'Authorization': `Bearer ${token}` },
        withCredentials: true
      });
      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : [];
      setNotifications(data);
      filterNotifications(data, tabValue);
    } catch (err) {
      console.error('Erreur lors du chargement des notifications:', err);
      setError(err.response?.data?.error || err.response?.data?.detail || 'Impossible de charger les notifications');
      showSnackbar(err.response?.data?.error || err.response?.data?.detail || 'Erreur lors du chargement des notifications', 'error');
      setNotifications([]);
      setFilteredNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const filterNotifications = (notifs, type = 'all') => {
    const data = Array.isArray(notifs)
      ? notifs
      : Array.isArray(notifs?.results)
        ? notifs.results
        : [];
    if (type === 'all') {
      setFilteredNotifications(data);
    } else {
      const filtered = data.filter(notif =>
        notif.notif_type && notif.notif_type.toUpperCase() === type.toUpperCase()
      );
      setFilteredNotifications(filtered);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    filterNotifications(notifications, newValue);
  };

  const markAsRead = async (id) => {
    try {
      const updatedNotifications = notifications.map(notif =>
        notif.id === id ? { ...notif, is_read: true } : notif
      );
      setNotifications(updatedNotifications);
      filterNotifications(updatedNotifications, tabValue);
      await axios.patch(
        `${API_BASE_URL}/user_notifications/${id}/mark_as_read/`,
        {},
        { headers: { 'Authorization': `Bearer ${getAuthToken()}` } }
      );
    } catch (err) {
      console.error('Erreur:', err);
      showSnackbar('Erreur lors du marquage comme lu', 'error');
      fetchNotifications();
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      return;
    }
    try {
      const updatedNotifications = notifications.filter(notif => notif.id !== id);
      setNotifications(updatedNotifications);
      filterNotifications(updatedNotifications, tabValue);
      await axios.delete(`${API_BASE_URL}/notifications/${id}/`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      showSnackbar('Notification supprimée avec succès', 'success');
    } catch (err) {
      console.error('Erreur:', err);
      showSnackbar('Erreur lors de la suppression', 'error');
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      const updatedNotifications = notifications.map(notif => ({ ...notif, is_read: true }));
      setNotifications(updatedNotifications);
      filterNotifications(updatedNotifications, tabValue);
      setAnchorEl(null);
      await axios.post(
        `${API_BASE_URL}/user_notifications/mark_all_as_read/`,
        {},
        { headers: { 'Authorization': `Bearer ${getAuthToken()}` } }
      );
      showSnackbar('Toutes les notifications marquées comme lues', 'success');
    } catch (err) {
      console.error('Erreur:', err);
      showSnackbar('Erreur lors du marquage tout comme lu', 'error');
      fetchNotifications();
    }
  };

  const handleNewNotification = () => {
    setOpenNewNotification(true);
  };

  const handleCloseNewNotification = () => {
    setOpenNewNotification(false);
    setNewNotification({ type: 'web', message: '', recipient: '' });
  };

  const handleNotificationChange = (e) => {
    const { name, value } = e.target;
    setNewNotification(prev => ({ ...prev, [name]: value }));
  };

  const sendNotification = async () => {
    try {
      const payload = {
        message: newNotification.message,
        notif_type: newNotification.type.toUpperCase(),
      };
      if (newNotification.type !== 'web' && newNotification.recipient) {
        payload.recipient = newNotification.recipient;
      }
      await axios.post(
        `${API_BASE_URL}/notifications/`,
        payload,
        { headers: { 'Authorization': `Bearer ${getAuthToken()}` } }
      );
      showSnackbar('Notification envoyée avec succès', 'success');
      fetchNotifications();
      handleCloseNewNotification();
    } catch (err) {
      console.error('Erreur:', err);
      showSnackbar('Erreur lors de l\'envoi de la notification', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getNotificationIcon = (type) => {
    const iconProps = { fontSize: 'small' };
    switch (type?.toUpperCase()) {
      case 'EMAIL':
        return <EmailIcon color="primary" {...iconProps} />;
      case 'SMS':
        return <SmsIcon color="secondary" {...iconProps} />;
      case 'WEB':
        return <WebIcon color="action" {...iconProps} />;
      default:
        return <NotificationsIcon color="disabled" {...iconProps} />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type?.toUpperCase()) {
      case 'EMAIL': return 'Email';
      case 'SMS': return 'SMS';
      case 'WEB': return 'Web';
      default: return 'Inconnu';
    }
  };

  const lireEmail = (notification) => {
    alert(
      `Sujet : ${notification.message.split('\n')[0]}\n\n` +
      `Destinataire : ${notification.recipient || ''}\n\n` +
      `${notification.message.split('\n').slice(1).join('\n')}`
    );
  };

  const unreadCount = notifications.filter(notif => !notif.is_read).length;
  const emailCount = notifications.filter(notif => notif.notif_type === 'EMAIL').length;
  const smsCount = notifications.filter(notif => notif.notif_type === 'SMS').length;
  const webCount = notifications.filter(notif => notif.notif_type === 'WEB').length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 },
      maxWidth: 1400,
      mx: 'auto',
      minHeight: '100vh',
      bgcolor: 'background.default',
      transition: 'background-color 0.3s ease',
    }}>
      <Box 
        sx={{ 
          mb: 4,
          animation: `${slideIn} 0.5s ease-out`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          fontWeight: 600,
          color: 'text.primary'
        }}>
          <NotificationsIcon fontSize="large" color="primary" />
          Centre de notifications
        </Typography>
        
        <Box display="flex" gap={2} alignItems="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewNotification}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
              }
            }}
          >
            Nouvelle notification
          </Button>
          
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              aria-label="show notifications"
              aria-controls="notifications-menu"
              aria-haspopup="true"
              size="large"
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              <StyledBadge 
                badgeContent={unreadCount} 
                color="error"
                max={99}
              >
                <NotificationsIcon 
                  fontSize="large" 
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.87)',
                  }} 
                />
              </StyledBadge>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          animation: `${scaleIn} 0.6s ease-out`,
          transition: 'all 0.3s ease',
        }}
      >
        <StyledPaper elevation={0}>
          <StyledTabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab
              value="all"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterListIcon fontSize="small" />
                  Toutes
                  <Chip
                    label={notifications.length}
                    size="small"
                    sx={{ 
                      ml: 1,
                      bgcolor: 'action.selected',
                      color: 'text.primary'
                    }}
                  />
                </Box>
              }
            />
            <Tab
              value="email"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" />
                  Emails
                  <Chip
                    label={emailCount}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Box>
              }
            />
            <Tab
              value="sms"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SmsIcon fontSize="small" />
                  SMS
                  <Chip
                    label={smsCount}
                    size="small"
                    color="secondary"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Box>
              }
            />
            <Tab
              value="web"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WebAssetIcon fontSize="small" />
                  Web
                  <Chip
                    label={webCount}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Box>
              }
            />
          </StyledTabs>

          {loading ? (
            <LoadingSkeleton>
              {[1, 2, 3].map((item) => (
                <Box 
                  key={item} 
                  sx={{ 
                    height: 100, 
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    opacity: 0.7,
                  }} 
                />
              ))}
            </LoadingSkeleton>
          ) : (
            <List sx={{
              maxHeight: '60vh',
              overflow: 'auto',
              p: 1,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(0, 0, 0, 0.1)',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.3)' 
                    : 'rgba(0, 0, 0, 0.2)',
                }
              },
            }}>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification, index) => (
                  <Fade in={true} key={notification.id} timeout={300}>
                    <div>
                      <NotificationItem 
                        unread={!notification.is_read}
                        index={index}
                        secondaryAction={
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {!notification.is_read && (
                              <Tooltip title="Marquer comme lu">
                                <IconButton
                                  edge="end"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  size="small"
                                  sx={{
                                    '&:hover': { 
                                      color: 'primary.main',
                                      bgcolor: 'rgba(25, 118, 210, 0.08)'
                                    }
                                  }}
                                >
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {notification.notif_type === 'EMAIL' && (
                              <Tooltip title="Ouvrir l'email">
                                <IconButton
                                  edge="end"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    lireEmail(notification);
                                  }}
                                  size="small"
                                  sx={{
                                    '&:hover': { 
                                      color: 'info.main',
                                      bgcolor: 'rgba(2, 136, 209, 0.08)'
                                    }
                                  }}
                                >
                                  <EmailIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Supprimer">
                              <IconButton
                                edge="end"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                size="small"
                                sx={{
                                  '&:hover': { 
                                    color: 'error.main',
                                    bgcolor: 'rgba(244, 67, 54, 0.08)'
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: notification.is_read 
                                ? 'action.disabledBackground' 
                                : 'primary.main',
                              color: notification.is_read 
                                ? 'text.secondary' 
                                : 'primary.contrastText',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {getNotificationIcon(notification.notif_type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                              <Typography
                                component="span"
                                variant="subtitle1"
                                color="text.primary"
                                sx={{
                                  fontWeight: notification.is_read ? 400 : 600,
                                  flexGrow: 1,
                                  wordBreak: 'break-word'
                                }}
                              >
                                {notification.message.split('\n')[0]}
                              </Typography>
                              <TypeChip
                                label={getTypeLabel(notification.notif_type)}
                                size="small"
                                type={notification.notif_type}
                                icon={getNotificationIcon(notification.notif_type)}
                                sx={{ 
                                  '& .MuiChip-icon': {
                                    color: 'inherit',
                                    opacity: 0.8,
                                  }
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 1.5, 
                              mt: 0.5,
                              flexWrap: 'wrap',
                              alignItems: 'center'
                            }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 0.5,
                                  '& svg': {
                                    fontSize: '0.9em'
                                  }
                                }}
                              >
                                {notification.created_at && (
                                  <>
                                    {formatDistanceToNow(
                                      new Date(notification.created_at),
                                      { addSuffix: true, locale: fr }
                                    )}
                                  </>
                                )}
                              </Typography>
                              {notification.recipient && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 0.5,
                                    '& svg': {
                                      fontSize: '0.9em'
                                    }
                                  }}
                                >
                                  <SmsFailedIcon fontSize="inherit" />
                                  {notification.recipient}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </NotificationItem>
                      {index < filteredNotifications.length - 1 && (
                        <Divider 
                          variant="middle" 
                          component="li" 
                          sx={{ 
                            my: 1,
                            opacity: 0.7,
                            '&:last-child': {
                              display: 'none',
                            },
                          }} 
                        />
                      )}
                    </div>
                  </Fade>
                ))
              ) : (
                <Box 
                  sx={{
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    py: 8,
                    textAlign: 'center',
                    opacity: 0.8,
                    animation: `${fadeIn} 0.5s ease-out`
                  }}
                >
                  <InfoIcon 
                    sx={{ 
                      fontSize: 64, 
                      color: 'text.disabled',
                      mb: 2,
                      transition: 'all 0.3s ease',
                    }} 
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Aucune notification
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aucune notification trouvée pour les filtres sélectionnés
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </StyledPaper>
      </Box>

      <Dialog 
        open={openNewNotification} 
        onClose={handleCloseNewNotification} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundImage: 'none',
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          py: 2,
          px: 3,
          '& .MuiTypography-root': {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 600,
          }
        }}>
          <AddIcon /> Nouvelle notification
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            mt: 1 
          }}>
            <TextField
              select
              fullWidth
              label="Type de notification"
              name="type"
              value={newNotification.type}
              onChange={handleNotificationChange}
              SelectProps={{ native: true }}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="web">Notification Web</option>
            </TextField>

            {newNotification.type === 'email' || newNotification.type === 'sms' ? (
              <TextField
                fullWidth
                label="Destinataire"
                name="recipient"
                value={newNotification.recipient}
                onChange={handleNotificationChange}
                placeholder={
                  newNotification.type === 'email'
                    ? 'email@exemple.com'
                    : '+33 6 12 34 56 78'
                }
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            ) : null}

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              name="message"
              value={newNotification.message}
              onChange={handleNotificationChange}
              placeholder="Saisissez votre message ici..."
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          px: 3, 
          borderTop: 1, 
          borderColor: 'divider' 
        }}>
          <Button 
            onClick={handleCloseNewNotification}
            sx={{ 
              textTransform: 'none',
              px: 3,
              borderRadius: 2,
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={sendNotification}
            variant="contained"
            disabled={!newNotification.message}
            sx={{ 
              textTransform: 'none',
              px: 3,
              borderRadius: 2,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'text.disabled'
              }
            }}
          >
            Envoyer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            boxShadow: theme.shadows[4],
            '& .MuiAlert-icon': {
              alignItems: 'center'
            }
          }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Notifications;
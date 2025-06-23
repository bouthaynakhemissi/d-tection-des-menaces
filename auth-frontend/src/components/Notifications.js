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
  Paper
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
  Add as AddIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const Notifications = () => {
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

  // Récupérer les notifications avec authentification
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
      console.error('Erreur lors du chargement des notifications:', err, err.response?.data);
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
    return () => clearInterval(interval);  }, []);
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
      const data = Array.isArray(notifications)
        ? notifications
        : Array.isArray(notifications?.results)
          ? notifications.results
          : [];
      const updatedNotifications = data.map(notif =>
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

      const data = Array.isArray(notifications)
        ? notifications
        : Array.isArray(notifications?.results)
          ? notifications.results
          : [];
      const updatedNotifications = data.filter(notif => notif.id !== id);
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
      // Prépare le payload
      const payload = {
        message: newNotification.message,
        notif_type: newNotification.type.toUpperCase(),
      };
      // N’ajoute recipient que pour email/sms
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

  // Fonction pour afficher l'email dans une popup JS
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
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon fontSize="large" />
          Centre de notifications
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewNotification}
            sx={{ mr: 2 }}
          >
            Nouvelle notification
          </Button>
          <IconButton
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            aria-label="show notifications"
            aria-controls="notifications-menu"
            aria-haspopup="true"
            size="large"
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon fontSize="large" />
            </Badge>
          </IconButton>
          <Menu
            id="notifications-menu"
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={() => setAnchorEl(null)}
            PaperProps={{ sx: { width: 320, maxWidth: '100%' } }}
          >
            <MenuItem onClick={markAllAsRead} disabled={unreadCount === 0}>
              <MarkEmailReadIcon fontSize="small" sx={{ mr: 1 }} />
              Tout marquer comme lu
            </MenuItem>
            <Divider />
            <MenuItem>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">Notifications non lues</Typography>
                  <Chip label={unreadCount} size="small" color="error" />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<EmailIcon fontSize="small" />}
                    label={`Email (${emailCount})`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<SmsIcon fontSize="small" />}
                    label={`SMS (${smsCount})`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<WebAssetIcon fontSize="small" />}
                    label={`Web (${webCount})`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
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
                  sx={{ ml: 1 }}
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
                  color="default"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              </Box>
            }
          />
        </Tabs>

        <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notification.is_read ? 'background.paper' : 'action.hover',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!notification.is_read && (
                        <IconButton
                          edge="end"
                          aria-label="marquer comme lu"
                          onClick={() => markAsRead(notification.id)}
                          size="small"
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      )}
                      {notification.notif_type === 'EMAIL' && (
                        <IconButton
                          edge="end"
                          aria-label="ouvrir email"
                          onClick={() => lireEmail(notification)}
                          size="small"
                        >
                          <EmailIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        aria-label="supprimer"
                        onClick={() => deleteNotification(notification.id)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: notification.is_read ? 'grey.300' : 'primary.main',
                        color: notification.is_read ? 'text.primary' : 'primary.contrastText'
                      }}
                    >
                      {getNotificationIcon(notification.notif_type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          component="span"
                          variant="subtitle1"
                          color="text.primary"
                          sx={{
                            fontWeight: notification.is_read ? 'normal' : 'bold',
                            flexGrow: 1
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Chip
                          label={getTypeLabel(notification.notif_type)}
                          size="small"
                          variant="outlined"
                          color={
                            notification.notif_type === 'EMAIL' ? 'primary' :
                            notification.notif_type === 'SMS' ? 'secondary' : 'default'
                          }
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
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
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            <SmsFailedIcon fontSize="inherit" />
                            {notification.recipient}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < filteredNotifications.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="Aucune notification"
                secondary="Aucune notification trouvée pour les filtres sélectionnés"
                sx={{ textAlign: 'center', py: 4 }}
              />
            </ListItem>
          )}
        </List>
      </Paper>

      <Dialog open={openNewNotification} onClose={handleCloseNewNotification} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle notification</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Type de notification"
              name="type"
              value={newNotification.type}
              onChange={handleNotificationChange}
              SelectProps={{ native: true }}
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
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewNotification}>Annuler</Button>
          <Button
            onClick={sendNotification}
            variant="contained"
            disabled={!newNotification.message}
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
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Notifications;
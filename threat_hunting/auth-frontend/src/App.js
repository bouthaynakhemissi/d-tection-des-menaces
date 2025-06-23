// src/App.js
import React from 'react';
import { Routes, Route, Link as RouterLink, useLocation, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import PersonIcon from '@mui/icons-material/Person';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import DescriptionIcon from '@mui/icons-material/Description';
import TimelineIcon from '@mui/icons-material/Timeline';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import SecurityIcon from '@mui/icons-material/Security';
import DashboardIcon from "@mui/icons-material/Dashboard";
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Notifications from "./components/Notifications";
import RapportsList from './components/rapports/RapportsList';
import AddRapports from './components/rapports/AddRapports';
import ReglesList from './components/regles/ReglesList';
import AddRegle from './components/regles/AddRegle';
import EditRegle from './components/regles/EditRegle';
import TestEmail from './components/TestEmail';
import CorrelationPage from './pages/CorrelationPage';
import Chatbot from './components/Chatbot';
import FileAnalyzer from './components/FileAnalyzer';
import SigmaLogAnalyzer from './components/SigmaLogAnalyzer';
import { AuthProvider, useAuth } from './context/AuthContext';

// Composant PrivateRoute pour protéger les routes nécessitant une authentification
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Composant de la barre d'application avec affichage conditionnel
function AppBarWithConditionalDisplay() {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  // Ne pas afficher la barre d'application sur la page de connexion ou d'inscription
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: '#dde5ef',
        color: '#344767',
        borderRadius: '10px',
        margin: '8px',
      }}
    >
      <Toolbar>
        <DonutLargeIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Threat Hunting Platform
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={RouterLink} to="/" startIcon={<DashboardIcon />}>Tableau de bord</Button>

          {isAuthenticated ? (
            <>
              <Button color="inherit" component={RouterLink} to="/profile" startIcon={<PersonIcon />}>Profile</Button>
              <Button color="inherit" onClick={logout} startIcon={<VpnKeyIcon />}>Déconnexion</Button>
            </>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login" startIcon={<VpnKeyIcon />}>Connexion</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  const location = useLocation();
  const hideChatbot = location.pathname === "/login" || location.pathname === "/register";

  return (
    <AuthProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBarWithConditionalDisplay />
        {/* Chatbot visible partout sauf login/register */}
        {!hideChatbot && <Chatbot />}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/notifications" element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            } />
            <Route path="/rapports" element={
              <PrivateRoute>
                <RapportsList />
              </PrivateRoute>
            } />
            <Route path="/rapports/add" element={
              <PrivateRoute>
                <AddRapports />
              </PrivateRoute>
            } />
            <Route path="/regles" element={
              <PrivateRoute>
                <ReglesList />
              </PrivateRoute>
            } />
            <Route path="/regles/add" element={
              <PrivateRoute>
                <AddRegle />
              </PrivateRoute>
            } />
            <Route path="/regles/edit/:id" element={
              <PrivateRoute>
                <EditRegle />
              </PrivateRoute>
            } />
            <Route path="/test-email" element={
              <PrivateRoute>
                <TestEmail />
              </PrivateRoute>
            } />
            <Route path="/correlation" element={
              <PrivateRoute>
                <CorrelationPage />
              </PrivateRoute>
            } />
            {/* La route /chatbot n'est plus nécessaire mais tu peux la garder si tu veux */}
            <Route path="/chatbot" element={
              <PrivateRoute>
                <Chatbot />
              </PrivateRoute>
            } />
            <Route path="/file-analyzer" element={
              <PrivateRoute>
                <FileAnalyzer />
              </PrivateRoute>
            } />
            <Route path="/sigma-analyzer" element={
              <PrivateRoute>
                <SigmaLogAnalyzer />
              </PrivateRoute>
            } />
            <Route path="*" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
          </Routes>
        </Box>
      </Box>
    </AuthProvider>
  );
}

export default App;
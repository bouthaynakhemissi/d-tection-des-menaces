import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  LinearProgress,
  Card,
  CardContent,
  Button,
  CircularProgress
} from '@mui/material';
import { 
  SignalCellularAlt as SignalIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';

const CorrelationAnalysis = () => {
  const [analysis, setAnalysis] = useState({
    total: 0,
    levels: {
      high: { count: 0, percentage: 0, color: 'error.main' },
      medium: { count: 0, percentage: 0, color: 'warning.main' },
      low: { count: 0, percentage: 0, color: 'success.main' }
    },
    lastUpdated: null
  });
  const [isLoading, setIsLoading] = useState(false);

  // Simuler le chargement des données
  useEffect(() => {
    const fetchAnalysis = async () => {
      // Simuler un appel API
      setTimeout(() => {
        // Données de démonstration
        const demoData = {
          total: 125,
          levels: {
            high: { count: 45, percentage: 36 },
            medium: { count: 60, percentage: 48 },
            low: { count: 20, percentage: 16 }
          },
          lastUpdated: new Date().toISOString()
        };
        setAnalysis(demoData);
      }, 1000);
    };

    fetchAnalysis();
  }, []);

  // Fonction pour gérer le clic sur le bouton de corrélation
  const handleRunCorrelation = () => {
    setIsLoading(true);
    // Simuler un traitement de corrélation
    setTimeout(() => {
      // Mettre à jour les données après la corrélation
      const updatedData = {
        total: Math.floor(Math.random() * 200) + 50, // Nombre aléatoire pour la démo
        levels: {
          high: { 
            count: Math.floor(Math.random() * 100), 
            percentage: Math.floor(Math.random() * 50) + 10 
          },
          medium: { 
            count: Math.floor(Math.random() * 100), 
            percentage: Math.floor(Math.random() * 30) + 10 
          },
          low: { 
            count: Math.floor(Math.random() * 50), 
            percentage: Math.floor(Math.random() * 20) + 5 
          }
        },
        lastUpdated: new Date().toISOString()
      };
      // Ajuster les pourcentages pour qu'ils totalisent 100%
      const totalPct = updatedData.levels.high.percentage + 
                      updatedData.levels.medium.percentage + 
                      updatedData.levels.low.percentage;
      const factor = 100 / totalPct;
      
      updatedData.levels.high.percentage = Math.round(updatedData.levels.high.percentage * factor);
      updatedData.levels.medium.percentage = Math.round(updatedData.levels.medium.percentage * factor);
      updatedData.levels.low.percentage = 100 - updatedData.levels.high.percentage - updatedData.levels.medium.percentage;

      setAnalysis(updatedData);
      setIsLoading(false);
    }, 2000);
  };

  const LevelCard = ({ level, data }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {level === 'high' && <ErrorIcon color="error" sx={{ fontSize: 40, mr: 1 }} />}
          {level === 'medium' && <WarningIcon color="warning" sx={{ fontSize: 40, mr: 1 }} />}
          {level === 'low' && <CheckCircleIcon color="success" sx={{ fontSize: 40, mr: 1 }} />}
          <Box>
            <Typography variant="h4" component="div">
              {data.count}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {level === 'high' ? 'Haut risque' : level === 'medium' ? 'Risque moyen' : 'Faible risque'}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center">
          <Box width="100%" mr={1}>
            <LinearProgress 
              variant="determinate" 
              value={data.percentage} 
              color={level === 'high' ? 'error' : level === 'medium' ? 'warning' : 'success'}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {data.percentage}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h4" gutterBottom>
          Analyse des Corrélations
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
          onClick={handleRunCorrelation}
          disabled={isLoading}
          sx={{ 
            minWidth: 200,
            '&:hover': {
              transform: 'scale(1.02)',
              transition: 'transform 0.2s'
            }
          }}
        >
          {isLoading ? 'Traitement...' : 'Lancer la corrélation'}
        </Button>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <LevelCard level="high" data={analysis.levels.high} />
        </Grid>
        <Grid item xs={12} md={4}>
          <LevelCard level="medium" data={analysis.levels.medium} />
        </Grid>
        <Grid item xs={12} md={4}>
          <LevelCard level="low" data={analysis.levels.low} />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Vue d'ensemble
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Corrélations totales</Typography>
              <Typography fontWeight="bold">{analysis.total}</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={100} 
              sx={{ height: 10, borderRadius: 5, mb: 2 }} 
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <SignalIcon color="primary" sx={{ mr: 1 }} />
              <Typography>Dernière mise à jour</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {analysis.lastUpdated ? new Date(analysis.lastUpdated).toLocaleString('fr-FR') : 'Chargement...'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Répartition par niveau de risque
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(analysis.levels).map(([level, data]) => (
            <Grid item xs={12} key={level}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>
                  {level === 'high' ? 'Haut risque' : level === 'medium' ? 'Risque moyen' : 'Faible risque'}
                </Typography>
                <Typography fontWeight="bold">
                  {data.count} ({data.percentage}%)
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={data.percentage} 
                color={level === 'high' ? 'error' : level === 'medium' ? 'warning' : 'success'}
                sx={{ height: 8, borderRadius: 5, mb: 2 }} 
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default CorrelationAnalysis;
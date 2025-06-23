import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  IconButton,
  List,
  Chip,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from 'axios';

const SigmaLogAnalyzer = () => {
  const [logs, setLogs] = useState('');
  const [logSource, setLogSource] = useState('windows');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null); // null au départ, [] après analyse
  const [error, setError] = useState(null);
  const [expandedResult, setExpandedResult] = useState(null);

  const logSources = [
    { value: 'windows', label: 'Windows Event Logs' },
    { value: 'linux', label: 'Linux Syslog' },
    { value: 'apache', label: 'Apache Access Logs' },
    { value: 'nginx', label: 'Nginx Access Logs' },
    { value: 'aws', label: 'AWS CloudTrail' },
  ];

  const handleAnalyze = async () => {
    if (!logs.trim()) {
      setError('Veuillez entrer des logs à analyser');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // Convertir la chaîne de logs en tableau d'objets JSON
      let logsArray;
      try {
        logsArray = JSON.parse(logs);
        if (!Array.isArray(logsArray)) {
          logsArray = [logsArray];
        }
      } catch (e) {
        // Si le parsing échoue, traiter comme une entrée texte brute
        logsArray = logs.split('\n')
          .filter(line => line.trim())
          .map(line => ({
            raw_log: line,
            timestamp: new Date().toISOString(),
            source: logSource
          }));
      }

      const response = await axios.post(
        'http://localhost:8000/analyze-logs-sigma/',
        {
          logs: logsArray,
          log_source: logSource
        }
      );

      setResults(response.data.results || []);
    } catch (err) {
      console.error('Erreur lors de l\'analyse des logs:', err);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Une erreur est survenue lors de l\'analyse des logs.'
      );
      setResults([]); // Pour afficher "aucune correspondance" même en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpandResult = (index) => {
    setExpandedResult(expandedResult === index ? null : index);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analyse de logs avec SIGMA
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Configuration de l'analyse
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="log-source-label">Source des logs</InputLabel>
          <Select
            labelId="log-source-label"
            value={logSource}
            label="Source des logs"
            onChange={(e) => setLogSource(e.target.value)}
          >
            {logSources.map((source) => (
              <MenuItem key={source.value} value={source.value}>
                {source.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          multiline
          rows={8}
          variant="outlined"
          label="Logs à analyser (JSON ou texte brut)"
          value={logs}
          onChange={(e) => setLogs(e.target.value)}
          placeholder={`Collez vos logs ici au format JSON ou texte brut...\nExemple JSON :\n[\n  {\n    "process_name": "powershell.exe",\n    "user": "admin",\n    "event_id": 4104\n  }\n]`}
          sx={{ mb: 2 }}
        />
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleAnalyze}
          disabled={isLoading || !logs.trim()}
          startIcon={
            isLoading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isLoading ? 'Analyse en cours...' : 'Analyser les logs'}
        </Button>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <AlertTitle>Erreur</AlertTitle>
            {error}
          </Alert>
        )}
      </Paper>

      {/* Affichage du résultat de l'analyse, même si aucune correspondance */}
      {results !== null && (
        <Box>
          <Alert
            severity={results.length > 0 ? "success" : "info"}
            sx={{ mb: 2 }}
          >
            Analyse terminée. {results.length} correspondance(s) trouvée(s).
          </Alert>

          <Typography variant="h5" gutterBottom>
            Résultats de l'analyse
            <Chip 
              label={`${results.length} correspondance(s) trouvée(s)`}
              color={results.length > 0 ? "primary" : "default"}
              sx={{ ml: 2 }}
            />
          </Typography>

          {results.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Aucune correspondance trouvée.
            </Alert>
          ) : (
            <List>
              {results.map((result, index) => (
                <Card key={index} sx={{ mb: 2, borderLeft: '4px solid', 
                  borderColor: getSeverityColor(result.severity) === 'error' ? 'error.main' : 
                               getSeverityColor(result.severity) === 'warning' ? 'warning.main' : 'info.main' }}>
                  <CardHeader
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" component="div">
                          {result.title}
                        </Typography>
                        <Chip 
                          label={result.severity || 'info'} 
                          color={getSeverityColor(result.severity)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    subheader={`Règle: ${result.rule}`}
                    action={
                      <IconButton onClick={() => toggleExpandResult(index)}>
                        {expandedResult === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    }
                  />
                  <Collapse in={expandedResult === index} timeout="auto" unmountOnExit>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Description:
                      </Typography>
                      <Typography paragraph sx={{ mb: 2 }}>
                        {result.description || 'Aucune description disponible'}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Entrée de log correspondante:
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {JSON.stringify(result.log_entry, null, 2)}
                        </pre>
                      </Paper>
                      
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => {
                            const query = window.confirm("Voulez-vous créer une alerte pour cette détection?");
                            if (query) {
                              // Implémenter la création d'alerte
                              alert("Fonctionnalité de création d'alerte à implémenter");
                            }
                          }}
                        >
                          Créer une alerte
                        </Button>
                        
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => {
                            // Implémenter l'export en tant que règle SIEM
                            const siemQuery = result.rule_details && 
                                           result.rule_details.detection ? 
                                           Object.entries(result.rule_details.detection)
                                             .filter(([key]) => key !== 'condition')
                                             .map(([field, value]) => `${field}: ${JSON.stringify(value)}`)
                                             .join(' AND ') : '';
                            
                            if (siemQuery) {
                              navigator.clipboard.writeText(siemQuery);
                              alert("Requête SIEM copiée dans le presse-papiers!");
                            } else {
                              alert("Impossible de générer une requête SIEM pour cette règle.");
                            }
                          }}
                        >
                          Copier la requête SIEM
                        </Button>
                      </Box>
                    </CardContent>
                  </Collapse>
                </Card>
              ))}
            </List>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SigmaLogAnalyzer;
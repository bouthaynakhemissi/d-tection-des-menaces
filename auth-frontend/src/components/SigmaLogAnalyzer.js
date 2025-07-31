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
  CircularProgress,
  useTheme,
  keyframes,
  useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from 'axios';
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

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

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
        'http://localhost:8000/analyze/logs/sigma/',
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
    <Box sx={{
      width: '100%',
      minHeight: '100vh',
      background: colors.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      pt: 4
    }}>
      {/* Effet de fond animé */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: `linear-gradient(135deg, 
            ${colors.gradient1} 0%,
            ${colors.gradient2} 50%,
            ${colors.gradient3} 100%
          )`,
          backgroundSize: '400% 400%',
          animation: `gradientAnimation 15s ease infinite`
        }}
      />

      <Box sx={{
        maxWidth: 1200,
        width: '100%',
        px: { xs: 2, md: 4 }
      }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{
            color: colors.text,
            fontWeight: 600,
            animation: `${fadeIn} 0.5s ease-out`
          }}
        >
          Analyse de logs avec SIGMA
        </Typography>
        
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: 3,
            background: colors.surface,
            boxShadow: `0 8px 32px ${colors.shadow}`,
            animation: `${fadeIn} 0.5s ease-out 0.2s`
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{
              fontWeight: 600,
              color: colors.text
            }}
          >
            Configuration de l'analyse
          </Typography>
          
          <FormControl 
            fullWidth 
            sx={{ 
              mb: 2,
              animation: `${fadeIn} 0.5s ease-out 0.3s`
            }}
          >
            <InputLabel 
              id="log-source-label" 
              sx={{
                color: colors.icon,
                '&.Mui-focused': {
                  color: colors.focus
                }
              }}
            >
              Source des logs
            </InputLabel>
            <Select
              labelId="log-source-label"
              value={logSource}
              label="Source des logs"
              onChange={(e) => setLogSource(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: colors.border,
                  },
                  '&:hover fieldset': {
                    borderColor: colors.hover,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: colors.focus,
                  },
                }
              }}
            >
              {logSources.map((source) => (
                <MenuItem 
                  key={source.value} 
                  value={source.value}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: alpha(colors.primary, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(colors.primary, 0.15)
                      }
                    }
                  }}
                >
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
            sx={{
              mb: 2,
              animation: `${fadeIn} 0.5s ease-out 0.4s`,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: colors.border,
                },
                '&:hover fieldset': {
                  borderColor: colors.hover,
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.focus,
                },
              }
            }}
          />
          
          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={isLoading || !logs.trim()}
            startIcon={
              isLoading ? <CircularProgress size={20} color="inherit" /> : null
            }
            sx={{
              backgroundColor: colors.primary,
              color: 'white',
              textTransform: 'none',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontSize: '1rem',
              animation: `${fadeIn} 0.5s ease-out 0.5s`,
              '&:hover': {
                backgroundColor: colors.secondary,
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${colors.shadow}`
              },
              '&:disabled': {
                backgroundColor: colors.disabled,
                color: colors.icon
              },
              '&:active': {
                backgroundColor: colors.active,
              }
            }}
          >
            {isLoading ? 'Analyse en cours...' : 'Analyser les logs'}
          </Button>
          
          {error && (
            <Alert
              severity="error"
              sx={{ 
                mt: 3,
                borderRadius: 2,
                animation: `${fadeIn} 0.5s ease-out 0.6s`,
                backgroundColor: alpha(colors.error, 0.1),
                color: colors.error
              }}
            >
              <AlertTitle sx={{ fontWeight: 600, color: colors.error }}>
                Erreur
              </AlertTitle>
              {error}
            </Alert>
          )}
        </Paper>

        {/* Affichage du résultat de l'analyse */}
        {results !== null && (
          <Box sx={{
            width: '100%',
            animation: `${fadeIn} 0.5s ease-out 0.7s`
          }}>
            <Alert
              severity={results.length > 0 ? "success" : "info"}
              sx={{ 
                mb: 2,
                borderRadius: 2,
                backgroundColor: results.length > 0 ? alpha(colors.success, 0.1) : alpha(colors.info, 0.1),
                color: results.length > 0 ? colors.success : colors.info
              }}
            >
              Analyse terminée. {results.length} correspondance(s) trouvée(s).
            </Alert>

            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{
                fontWeight: 600,
                color: colors.text
              }}
            >
              Résultats de l'analyse
            </Typography>

            <Chip 
              label={`${results.length} correspondance(s) trouvée(s)`}
              color={results.length > 0 ? "primary" : "default"}
              sx={{ 
                ml: 2,
                animation: `${fadeIn} 0.5s ease-out 0.8s`
              }}
            />

            {results.length === 0 ? (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(colors.info, 0.1),
                  color: colors.info
                }}
              >
                Aucune correspondance trouvée.
              </Alert>
            ) : (
              <List>
                {results.map((result, index) => (
                  <Card 
                    key={index} 
                    sx={{ 
                      mb: 2,
                      borderLeft: '4px solid',
                      borderColor: getSeverityColor(result.severity) === 'error' ? colors.error :
                                  getSeverityColor(result.severity) === 'warning' ? colors.warning : colors.info,
                      animation: `${fadeIn} 0.5s ease-out ${0.9 + index * 0.1}s`
                    }}
                  >
                    <CardHeader
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography 
                            variant="subtitle1" 
                            component="div"
                            sx={{
                              fontWeight: 500,
                              color: colors.text
                            }}
                          >
                            {result.title}
                          </Typography>
                          <Chip 
                            label={result.severity || 'info'} 
                            color={getSeverityColor(result.severity)}
                            size="small"
                            sx={{ 
                              ml: 1,
                              animation: `${fadeIn} 0.5s ease-out ${1 + index * 0.1}s`
                            }}
                          />
                        </Box>
                      }
                      subheader={`Règle: ${result.rule}`}
                      subheaderTypographyProps={{
                        color: colors.icon
                      }}
                      action={
                        <IconButton 
                          onClick={() => toggleExpandResult(index)}
                          sx={{
                            animation: `${fadeIn} 0.5s ease-out ${1.1 + index * 0.1}s`
                          }}
                        >
                          {expandedResult === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      }
                    />
                    <Collapse 
                      in={expandedResult === index} 
                      timeout="auto" 
                      unmountOnExit
                    >
                      <CardContent>
                        <Typography 
                          variant="subtitle2" 
                          color="textSecondary" 
                          gutterBottom
                          sx={{
                            color: colors.icon,
                            animation: `${fadeIn} 0.5s ease-out ${1.2 + index * 0.1}s`
                          }}
                        >
                          Description:
                        </Typography>
                        <Typography 
                          paragraph 
                          sx={{ 
                            mb: 2,
                            animation: `${fadeIn} 0.5s ease-out ${1.3 + index * 0.1}s`
                          }}
                        >
                          {result.description || 'Aucune description disponible'}
                        </Typography>
                        
                        <Typography 
                          variant="subtitle2" 
                          color="textSecondary" 
                          gutterBottom
                          sx={{
                            color: colors.icon,
                            animation: `${fadeIn} 0.5s ease-out ${1.4 + index * 0.1}s`
                          }}
                        >
                          Entrée de log correspondante:
                        </Typography>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                            bgcolor: colors.surface,
                            animation: `${fadeIn} 0.5s ease-out ${1.5 + index * 0.1}s`
                          }}
                        >
                          <pre style={{ 
                            margin: 0, 
                            whiteSpace: 'pre-wrap', 
                            wordBreak: 'break-word',
                            color: colors.text
                          }}>
                            {JSON.stringify(result.log_entry, null, 2)}
                          </pre>
                        </Paper>
                        
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            gap: 2, 
                            flexWrap: 'wrap',
                            animation: `${fadeIn} 0.5s ease-out ${1.6 + index * 0.1}s`
                          }}
                        >
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
                            sx={{
                              backgroundColor: alpha(colors.primary, 0.1),
                              '&:hover': {
                                backgroundColor: alpha(colors.primary, 0.2)
                              }
                            }}
                          >
                            Créer une alerte
                          </Button>
                          
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => {
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
                            sx={{
                              backgroundColor: alpha(colors.info, 0.1),
                              '&:hover': {
                                backgroundColor: alpha(colors.info, 0.2)
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
    </Box>
  );
};

export default SigmaLogAnalyzer;
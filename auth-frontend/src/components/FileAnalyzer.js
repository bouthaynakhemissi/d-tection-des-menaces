import React, { useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  Alert, 
  AlertTitle, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  IconButton,
  styled,
  keyframes
} from '@mui/material';
import { 
  Upload as UploadIcon, 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon, 
  Info as InfoIcon 
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

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
  animation: `${fadeIn} 0.5s ease-out`
}));

const FileAnalyzer = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleAnalyze = async () => {
        if (!selectedFile) {
            alert('Veuillez sélectionner un fichier');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            setLoading(true);
            const response = await axios.post(
                'http://localhost:8000/scan-file/',
                formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                }
              );
            setAnalysisResult(response.data);
        } catch (error) {
            console.error('Erreur lors de l\'analyse:', error);
            setAnalysisResult({
                error: error.response?.data?.error || 'Une erreur est survenue lors de l\'analyse'
            });
        } finally {
            setLoading(false);
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
                    animation: `${gradientAnimation} 15s ease infinite`
                }}
            />

            <Box sx={{
                maxWidth: 800,
                width: '100%',
                px: { xs: 2, md: 4 }
            }}>
                <Typography 
                    variant="h4" 
                    component="h1" 
                    gutterBottom 
                    sx={{ 
                        color: colors.text,
                        fontWeight: 600,
                        animation: `${fadeIn} 0.5s ease-out`
                    }}
                >
                    Analyse de Fichiers avec YARA
                </Typography>

                <StyledPaper sx={{
                    background: colors.surface,
                    boxShadow: `0 8px 32px ${colors.shadow}`
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <UploadIcon sx={{ 
                                color: colors.primary,
                                animation: `${pulse} 2s ease infinite`
                            }} />
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    color: colors.text,
                                    fontWeight: 500,
                                    animation: `${fadeIn} 0.5s ease-out 0.2s`
                                }}
                            >
                                Sélectionnez un fichier à analyser
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<UploadIcon />}
                                disabled={loading}
                                sx={{
                                    bgcolor: colors.primary,
                                    color: 'white',
                                    textTransform: 'none',
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontSize: '1rem',
                                    animation: `${fadeIn} 0.5s ease-out 0.3s`,
                                    '&:hover': {
                                        bgcolor: colors.secondary,
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 4px 12px ${colors.shadow}`
                                    },
                                    '&:disabled': {
                                        bgcolor: colors.disabled,
                                        color: colors.icon
                                    },
                                    '&:active': {
                                        bgcolor: colors.active,
                                    }
                                }}
                            >
                                {selectedFile ? selectedFile.name : 'Choisir un fichier'}
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFileChange}
                                    disabled={loading}
                                />
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleAnalyze}
                                disabled={!selectedFile || loading}
                                sx={{
                                    bgcolor: colors.success,
                                    color: 'white',
                                    textTransform: 'none',
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontSize: '1rem',
                                    animation: `${fadeIn} 0.5s ease-out 0.4s`,
                                    '&:hover': {
                                        bgcolor: colors.success,
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 4px 12px ${colors.shadow}`
                                    },
                                    '&:disabled': {
                                        bgcolor: colors.disabled,
                                        color: colors.icon
                                    }
                                }}
                            >
                                {loading ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress size={20} color="inherit" />
                                        <span>En cours d'analyse...</span>
                                    </Box>
                                ) : (
                                    'Analyser le fichier'
                                )}
                            </Button>
                        </Box>
                    </Box>
                </StyledPaper>

                {analysisResult && (
                    <Paper 
                        sx={{ 
                            p: 3,
                            borderRadius: 2,
                            background: colors.surface,
                            boxShadow: `0 8px 32px ${colors.shadow}`,
                            animation: `${fadeIn} 0.5s ease-out 0.5s`
                        }}
                    >
                        {analysisResult.error ? (
                            <Alert 
                                severity="error" 
                                sx={{ 
                                    mb: 2,
                                    borderRadius: 2,
                                    backgroundColor: alpha(colors.error, 0.1),
                                    color: colors.error
                                }}
                            >
                                <AlertTitle sx={{ fontWeight: 600, color: colors.error }}>
                                    Erreur
                                </AlertTitle>
                                {analysisResult.error}
                            </Alert>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Alert 
                                    severity="info"
                                    sx={{ 
                                        backgroundColor: alpha(colors.info, 0.1),
                                        color: colors.info
                                    }}
                                >
                                    <AlertTitle>Résultat de l'analyse</AlertTitle>
                                    {analysisResult.message}
                                </Alert>

                                {analysisResult.status === 'success' && (
                                    <Box>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                color: colors.text,
                                                fontWeight: 500,
                                                mb: 2
                                            }}
                                        >
                                            Matches trouvés
                                        </Typography>
                                        <List>
                                            {analysisResult.matches.map((match, index) => (
                                                <React.Fragment key={index}>
                                                    <ListItem 
                                                        sx={{ 
                                                            bgcolor: colors.surface,
                                                            borderRadius: 1,
                                                            mb: 1,
                                                            animation: `${fadeIn} 0.5s ease-out ${0.6 + index * 0.1}s`
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={`Règle: ${match.rule}`}
                                                            secondary={`Tags: ${match.tags.join(', ')}`}
                                                            primaryTypographyProps={{
                                                                color: colors.text,
                                                                fontWeight: 500
                                                            }}
                                                            secondaryTypographyProps={{
                                                                color: colors.icon
                                                            }}
                                                        />
                                                    </ListItem>
                                                    <Divider sx={{
                                                        animation: `${fadeIn} 0.5s ease-out ${0.7 + index * 0.1}s`
                                                    }} />
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default FileAnalyzer;

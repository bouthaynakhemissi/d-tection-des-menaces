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
  styled
} from '@mui/material';
import { 
  Upload as UploadIcon, 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon, 
  Info as InfoIcon 
} from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
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
            p: 3,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
        }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ 
                color: '#344767',
                fontWeight: 'bold'
            }}>
                Analyse de Fichiers avec YARA
            </Typography>

            <StyledPaper>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <UploadIcon sx={{ color: '#2196F3' }} />
                        <Typography variant="h6" sx={{ color: '#344767' }}>
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
                                bgcolor: '#2196F3',
                                '&:hover': {
                                    bgcolor: '#1976D2',
                                },
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
                            color="primary"
                            onClick={handleAnalyze}
                            disabled={!selectedFile || loading}
                            sx={{
                                bgcolor: '#4CAF50',
                                '&:hover': {
                                    bgcolor: '#45A049',
                                },
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
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                    {analysisResult.error ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            <AlertTitle>Erreur</AlertTitle>
                            {analysisResult.error}
                        </Alert>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Alert severity="info">
                                <AlertTitle>Résultat de l'analyse</AlertTitle>
                                {analysisResult.message}
                            </Alert>

                            {analysisResult.status === 'success' && (
                                <Box>
                                    <Typography variant="h6" sx={{ color: '#344767', mb: 2 }}>
                                        Matches trouvés
                                    </Typography>
                                    <List>
                                        {analysisResult.matches.map((match, index) => (
                                            <React.Fragment key={index}>
                                                <ListItem 
                                                    sx={{ 
                                                        bgcolor: '#f5f5f5',
                                                        borderRadius: 1,
                                                        mb: 1
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={`Règle: ${match.rule}`}
                                                        secondary={`Tags: ${match.tags.join(', ')}`}
                                                    />
                                                </ListItem>
                                                <Divider />
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
    );
};

export default FileAnalyzer;

import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

const InfoCard = ({ icon, title, value, color, sx = {} }) => {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2, 
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          borderColor: 'primary.light',
          bgcolor: 'rgba(79, 70, 229, 0.02)',
          ...sx
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ 
          width: 36, 
          height: 36, 
          borderRadius: '10px',
          bgcolor: `${color}10`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 1.5,
          '& .MuiSvgIcon-root': {
            color: color,
            fontSize: 20
          }
        }}>
          {React.cloneElement(icon, { fontSize: 'small' })}
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ 
        fontWeight: 600, 
        pl: { xs: 0, sm: 5 },
        color: 'text.primary',
        wordBreak: 'break-word'
      }}>
        {value}
      </Typography>
    </Paper>
  );
};

export default InfoCard;
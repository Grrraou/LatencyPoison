import React from 'react';
import { Box, Typography } from '@mui/material';
import QuickSandbox from './QuickSandbox';

function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <QuickSandbox />
    </Box>
  );
}

export default Dashboard; 
import React from 'react';
import { Container, Paper, Typography, Box, Grid } from '@mui/material';

function Dashboard() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Latency Overview
              </Typography>
              <Typography variant="body1">
                Monitor and analyze your network latency metrics here.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Tests
              </Typography>
              <Typography variant="body1">
                View your recent latency test results and analysis.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Dashboard; 
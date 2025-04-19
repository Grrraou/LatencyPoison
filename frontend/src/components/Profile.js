import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';

function Profile({ user }) {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Profile
          </Typography>
          <Typography variant="body1">
            Welcome to your profile page. This is where you can view and manage your account settings.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Profile; 
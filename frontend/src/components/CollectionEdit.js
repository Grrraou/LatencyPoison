import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Slider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { fetchCollection, fetchEndpoints, createEndpoint, deleteEndpoint } from '../services/api';

function CollectionEdit() {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState({
    url: '',
    latency_ms: 0,
    fail_rate: 0,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [collectionData, endpointsData] = await Promise.all([
        fetchCollection(collectionId),
        fetchEndpoints(collectionId)
      ]);
      setCollection(collectionData);
      setEndpoints(endpointsData);
    } catch (error) {
      setError(error.message);
    }
  }, [collectionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateEndpoint = async () => {
    try {
      if (!newEndpoint.url.trim()) {
        setError('URL cannot be empty');
        return;
      }

      const createdEndpoint = await createEndpoint(collectionId, newEndpoint);
      setEndpoints([...endpoints, createdEndpoint]);
      setOpenDialog(false);
      setNewEndpoint({
        url: '',
        latency_ms: 0,
        fail_rate: 0,
      });
      setSuccess('Endpoint created successfully');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteEndpoint = async (endpointId) => {
    try {
      await deleteEndpoint(endpointId);
      setEndpoints(endpoints.filter(e => e.id !== endpointId));
      setSuccess('Endpoint deleted successfully');
    } catch (error) {
      setError(error.message);
    }
  };

  if (!collection) {
    return <Box>Loading...</Box>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              {collection.name}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenDialog(true)}
            >
              Add Endpoint
            </Button>
          </Box>

          <List>
            {endpoints.map((endpoint) => (
              <ListItem
                key={endpoint.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteEndpoint(endpoint.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={endpoint.url}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Latency: {endpoint.latency_ms}ms
                      </Typography>
                      {' — '}
                      <Typography component="span" variant="body2" color="text.primary">
                        Fail Rate: {endpoint.fail_rate}%
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Endpoint</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="URL"
            fullWidth
            value={newEndpoint.url}
            onChange={(e) => setNewEndpoint({ ...newEndpoint, url: e.target.value })}
          />
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Latency (ms)</Typography>
            <Slider
              value={newEndpoint.latency_ms}
              onChange={(e, value) => setNewEndpoint({ ...newEndpoint, latency_ms: value })}
              min={0}
              max={10000}
              step={100}
              valueLabelDisplay="auto"
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Fail Rate (%)</Typography>
            <Slider
              value={newEndpoint.fail_rate}
              onChange={(e, value) => setNewEndpoint({ ...newEndpoint, fail_rate: value })}
              min={0}
              max={100}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateEndpoint} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default CollectionEdit; 
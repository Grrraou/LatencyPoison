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
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { fetchCollection, fetchEndpoints, createEndpoint, updateEndpoint, deleteEndpoint } from '../services/api';

function CollectionEdit() {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState(null);
  const [newEndpoint, setNewEndpoint] = useState({
    path: '',
    latency_ms: null,
    fail_rate: null,
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
      if (!newEndpoint.path.trim()) {
        setError('Path cannot be empty');
        return;
      }

      const createdEndpoint = await createEndpoint(collectionId, newEndpoint);
      setEndpoints([...endpoints, createdEndpoint]);
      setOpenDialog(false);
      setNewEndpoint({
        path: '',
        latency_ms: null,
        fail_rate: null,
      });
      setSuccess('Endpoint created successfully');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditEndpoint = async () => {
    try {
      if (!editingEndpoint.path.trim()) {
        setError('Path cannot be empty');
        return;
      }

      const updatedEndpoint = await updateEndpoint(editingEndpoint.id, {
        path: editingEndpoint.path,
        latency_ms: editingEndpoint.latency_ms,
        fail_rate: editingEndpoint.fail_rate,
      });

      setEndpoints(endpoints.map(e => 
        e.id === updatedEndpoint.id ? updatedEndpoint : e
      ));
      setEditDialog(false);
      setEditingEndpoint(null);
      setSuccess('Endpoint updated successfully');
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
            <Box>
              <Typography variant="h4" component="h1">
                {collection.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {collection.base_url}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Default Latency: {collection.default_latency_ms}ms | Fail Rate: {collection.default_fail_rate}%
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenDialog(true)}
            >
              Add Path
            </Button>
          </Box>

          <List>
            {endpoints.map((endpoint) => (
              <ListItem
                key={endpoint.id}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => {
                        setEditingEndpoint({ ...endpoint });
                        setEditDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteEndpoint(endpoint.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={endpoint.path}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Latency: {endpoint.latency_ms !== null ? `${endpoint.latency_ms}ms` : 'Default'}
                      </Typography>
                      {' — '}
                      <Typography component="span" variant="body2" color="text.primary">
                        Fail Rate: {endpoint.fail_rate !== null ? `${endpoint.fail_rate}%` : 'Default'}
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
        <DialogTitle>Add New Path</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Path"
                fullWidth
                value={newEndpoint.path}
                onChange={(e) => setNewEndpoint({ ...newEndpoint, path: e.target.value })}
                placeholder="/api/users"
              />
            </Grid>
            <Grid item xs={6}>
              <Typography gutterBottom>Latency (ms)</Typography>
              <Slider
                value={newEndpoint.latency_ms || collection.default_latency_ms}
                onChange={(e, value) => setNewEndpoint({ ...newEndpoint, latency_ms: value })}
                min={0}
                max={10000}
                step={100}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={6}>
              <Typography gutterBottom>Fail Rate (%)</Typography>
              <Slider
                value={newEndpoint.fail_rate || collection.default_fail_rate}
                onChange={(e, value) => setNewEndpoint({ ...newEndpoint, fail_rate: value })}
                min={0}
                max={100}
                step={1}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateEndpoint} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Edit Path</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Path"
                fullWidth
                value={editingEndpoint?.path || ''}
                onChange={(e) => setEditingEndpoint({ ...editingEndpoint, path: e.target.value })}
                placeholder="/api/users"
              />
            </Grid>
            <Grid item xs={6}>
              <Typography gutterBottom>Latency (ms)</Typography>
              <Slider
                value={editingEndpoint?.latency_ms ?? collection.default_latency_ms}
                onChange={(e, value) => setEditingEndpoint({ ...editingEndpoint, latency_ms: value })}
                min={0}
                max={10000}
                step={100}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={6}>
              <Typography gutterBottom>Fail Rate (%)</Typography>
              <Slider
                value={editingEndpoint?.fail_rate ?? collection.default_fail_rate}
                onChange={(e, value) => setEditingEndpoint({ ...editingEndpoint, fail_rate: value })}
                min={0}
                max={100}
                step={1}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditEndpoint} variant="contained">
            Save
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
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Grid,
  Slider,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchCollections, createCollection, deleteCollection } from '../services/api';

function Endpoints() {
  const [collections, setCollections] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: '',
    base_url: '',
    default_latency_ms: 0,
    default_fail_rate: 0,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const data = await fetchCollections();
      setCollections(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load collections',
        severity: 'error',
      });
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollection.name.trim() || !newCollection.base_url.trim()) {
      setSnackbar({
        open: true,
        message: 'Name and Base URL are required',
        severity: 'error',
      });
      return;
    }

    try {
      const collectionData = {
        name: newCollection.name,
        base_url: newCollection.base_url,
        default_latency_ms: newCollection.default_latency_ms,
        default_fail_rate: newCollection.default_fail_rate,
      };
      await createCollection(collectionData);
      setNewCollection({
        name: '',
        base_url: '',
        default_latency_ms: 0,
        default_fail_rate: 0,
      });
      setOpenDialog(false);
      loadCollections();
      setSnackbar({
        open: true,
        message: 'Collection created successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to create collection',
        severity: 'error',
      });
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    try {
      await deleteCollection(collectionId);
      loadCollections();
      setSnackbar({
        open: true,
        message: 'Collection deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete collection',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Collections</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Collection
        </Button>
      </Box>

      <List>
        {collections.map((collection) => (
          <Card key={collection.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" component={Link} to={`/collections/${collection.id}`}>
                    {collection.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {collection.base_url}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Default Latency: {collection.default_latency_ms}ms | Fail Rate: {collection.default_fail_rate}%
                  </Typography>
                </Box>
                <Box>
                  <IconButton
                    component={Link}
                    to={`/collections/${collection.id}`}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteCollection(collection.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Collection Name"
                fullWidth
                value={newCollection.name}
                onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Base URL"
                fullWidth
                value={newCollection.base_url}
                onChange={(e) => setNewCollection({ ...newCollection, base_url: e.target.value })}
                placeholder="https://api.example.com"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography gutterBottom sx={{ mb: 0 }}>Default Latency (ms)</Typography>
                <Typography variant="body2" color="text.secondary">
                  {newCollection.default_latency_ms}ms
                </Typography>
              </Box>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={newCollection.default_latency_ms}
                  onChange={(e, value) => setNewCollection({ ...newCollection, default_latency_ms: value })}
                  min={0}
                  max={10000}
                  step={100}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography gutterBottom sx={{ mb: 0 }}>Default Fail Rate (%)</Typography>
                <Typography variant="body2" color="text.secondary">
                  {newCollection.default_fail_rate}%
                </Typography>
              </Box>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={newCollection.default_fail_rate}
                  onChange={(e, value) => setNewCollection({ ...newCollection, default_fail_rate: value })}
                  min={0}
                  max={100}
                  step={1}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCollection} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Endpoints; 
import React, { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react'; // Linter fix: type-only import
import { Link as RouterLink } from 'react-router-dom';
import {
  TextField, Button, Container, Typography, Paper, Box, List, ListItem, ListItemText, IconButton,
  CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import type { Instance } from '../types/index';
import { getInstancesApi, deleteInstanceApi } from '../services/api';

const InstanceListPage: React.FC = () => {
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));
  const [semester, setSemester] = useState<string>('1'); // Semester as string
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Semesters available for selection
  const availableSemesters = ['1', '2', 'Summer', 'Winter']; // Align with HomePage

  const handleFetchInstances = useCallback(async () => {
    setLoading(true);
    setError(null);
    setInstances([]); // Clear previous instances
    try {
      // API expects year and semester as strings if provided
      const fetchedInstances = await getInstancesApi(year, semester);
      console.log(fetchedInstances)
      setInstances(fetchedInstances); // Instances should already have nested course data
    } catch (err: unknown) {
      let message = 'Failed to fetch instances.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      // Handle 404 as no instances found, not as an error message to display
      if (err instanceof Error && err.message.includes('404')) {
        setError(null); // Clear error if it's just a 404 for no data
        setInstances([]);
      } else {
        setError(message);
      }
      console.error('Fetch instances error:', err);
    }
    setLoading(false);
  }, [year, semester]);

  // Fetch instances when year or semester changes, or on initial load with default values.
  useEffect(() => {
    if (year && semester) { // Ensure year and semester are set
        handleFetchInstances();
    }
  }, [handleFetchInstances]); // year and semester are dependencies of handleFetchInstances

  const handleDelete = async (instanceId: number | undefined) => {
    if (instanceId === undefined) {
        setError('Cannot delete instance with undefined ID.');
        return;
    }
    setError(null);
    const instanceToDelete = instances.find(inst => inst.id === instanceId);
    if (!instanceToDelete) return;

    const courseTitle = instanceToDelete.course_details?.title || 'this instance';
    if (window.confirm(`Are you sure you want to delete ${courseTitle} - ${instanceToDelete.year} Sem ${instanceToDelete.semester}?`)) {
      try {
        await deleteInstanceApi(instanceId); // Corrected API call
        // Refetch instances to update the list
        await handleFetchInstances();
      } catch (err: unknown) {
        let message = 'Failed to delete instance.';
        if (err instanceof Error) {
            message = err.message;
        } else if (typeof err === 'string') {
            message = err;
        }
        setError(message);
        console.error('Delete instance error:', err);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ padding: '2rem', marginTop: '2rem' }}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
            <Typography variant="h5" component="h1">
            Course Instances
            </Typography>
            <Button
                variant="contained"
                component={RouterLink}
                to="/create-instance"
                startIcon={<AddIcon />}
            >
            Create New Instance
            </Button>
        </Box>

        <Box component="form" onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); handleFetchInstances(); }} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', m: -1, alignItems: 'center' }}>
            <Box sx={{ p: 1, width: '100%', md: { width: 'calc(100% / 12 * 4)' } }}>
              <TextField
                label="Year"
                type="number" // Keep as number for input UX, converted to string for API if needed by API design
                value={year}
                onChange={(e) => setYear(e.target.value)} // API call converts to string if needed
                fullWidth
                required
              />
            </Box>
            <Box sx={{ p: 1, width: '100%', md: { width: 'calc(100% / 12 * 4)' } }}>
              <FormControl fullWidth required>
                <InputLabel>Semester</InputLabel>
                <Select
                  value={semester} // String value
                  label="Semester"
                  onChange={(e) => setSemester(e.target.value as string)}
                >
                  {availableSemesters.map((sem) => (
                    <MenuItem key={sem} value={sem}>{sem}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ p: 1, width: '100%', md: { width: 'calc(100% / 12 * 4)' }, alignSelf: 'center' }}>
              <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{height: '56px'}} >
                {loading ? <CircularProgress size={24} /> : 'Search Instances'}
              </Button>
            </Box>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
        {!loading && instances.length === 0 && (
          <Typography sx={{ mt: 2, textAlign: 'center' }}>No instances found for the selected year and semester.</Typography>
        )}

        {instances.length > 0 && !loading && (
          <List>
            {instances.map((instance) => (
              <ListItem
                key={instance.id}
                divider
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="view"
                      title="View Details"
                      component={RouterLink}
                      to={`/instances/${instance.year}/${instance.semester}/${instance.id!}`}
                      sx={{ mr: 1 }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      title="Delete Instance"
                      onClick={() => handleDelete(instance.id!)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    instance.course_details && instance.course_details.title && instance.course_details.course_code
                      ? `${instance.course_details.title} (${instance.course_details.course_code})`
                      : `Instance ID: ${instance.id}`
                  }
                  secondary={
                    <Box component="span">
                      <Typography component="span" variant="body2" color="text.secondary">
                        Year: {instance.year}, Semester: {instance.semester}
                      </Typography>
                      {(!instance.course_details || !instance.course_details.title) && (
                        <Typography component="span" variant="body2" color="error" sx={{ display: 'block', mt: 0.5 }}>
                          Warning: Course information is missing
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default InstanceListPage;

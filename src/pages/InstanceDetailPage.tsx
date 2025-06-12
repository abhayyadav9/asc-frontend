import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Box, CircularProgress, Alert, Button, Divider } from '@mui/material';
import { getInstancesApi } from '../services/api';
import type { Instance } from '../types';

const InstanceDetailPage: React.FC = () => {
  const { year, semester, id } = useParams<{ year: string; semester: string; id: string }>();
  const [instance, setInstance] = useState<Instance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstance = async () => {
      if (!year || !semester || !id) {
        setError('Missing required parameters');
        setIsLoading(false);
        return;
      }

      try {
        const instances = await getInstancesApi(year, semester);
        const foundInstance = instances.find(inst => inst.id === parseInt(id, 10));
        
        if (foundInstance) {
          setInstance(foundInstance);
        } else {
          setError('Instance not found');
        }
      } catch (err: unknown) {
        console.error('Error fetching instance:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch instance details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstance();
  }, [year, semester, id]);

  if (isLoading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        <Button
          component={RouterLink}
          to="/instances"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Back to Instances
        </Button>
      </Container>
    );
  }

  if (!instance) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 2 }}>Instance not found</Alert>
        <Button
          component={RouterLink}
          to="/instances"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Back to Instances
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {instance.course_details?.title || 'Course Details Not Available'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {instance.course_details?.course_code || 'Course Code Not Available'}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Instance Details</Typography>
          <Typography><strong>Year:</strong> {instance.year}</Typography>
          <Typography><strong>Semester:</strong> {instance.semester}</Typography>
        </Box>

        {instance.course_details && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Course Information</Typography>
              <Typography><strong>Title:</strong> {instance.course_details.title}</Typography>
              <Typography><strong>Code:</strong> {instance.course_details.course_code}</Typography>
              <Typography><strong>Description:</strong> {instance.course_details.description}</Typography>
              {instance.course_details.credits && (
                <Typography><strong>Credits:</strong> {instance.course_details.credits}</Typography>
              )}
              {instance.course_details.department && (
                <Typography><strong>Department:</strong> {instance.course_details.department}</Typography>
              )}
            </Box>
          </>
        )}

        <Box sx={{ mt: 3 }}>
          <Button
            component={RouterLink}
            to="/instances"
            variant="contained"
            sx={{ mr: 2 }}
          >
            Back to Instances
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this instance?')) {
                // Handle delete
                navigate('/instances');
              }
            }}
          >
            Delete Instance
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default InstanceDetailPage; 
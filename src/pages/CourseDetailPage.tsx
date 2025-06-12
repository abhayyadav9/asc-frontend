import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Box, CircularProgress, Alert, Button, Divider } from '@mui/material';
import { getCourseById } from '../services/api';
import type { Course } from '../types';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  // const [instances, setInstances] = useState<Instance[]>([]); // Optional: to show instances related to this course
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseDetails = useCallback(async (courseId: number) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedCourse = await getCourseById(courseId);
      setCourse(fetchedCourse);
      // Potentially fetch instances for this course if needed - more complex query needed on backend or filter client side
    } catch (err: unknown) {
      let message = 'Failed to fetch course details.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message);
      console.error('Fetch course details error:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (id) {
      const courseId = parseInt(id, 10);
      if (!isNaN(courseId)) {
        fetchCourseDetails(courseId);
      } else {
        setError('Invalid course ID provided.');
        setLoading(false);
      }
    } else {
      // This case should ideally be handled by routing if id is mandatory
      setError('No course ID provided.');
      setLoading(false);
      // Optional: redirect if no ID, e.g., navigate('/courses');
    }
  }, [id, fetchCourseDetails, navigate]);

  if (loading) {
    return <Container sx={{display: 'flex', justifyContent: 'center', mt: 4}}><CircularProgress /></Container>;
  }

  if (error) {
    return (
        <Container maxWidth="md" sx={{mt: 2}}>
            <Alert severity="error">{error}</Alert>
            <Button component={RouterLink} to="/courses" sx={{mt: 2}}>Back to Courses</Button>
        </Container>
    );
  }

  if (!course) {
    return (
        <Container maxWidth="md" sx={{mt: 2}}>
            <Typography>Course not found.</Typography>
            <Button component={RouterLink} to="/courses" sx={{mt: 2}}>Back to Courses</Button>
        </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: '2rem', marginTop: '2rem' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {course.title}
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Course Code: {course.course_code}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" paragraph sx={{fontWeight: 'bold'}}>
          Description:
        </Typography>
        <Typography variant="body1" paragraph sx={{whiteSpace: 'pre-wrap'}}>
          {course.description}
        </Typography>
        
        {/* Optional: Display instances for this course - would require fetching them */}
        {/* <Typography variant="h5" component="h2" gutterBottom sx={{mt: 3}}>
          Instances of this Course
        </Typography>
        {instances.length > 0 ? (
          <List>
            {instances.map(inst => (
              <ListItem key={inst.id} divider component={RouterLink} to={`/instances/${inst.year}/${inst.semester}/${inst.id}`}>
                <ListItemText primary={`Year: ${inst.year}, Semester: ${inst.semester}`} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No instances found for this course currently.</Typography>
        )} */}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" component={RouterLink} to="/courses">
            Back to Courses List
          </Button>
          {/* Optional: Edit button */}
          {/* <Button variant="contained" component={RouterLink} to={`/courses/${course.id}/edit`}>Edit Course</Button> */}
        </Box>
      </Paper>
    </Container>
  );
};

export default CourseDetailPage; 
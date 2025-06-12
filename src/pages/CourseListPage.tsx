import React, { useEffect, useState, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { List, ListItem, ListItemText, Button, Container, Typography, Paper, Box, IconButton, CircularProgress, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import type { Course } from '../types';
import { getCoursesApi, deleteCourseApi } from '../services/api';

const CourseListPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedCourses = await getCoursesApi();
      setCourses(fetchedCourses);
    } catch (err: unknown) {
      let message = 'Failed to fetch courses.';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      console.error('Fetch courses error:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDeleteCourse = async (id: number | undefined) => {
    if (id === undefined) {
      setError('Cannot delete course with undefined ID.');
      return;
    }
    setError(null);
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourseApi(id);
        await fetchCourses();
      } catch (err: unknown) {
        let message = 'Failed to delete course.';
        if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        console.error('Delete course error:', err);
      }
    }
  };

  if (loading) {
    return <Container sx={{display: 'flex', justifyContent: 'center', mt: 4}}><CircularProgress /></Container>;
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: '2rem', marginTop: '2rem' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Courses List
          </Typography>
          <Button 
            variant="contained" 
            component={RouterLink} 
            to="/create-course"
            startIcon={<AddIcon />}
          >
            Create New Course
          </Button>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {courses.length === 0 && !loading && (
          <Box textAlign="center" sx={{my: 3}}>
            <Typography>No courses found.</Typography>
          </Box>
        )}
        {courses.length > 0 && (
          <List>
            {courses.map((course) => (
              <ListItem 
                key={course.id} 
                divider
                secondaryAction={
                  <Box>
                    <IconButton 
                      edge="end" 
                      aria-label="view"
                      title="View Details"
                      component={RouterLink} 
                      to={`/courses/${course.id}`}
                      sx={{mr: 1}}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      title="Delete Course"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText 
                  primary={`${course.title} (${course.course_code})`}
                  secondary={course.description}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  sx={{cursor: 'pointer'}}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default CourseListPage; 
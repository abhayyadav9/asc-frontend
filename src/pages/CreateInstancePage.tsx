import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TextField, Button, Container, Typography, Paper, Box, 
    Select, MenuItem, FormControl, InputLabel, Alert, CircularProgress
} from '@mui/material';
import type { Course, CreateInstancePayload } from '../types'; // Use CreateInstancePayload
import { createInstanceApi, getCoursesApi } from '../services/api';

const CreateInstancePage: React.FC = () => {
  const navigate = useNavigate();
  const [year, setYear] = useState<string>(String(new Date().getFullYear())); // Year as string for TextField flexibility, API expects number
  const [semester, setSemester] = useState<string>('1'); // Semester as string
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const availableSemesters = ['1', '2', 'Summer', 'Winter']; // Align with HomePage

  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true);
    setError(null); // Clear previous errors related to course fetching
    try {
      const fetchedCourses = await getCoursesApi();
      setCourses(fetchedCourses);
      // Optionally, auto-select first course if list is not empty
      // if (fetchedCourses.length > 0 && fetchedCourses[0].id !== undefined) {
      //   setSelectedCourseId(String(fetchedCourses[0].id));
      // }
    } catch (err: unknown) {
      let message = 'Failed to load courses for selection.';
      if (err instanceof Error) message = err.message;
      else if (typeof err === 'string') message = err;
      setError(message);
      console.error('Failed to fetch courses:', err);
    }
    setLoadingCourses(false);
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate inputs
    if (!selectedCourseId) {
        setError('Please select a course.');
        return;
    }
    if (!year || !semester) {
        setError('Year and Semester are required.');
        return;
    }

    // Validate year is a reasonable number
    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        setError('Please enter a valid year between 2000 and 2100.');
        return;
    }

    // Validate course exists
    const selectedCourse = courses.find(c => String(c.id) === selectedCourseId);
    if (!selectedCourse) {
        setError('Selected course not found. Please try again.');
        return;
    }

    setIsSubmitting(true);
    const payload: CreateInstancePayload = { 
        year: yearNum,
        semester: semester, 
        course: parseInt(selectedCourseId, 10)
    };

    try {
      console.log('Creating instance with payload:', payload);
      console.log('Selected course details:', selectedCourse);
      const response = await createInstanceApi(payload);
      console.log('Instance created successfully:', response);
      setSuccess('Instance created successfully! Redirecting...');
      setSelectedCourseId('');
      setYear(String(new Date().getFullYear()));
      setSemester('1');
      setTimeout(() => navigate('/instances'), 2000);
    } catch (err: unknown) {
      console.error('Create instance error:', err);
      let message = 'Failed to create instance.';
      if (err instanceof Error) {
        message = err.message;
        // Try to extract more specific error message if available
        if (message.includes('Failed to create instance:')) {
          message = message.split('Failed to create instance:')[1].trim();
        }
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: '2rem', marginTop: '2rem' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Create New Course Instance
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="year"
            label="Year (e.g., 2023)"
            name="year"
            type="number" // Input type remains number for better UX
            value={year} // State is string, but TextField handles conversion
            onChange={(e) => setYear(e.target.value)} // Store as string
            disabled={isSubmitting}
          />
          <FormControl fullWidth margin="normal" required disabled={isSubmitting}>
            <InputLabel id="semester-label">Semester</InputLabel>
            <Select
              labelId="semester-label"
              id="semester"
              value={semester} // String value
              label="Semester"
              onChange={(e) => setSemester(e.target.value as string)}
            >
              {availableSemesters.map(sem => (
                  <MenuItem key={sem} value={sem}>{sem}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {loadingCourses ? (
            <Box sx={{display: 'flex', justifyContent: 'center', my: 2}}><CircularProgress /></Box>
          ) : courses.length === 0 && !error ? (
            <Alert severity="warning" sx={{my: 2}}>No courses available to create an instance. Please <a href="/create-course">create a course</a> first.</Alert>
          ) : (
            <FormControl fullWidth margin="normal" required disabled={isSubmitting || courses.length === 0}>
              <InputLabel id="course-label">Course</InputLabel>
              <Select
                labelId="course-label"
                id="course"
                value={selectedCourseId}
                label="Course"
                onChange={(e) => setSelectedCourseId(e.target.value as string)}
              >
                {courses.map((course) => (
                  <MenuItem key={course.id} value={String(course.id)!}> {/* Ensure value is string for Select */}
                    {course.title} ({course.course_code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Box sx={{display: 'flex', justifyContent:'flex-end', alignItems: 'center', gap: 2, mt: 2}}>
             <Button 
                variant="outlined"
                onClick={() => navigate(-1)} 
                disabled={isSubmitting}
             >
                Cancel
            </Button>
            <Button
                type="submit"
                variant="contained"
                disabled={loadingCourses || courses.length === 0 || isSubmitting}
                sx={{ minWidth: '150px'}} // Give some width for loader
            >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create Instance'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateInstancePage; 
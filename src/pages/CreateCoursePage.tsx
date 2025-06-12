import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Paper, Box, Alert, CircularProgress } from '@mui/material';
import type { CreateCoursePayload } from '../types';
import { createCourseApi } from '../services/api';

const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [credits, setCredits] = useState('3'); // Default to 3 credits
  const [department, setDepartment] = useState('Computer Science'); // Default department
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title || !courseCode || !description) {
        setError("All fields are required.");
        return;
    }

    // Validate credits is a positive number
    const creditsNum = parseInt(credits, 10);
    if (isNaN(creditsNum) || creditsNum <= 0) {
        setError("Credits must be a positive number.");
        return;
    }

    setIsSubmitting(true);

    const courseData: CreateCoursePayload = { 
      title, 
      course_code: courseCode, 
      description,
      credits: creditsNum,
      department
    };
    
    try {
      await createCourseApi(courseData);
      setSuccess('Course created successfully! Redirecting...');
      setTitle('');
      setCourseCode('');
      setDescription('');
      setCredits('3');
      setDepartment('Computer Science');
      setTimeout(() => navigate('/courses'), 2000);
    } catch (err: unknown) {
      let message = 'Failed to create course.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message);
      console.error('Create course error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: '2rem', marginTop: '2rem' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Create New Course
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Course Title"
            name="title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="courseCode"
            label="Course Code (e.g., CS101)"
            name="courseCode"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            disabled={isSubmitting}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="description"
            label="Description"
            name="description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="credits"
            label="Credits"
            name="credits"
            type="number"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            disabled={isSubmitting}
            inputProps={{ min: 1 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="department"
            label="Department"
            name="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            disabled={isSubmitting}
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
                disabled={isSubmitting}
                sx={{ minWidth: '150px'}}
            >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create Course'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateCoursePage; 
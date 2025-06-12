import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Paper,
  Container,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import type { Course, Instance, CreateCoursePayload, CreateInstancePayload } from '../types';
import {
  getCoursesApi,
  createCourseApi,
  deleteCourseApi,
  getInstancesApi,
  createInstanceApi,
  deleteInstanceApi,
} from '../services/api';

const HomePage: React.FC = () => {
  // --- State for Create Course ---
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCodeInput, setCourseCodeInput] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCredits, setCourseCredits] = useState('3');
  const [courseDepartment, setCourseDepartment] = useState('Computer Science');
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [createCourseError, setCreateCourseError] = useState<string | null>(null);

  // --- State for Courses List ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [listCoursesError, setListCoursesError] = useState<string | null>(null);
  const [showCourses, setShowCourses] = useState(false);

  // --- State for Create Instance ---
  const [selectedCourseForInstance, setSelectedCourseForInstance] = useState<number | ''>('');
  const [instanceYear, setInstanceYear] = useState('');
  const [instanceSemester, setInstanceSemester] = useState('');
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);
  const [createInstanceError, setCreateInstanceError] = useState<string | null>(null);
  const [isLoadingCoursesForDropdown, setIsLoadingCoursesForDropdown] = useState(false);

  // --- State for Instances List ---
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);
  const [listInstancesError, setListInstancesError] = useState<string | null>(null);
  const [showInstances, setShowInstances] = useState(false);
  const [filterInstanceYear, setFilterInstanceYear] = useState('');
  const [filterInstanceSemester, setFilterInstanceSemester] = useState('');

  const availableSemesters = ['1', '2', 'Summer', 'Winter'];

  const fetchCoursesForDropdown = useCallback(async () => {
    setIsLoadingCoursesForDropdown(true);
    setListCoursesError(null);
    try {
      const fetchedCourses = await getCoursesApi();
      setCourses(fetchedCourses);
    } catch (error: unknown) {
      let message = 'Failed to fetch courses for dropdown.';
      if (error instanceof Error) message = error.message;
      else if (typeof error === 'string') message = error;
      setListCoursesError(message);
      setCourses([]);
    } finally {
      setIsLoadingCoursesForDropdown(false);
    }
  }, []);

  useEffect(() => {
    fetchCoursesForDropdown();
  }, [fetchCoursesForDropdown]);

  const handleAddCourse = async () => {
    if (!courseTitle || !courseCodeInput || !courseDescription) {
      setCreateCourseError("All course fields are required.");
      return;
    }

    // Validate credits is a positive number
    const creditsNum = parseInt(courseCredits, 10);
    if (isNaN(creditsNum) || creditsNum <= 0) {
      setCreateCourseError("Credits must be a positive number.");
      return;
    }

    setIsCreatingCourse(true);
    setCreateCourseError(null);
    const payload: CreateCoursePayload = {
      title: courseTitle,
      course_code: courseCodeInput,
      description: courseDescription,
      credits: creditsNum,
      department: courseDepartment
    };
    try {
      await createCourseApi(payload);
      setCourseTitle('');
      setCourseCodeInput('');
      setCourseDescription('');
      setCourseCredits('3');
      setCourseDepartment('Computer Science');
      await fetchCoursesForDropdown();
      if (showCourses) {
        await handleListCourses(false);
      }
    } catch (error: unknown) {
      let message = 'Failed to create course.';
      if (error instanceof Error) message = error.message;
      else if (typeof error === 'string') message = error;
      setCreateCourseError(message);
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    const originalCourses = [...courses];
    setCourses(prev => prev.filter(c => c.id !== id));
    setListCoursesError(null);

    try {
      await deleteCourseApi(id);
      await fetchCoursesForDropdown();
      if (showCourses) {
        await handleListCourses(false);
      }
      if (selectedCourseForInstance === id) {
        setSelectedCourseForInstance('');
      }
    } catch (error: unknown) {
      let message = 'Failed to delete course.';
      if (error instanceof Error) message = error.message;
      else if (typeof error === 'string') message = error;
      setListCoursesError(message);
      setCourses(originalCourses);
    }
  };

  const handleListCourses = async (triggeredByUser = true) => {
    if (triggeredByUser) setShowCourses(true);
    if (!showCourses && !triggeredByUser) return;

    setIsLoadingCourses(true);
    setListCoursesError(null);
    try {
      const fetchedCourses = await getCoursesApi();
      setCourses(fetchedCourses);
    } catch (error: unknown) {
      let message = 'Failed to fetch courses.';
      if (error instanceof Error) message = error.message;
      else if (typeof error === 'string') message = error;
      setListCoursesError(message);
      if (showCourses) setCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleAddInstance = async () => {
    if (!selectedCourseForInstance || !instanceYear || !instanceSemester) {
      setCreateInstanceError("Course, Year, and Semester are required for an instance.");
      return;
    }

    // Validate year is a reasonable number
    const yearNum = parseInt(instanceYear, 10);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      setCreateInstanceError('Please enter a valid year between 2000 and 2100.');
      return;
    }

    // Validate course exists
    const selectedCourse = courses.find(c => c.id === Number(selectedCourseForInstance));
    if (!selectedCourse) {
      setCreateInstanceError('Selected course not found. Please try again.');
      return;
    }

    setIsCreatingInstance(true);
    setCreateInstanceError(null);
    const payload: CreateInstancePayload = {
      course: Number(selectedCourseForInstance),
      year: yearNum,
      semester: instanceSemester,
    };

    try {
      console.log('Creating instance with payload:', payload);
      console.log('Selected course details:', selectedCourse);
      const response = await createInstanceApi(payload);
      console.log('Instance created successfully:', response);

      // Verify course details in response
      if (!response.course_details || !response.course_details.title) {
        console.warn('Created instance is missing course details:', response);
      }

      setSelectedCourseForInstance('');
      setInstanceYear('');
      setInstanceSemester('');
      if (showInstances) {
        await handleListInstances(false);
      }
    } catch (error: unknown) {
      console.error('Create instance error:', error);
      let message = 'Failed to create instance.';
      if (error instanceof Error) {
        message = error.message;
        // Try to extract more specific error message if available
        if (message.includes('Failed to create instance:')) {
          message = message.split('Failed to create instance:')[1].trim();
        }
      } else if (typeof error === 'string') {
        message = error;
      }
      setCreateInstanceError(message);
    } finally {
      setIsCreatingInstance(false);
    }
  };

  const handleDeleteInstance = async (instanceId: number) => {
    if (!window.confirm("Are you sure you want to delete this instance?")) return;

    const originalInstances = [...instances];
    setInstances(prev => prev.filter(i => i.id !== instanceId));
    setListInstancesError(null);
    try {
      await deleteInstanceApi(instanceId);
      if (showInstances) {
        await handleListInstances(false);
      }
    } catch (error: unknown) {
      let message = 'Failed to delete instance.';
      if (error instanceof Error) message = error.message;
      else if (typeof error === 'string') message = error;
      setListInstancesError(message);
      setInstances(originalInstances);
    }
  };

  const handleListInstances = async (triggeredByUser = true) => {
    if (triggeredByUser) setShowInstances(true);
    if (!showInstances && !triggeredByUser) return;

    setIsLoadingInstances(true);
    setListInstancesError(null);
    try {
      const fetchedInstances = await getInstancesApi(filterInstanceYear, filterInstanceSemester);
      setInstances(fetchedInstances);
    } catch (error: unknown) {
      let message = 'Failed to fetch instances.';
      if (error instanceof Error) message = error.message;
      else if (typeof error === 'string') message = error;
      setListInstancesError(message);
      if (showInstances) setInstances([]);
    } finally {
      setIsLoadingInstances(false);
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Section 1: Create Course */}
      <Paper elevation={3} sx={{ padding: '2rem', marginBottom: '2rem' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Create Course
        </Typography>
        {createCourseError && <Alert severity="error" sx={{ mb: 2 }}>{createCourseError}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} component="div">
            <TextField
              fullWidth
              label="Course title"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              variant="outlined"
              disabled={isCreatingCourse}
            />
          </Grid>
          <Grid item xs={12} sm={4} component="div">
            <TextField
              fullWidth
              label="Course code"
              value={courseCodeInput}
              onChange={(e) => setCourseCodeInput(e.target.value)}
              variant="outlined"
              disabled={isCreatingCourse}
            />
          </Grid>
          <Grid item xs={12} sm={4} component="div">
            <TextField
              fullWidth
              label="Course description"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              variant="outlined"
              disabled={isCreatingCourse}
            />
          </Grid>
          <Grid item xs={12} sm={4} component="div">
            <TextField
              fullWidth
              label="Credits"
              type="number"
              value={courseCredits}
              onChange={(e) => setCourseCredits(e.target.value)}
              variant="outlined"
              disabled={isCreatingCourse}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={4} component="div">
            <TextField
              fullWidth
              label="Department"
              value={courseDepartment}
              onChange={(e) => setCourseDepartment(e.target.value)}
              variant="outlined"
              disabled={isCreatingCourse}
            />
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'left', mt:1 }} component="div">
            <Button
                variant="contained"
                color="primary"
                onClick={handleAddCourse}
                disabled={isCreatingCourse || isLoadingCoursesForDropdown}
            >
              {isCreatingCourse ? <CircularProgress size={24} /> : 'Add course'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Section 2: List Courses */}
      <Paper elevation={3} sx={{ padding: '2rem', marginBottom: '2rem' }}>
         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
            Course List
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => handleListCourses()}
                disabled={isLoadingCourses}
                sx={{mb:0}}
            >
              {isLoadingCourses ? <CircularProgress size={24} /> : (showCourses ? 'Refresh Courses' : 'List courses')}
            </Button>
        </Box>
        {listCoursesError && <Alert severity="error" sx={{ mb: 2 }}>{listCoursesError}</Alert>}
        {showCourses && !isLoadingCourses && courses.length === 0 && !listCoursesError && (
            <Typography sx={{my: 2}}>No courses found.</Typography>
        )}
        {showCourses && isLoadingCourses && <CircularProgress sx={{ display: 'block', margin: 'auto', my: 2 }} />}
        {showCourses && !isLoadingCourses && courses.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Course Code</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Credits</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.course_code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.description}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell>{course.department}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleDeleteCourse(course.id!)} color="error" title="Delete Course">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Section 3: Create Instance */}
      <Paper elevation={3} sx={{ padding: '2rem', marginBottom: '2rem' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Create Course Instance
        </Typography>
        {createInstanceError && <Alert severity="error" sx={{ mb: 2 }}>{createInstanceError}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} component="div">
            <FormControl fullWidth>
              <InputLabel>Course</InputLabel>
              <Select
                value={selectedCourseForInstance}
                label="Course"
                onChange={(e) => setSelectedCourseForInstance(e.target.value as number)}
                disabled={isLoadingCoursesForDropdown || isCreatingInstance}
              >
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title} ({course.course_code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} component="div">
            <TextField
              fullWidth
              label="Year"
              type="number"
              value={instanceYear}
              onChange={(e) => setInstanceYear(e.target.value)}
              disabled={isCreatingInstance}
            />
          </Grid>
          <Grid item xs={12} sm={4} component="div">
            <FormControl fullWidth>
              <InputLabel>Semester</InputLabel>
              <Select
                value={instanceSemester}
                label="Semester"
                onChange={(e) => setInstanceSemester(e.target.value as string)}
                disabled={isCreatingInstance}
              >
                {availableSemesters.map((sem) => (
                  <MenuItem key={sem} value={sem}>{sem}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} component="div">
            <Button
              variant="contained"
              onClick={handleAddInstance}
              disabled={isCreatingInstance || !selectedCourseForInstance || !instanceYear || !instanceSemester}
              startIcon={isCreatingInstance ? <CircularProgress size={20} /> : null}
            >
              {isCreatingInstance ? 'Creating...' : 'Create Instance'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Section 4: List Instances */}
      <Paper elevation={3} sx={{ padding: '2rem' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Course Instances List
          </Typography>
          <Button
              variant="contained"
              color="primary"
              onClick={() => handleListInstances()}
              disabled={isLoadingInstances}
              sx={{mb:0}}
          >
              {isLoadingInstances ? <CircularProgress size={24} /> : (showInstances ? 'Refresh Instances' : 'List Instances')}
          </Button>
        </Box>
        {listInstancesError && <Alert severity="error" sx={{ mb: 2 }}>{listInstancesError}</Alert>}
        {showInstances && !isLoadingInstances && instances.length === 0 && !listInstancesError && (
            <Typography sx={{my: 2}}>No instances found.</Typography>
        )}
        {showInstances && isLoadingInstances && <CircularProgress sx={{ display: 'block', margin: 'auto', my: 2 }} />}
        {showInstances && !isLoadingInstances && instances.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Course</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {instances.map((instance) => (
                  <TableRow key={instance.id}>
                    <TableCell>
                      {instance.course_details ?
                        `${instance.course_details.title} (${instance.course_details.course_code})` :
                        `Course ID: ${instance.course}`}
                    </TableCell>
                    <TableCell>{instance.year}</TableCell>
                    <TableCell>{instance.semester}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleDeleteInstance(instance.id!)}
                        color="error"
                        title="Delete Instance"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default HomePage;
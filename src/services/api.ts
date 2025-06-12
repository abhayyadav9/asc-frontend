import { API_BASE_URL } from '../config';
import type { Course, Instance, CreateCoursePayload, CreateInstancePayload as ApiCreateInstancePayload } from '../types'; // Renamed to avoid potential naming conflicts if any local vars had same name, though not strictly necessary here.

// --- Course API --- 

export const getCoursesApi = async (): Promise<Course[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`);
    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getCoursesApi:', error);
    throw error;
  }
};

export const createCourseApi = async (courseData: CreateCoursePayload): Promise<Course> => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to create course: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createCourseApi:', error);
    throw error;
  }
};

export const deleteCourseApi = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to delete course: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error in deleteCourseApi:', error);
    throw error;
  }
};

export async function getCourseById(id: number): Promise<Course> {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`);
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to fetch course ${id}: ${response.statusText} - ${errorData}`);
  }
  return response.json();
}

// --- Course Instance API --- 

export const getInstancesApi = async (year?: string, semester?: string): Promise<Instance[]> => {
  try {
    console.log('Fetching instances with filters:', { year, semester });
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (semester) params.append('semester', semester);
    params.append('include_course', 'true');

    const url = `${API_BASE_URL}/instances?${params.toString()}`;
    console.log('Fetching instances from URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to fetch instances:', errorData);
      throw new Error(errorData.detail || `Failed to fetch instances: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Fetched instances with course details:', data);

    // Validate course data in response
    data.forEach((instance: Instance) => {
      if (!instance.course_details || !instance.course_details.title || !instance.course_details.course_code) {
        console.warn('Instance missing course data:', instance);
      }
    });

    return data;
  } catch (error) {
    console.error('Error in getInstancesApi:', error);
    throw error;
  }
};

export const createInstanceApi = async (instanceData: ApiCreateInstancePayload): Promise<Instance> => {
  try {
    console.log('Creating instance with payload:', instanceData);
    const response = await fetch(`${API_BASE_URL}/instances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...instanceData,
        include_course: true // Request course details in response
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to create instance:', errorData);
      throw new Error(errorData.detail || `Failed to create instance: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Instance created successfully with course details:', data);

    // Validate the response includes course data
    if (!data.course_details || !data.course_details.title || !data.course_details.course_code) {
      console.warn('Created instance is missing course data:', data);
    }

    return data;
  } catch (error) {
    console.error('Error in createInstanceApi:', error);
    throw error;
  }
};

export async function getInstanceDetails(year: string, semester: string, id: number): Promise<Instance> {
  const response = await fetch(`${API_BASE_URL}/instances/${year}/${semester}/${id}`);
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to fetch instance ${year}-${semester}-${id}: ${response.statusText} - ${errorData}`);
  }
  return response.json();
}

export const deleteInstanceApi = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/instances/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to delete instance: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error in deleteInstanceApi:', error);
    throw error;
  }
}; 
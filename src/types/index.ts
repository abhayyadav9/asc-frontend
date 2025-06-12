// Course related types
export type Course = {
  id?: number;
  title: string;
  course_code: string;
  description: string;
  credits?: number;
  department?: string;
};

export type CreateCoursePayload = {
  title: string;
  course_code: string;
  description: string;
  credits: number;
  department: string;
};

// Instance related types
export type Instance = {
  id?: number;
  course: number;  // Course ID for creation
  course_details?: Course;  // Full course details when reading
  year: number;
  semester: string;
};

export type CreateInstancePayload = {
  course: number;
  year: number;
  semester: string;
};

// API response types
export type ApiResponse<T> = {
  data: T;
  message?: string;
  error?: string;
};

// Error types
export type ApiError = {
  detail: string;
  status: number;
}; 
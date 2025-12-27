// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Set auth token to localStorage
export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  register: async (userData: any) => {
    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  getMe: async () => {
    return await apiCall('/auth/me');
  },

  logout: () => {
    removeAuthToken();
  },

  updateDetails: async (userData: any) => {
    return await apiCall('/auth/updatedetails', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    return await apiCall('/auth/updatepassword', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Students API
export const studentsAPI = {
  getAll: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/students${query}`);
  },

  getStudents: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/students${query}`);
  },

  getById: async (id: string) => {
    return await apiCall(`/students/${id}`);
  },

  create: async (studentData: any) => {
    return await apiCall('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  createStudent: async (studentData: any) => {
    return await apiCall('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  update: async (id: string, studentData: any) => {
    return await apiCall(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  },

  updateStudent: async (id: string, studentData: any) => {
    return await apiCall(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  },

  delete: async (id: string) => {
    return await apiCall(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  deleteStudent: async (id: string) => {
    return await apiCall(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  getGrades: async (id: string) => {
    return await apiCall(`/students/${id}/grades`);
  },

  getAttendance: async (id: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/students/${id}/attendance${query}`);
  },

  getFees: async (id: string) => {
    return await apiCall(`/students/${id}/fees`);
  },
};

// Teachers API
export const teachersAPI = {
  getAll: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/teachers${query}`);
  },

  getTeachers: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/teachers${query}`);
  },

  getById: async (id: string) => {
    return await apiCall(`/teachers/${id}`);
  },

  create: async (teacherData: any) => {
    return await apiCall('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData),
    });
  },

  createTeacher: async (teacherData: any) => {
    return await apiCall('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData),
    });
  },

  update: async (id: string, teacherData: any) => {
    return await apiCall(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacherData),
    });
  },

  updateTeacher: async (id: string, teacherData: any) => {
    return await apiCall(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacherData),
    });
  },

  delete: async (id: string) => {
    return await apiCall(`/teachers/${id}`, {
      method: 'DELETE',
    });
  },

  deleteTeacher: async (id: string) => {
    return await apiCall(`/teachers/${id}`, {
      method: 'DELETE',
    });
  },

  getClasses: async (id: string) => {
    return await apiCall(`/teachers/${id}/classes`);
  },

  getMe: async () => {
    return await apiCall('/teachers/me');
  },
};

// Classes API
export const classesAPI = {
  getClasses: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/classes${query}`);
  },

  getAll: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/classes${query}`);
  },

  getById: async (id: string) => {
    return await apiCall(`/classes/${id}`);
  },

  create: async (classData: any) => {
    return await apiCall('/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  },

  update: async (id: string, classData: any) => {
    return await apiCall(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData),
    });
  },

  delete: async (id: string) => {
    return await apiCall(`/classes/${id}`, {
      method: 'DELETE',
    });
  },

  getStudents: async (id: string) => {
    return await apiCall(`/classes/${id}/students`);
  },
};

// Attendance API
export const attendanceAPI = {
  getAll: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/attendance${query}`);
  },

  mark: async (attendanceData: any) => {
    return await apiCall('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  },

  update: async (id: string, attendanceData: any) => {
    return await apiCall(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(attendanceData),
    });
  },

  getByStudent: async (studentId: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/attendance/student/${studentId}${query}`);
  },

  getByClass: async (classId: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/attendance/class/${classId}${query}`);
  },

  getReport: async (params: any) => {
    const query = `?${new URLSearchParams(params)}`;
    return await apiCall(`/attendance/report${query}`);
  },
};

// Grades API
export const gradesAPI = {
  getAll: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/grades${query}`);
  },

  add: async (gradeData: any) => {
    return await apiCall('/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  },

  addBulk: async (grades: any[]) => {
    return await apiCall('/grades/bulk', {
      method: 'POST',
      body: JSON.stringify({ grades }),
    });
  },

  update: async (id: string, gradeData: any) => {
    return await apiCall(`/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gradeData),
    });
  },

  delete: async (id: string) => {
    return await apiCall(`/grades/${id}`, {
      method: 'DELETE',
    });
  },

  getByStudent: async (studentId: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/grades/student/${studentId}${query}`);
  },

  getByClass: async (classId: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/grades/class/${classId}${query}`);
  },

  getReport: async (studentId: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/grades/report/${studentId}${query}`);
  },
};

// Fees API
export const feesAPI = {
  getAll: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/fees${query}`);
  },

  getById: async (id: string) => {
    return await apiCall(`/fees/${id}`);
  },

  create: async (feeData: any) => {
    return await apiCall('/fees', {
      method: 'POST',
      body: JSON.stringify(feeData),
    });
  },

  createForClass: async (classId: string, feeData: any) => {
    return await apiCall(`/fees/class/${classId}`, {
      method: 'POST',
      body: JSON.stringify(feeData),
    });
  },

  update: async (id: string, feeData: any) => {
    return await apiCall(`/fees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(feeData),
    });
  },

  recordPayment: async (id: string, paymentData: any) => {
    return await apiCall(`/fees/${id}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  applyDiscount: async (id: string, discountData: any) => {
    return await apiCall(`/fees/${id}/discount`, {
      method: 'POST',
      body: JSON.stringify(discountData),
    });
  },

  getByStudent: async (studentId: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/fees/student/${studentId}${query}`);
  },

  getPending: async () => {
    return await apiCall('/fees/pending');
  },

  getOverdue: async () => {
    return await apiCall('/fees/overdue');
  },

  getReport: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/fees/report${query}`);
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/notifications${query}`);
  },

  getById: async (id: string) => {
    return await apiCall(`/notifications/${id}`);
  },

  create: async (notificationData: any) => {
    return await apiCall('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  },

  update: async (id: string, notificationData: any) => {
    return await apiCall(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(notificationData),
    });
  },

  delete: async (id: string) => {
    return await apiCall(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  getRecent: async (limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return await apiCall(`/notifications/recent${query}`);
  },

  markAsRead: async (id: string) => {
    return await apiCall(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async () => {
    return await apiCall('/notifications/read/all', {
      method: 'PUT',
    });
  },

  getUnreadCount: async () => {
    return await apiCall('/notifications/unread/count');
  },
};

// Dashboard API
export const dashboardAPI = {
  getAdminDashboard: async (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return await apiCall(`/dashboard/admin${query}`);
  },

  getTeacherDashboard: async () => {
    return await apiCall('/dashboard/teacher');
  },

  getParentDashboard: async () => {
    return await apiCall('/dashboard/parent');
  },
};

export default {
  auth: authAPI,
  students: studentsAPI,
  teachers: teachersAPI,
  classes: classesAPI,
  attendance: attendanceAPI,
  grades: gradesAPI,
  fees: feesAPI,
  notifications: notificationsAPI,
  dashboard: dashboardAPI,
};

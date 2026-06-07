import axios from 'axios';

// Get API base URL from environments
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject JWT headers if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch authorization issues (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid: force clear auth state
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      // If we are on a page that is not login/register, redirect to login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// Authentication Calls
// ==========================================

export const registerUser = async (username, password) => {
  const response = await api.post('/auth/register', { username, password });
  return response.data;
};

export const loginUser = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  const { access_token, token_type, username: responseUsername } = response.data;
  
  // Save credentials locally
  localStorage.setItem('token', access_token);
  localStorage.setItem('username', responseUsername);
  
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getUsername = () => {
  return localStorage.getItem('username') || '';
};

// ==========================================
// Analysis Calls
// ==========================================

export const analyzeResume = async (file, resumeText, jobDescription) => {
  const formData = new FormData();
  
  if (file) {
    formData.append('file', file);
  } else if (resumeText) {
    formData.append('resume_text', resumeText);
  }
  
  formData.append('job_description', jobDescription);
  
  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const compareResumes = async (file1, resumeText1, file2, resumeText2, jobDescription) => {
  const formData = new FormData();
  
  if (file1) formData.append('file1', file1);
  if (resumeText1) formData.append('resume_text1', resumeText1);
  
  if (file2) formData.append('file2', file2);
  if (resumeText2) formData.append('resume_text2', resumeText2);
  
  formData.append('job_description', jobDescription);
  
  const response = await api.post('/compare', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// ==========================================
// History & Reports Calls
// ==========================================

export const getHistory = async () => {
  const response = await api.get('/history');
  return response.data;
};

export const getHistoryDetail = async (id) => {
  const response = await api.get(`/history/${id}`);
  return response.data;
};

export const deleteHistory = async (id) => {
  const response = await api.delete(`/history/${id}`);
  return response.data;
};

export const downloadPDFReport = async (id) => {
  const response = await api.get(`/report/${id}`, {
    responseType: 'blob', // Important: request raw blob bytes
  });
  
  // Create object URL and download file automatically
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  
  // Extract filename from headers if available or assign default
  let filename = `ATS_Audit_Report_${id.substring(0, 8)}.pdf`;
  const disposition = response.headers['content-disposition'];
  if (disposition && disposition.indexOf('filename=') !== -1) {
    filename = disposition.split('filename=')[1].replace(/"/g, '');
  }
  
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  
  // Clean up references
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default api;

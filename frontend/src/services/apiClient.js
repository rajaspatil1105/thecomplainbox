import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * API Client Service
 * Axios wrapper with interceptors for authentication, error handling, and rate limiting
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// REQUEST INTERCEPTOR - JWT Injection
// ============================================================================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('thecomplainbox_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Increase timeout for file upload endpoints
    if (config.url && (config.url.includes('/complaints') && config.method === 'post') || config.data instanceof FormData) {
      config.timeout = 30000;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR - Global Error Handling
// ============================================================================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    // Handle 401 - Unauthorized (expired or invalid token)
    if (status === 401) {
      localStorage.removeItem('thecomplainbox_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please log in again.', {
        duration: 5000,
        style: {
          background: '#D02020',
          color: '#ffffff',
          border: '2px solid #121212',
          boxShadow: '4px 4px 0px 0px #121212',
        },
      });
      return Promise.reject(error);
    }

    // Handle 429 - Rate Limit Exceeded
    if (status === 429) {
      toast.warning('Rate limit exceeded. Please wait before trying again.', {
        duration: 5000,
        style: {
          background: '#F0C020',
          color: '#121212',
          border: '2px solid #121212',
          boxShadow: '4px 4px 0px 0px #121212',
        },
      });
      return Promise.reject(error);
    }

    // Handle 403 - Forbidden (insufficient permissions)
    if (status === 403) {
      const message = data?.error || 'You do not have permission for this action.';
      toast.error(message, {
        duration: 5000,
        style: {
          background: '#D02020',
          color: '#ffffff',
          border: '2px solid #121212',
          boxShadow: '4px 4px 0px 0px #121212',
        },
      });
      return Promise.reject(error);
    }

    // Handle 404 - Not Found
    if (status === 404) {
      toast.error('Resource not found.', {
        duration: 4000,
        style: {
          background: '#D02020',
          color: '#ffffff',
          border: '2px solid #121212',
          boxShadow: '4px 4px 0px 0px #121212',
        },
      });
      return Promise.reject(error);
    }

    // Handle 500 - Server Error
    if (status === 500) {
      toast.error('Server error. Please try again later.', {
        duration: 5000,
        style: {
          background: '#D02020',
          color: '#ffffff',
          border: '2px solid #121212',
          boxShadow: '4px 4px 0px 0px #121212',
        },
      });
      return Promise.reject(error);
    }

    // Handle 400 - Bad Request
    if (status === 400) {
      const message = data?.message || data?.error || 'Invalid request. Please check your input.';
      toast.error(message, {
        duration: 4000,
        style: {
          background: '#D02020',
          color: '#ffffff',
          border: '2px solid #121212',
          boxShadow: '4px 4px 0px 0px #121212',
        },
      });
      return Promise.reject(error);
    }

    // Handle network errors (no response)
    if (!error.response) {
      if (error.message === 'Network Error') {
        toast.error('Cannot reach backend API. Make sure backend is running on port 4000.', {
          duration: 5000,
          style: {
            background: '#D02020',
            color: '#ffffff',
            border: '2px solid #121212',
            boxShadow: '4px 4px 0px 0px #121212',
          },
        });
      }
      return Promise.reject(error);
    }

    // Generic error handling
    const message = data?.message || data?.error || 'An error occurred. Please try again.';
    toast.error(message, {
      duration: 4000,
      style: {
        background: '#D02020',
        color: '#ffffff',
        border: '2px solid #121212',
        boxShadow: '4px 4px 0px 0px #121212',
      },
    });

    return Promise.reject(error);
  }
);

export default apiClient;

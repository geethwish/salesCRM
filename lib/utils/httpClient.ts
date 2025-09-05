import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { authToasts } from '@/lib/components/ui/Toast';

// Create axios instance with default configuration
const httpClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for authentication
});

// Request interceptor to add authentication token
httpClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Add request timestamp for debugging
    if (config.headers) {
      config.headers['X-Request-Time'] = new Date().toISOString();
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.status);
    }
    return response;
  },
  (error: AxiosError) => {
    const { response, request, message } = error;

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ HTTP Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: response?.status,
        message: message,
        data: response?.data,
      });
    }

    // Handle different error scenarios
    if (response) {
      // Server responded with error status
      handleHttpError(response);
    } else if (request) {
      // Request was made but no response received (network error)
      handleNetworkError();
    } else {
      // Something else happened
      handleGenericError(message);
    }

    return Promise.reject(error);
  }
);

// Handle HTTP errors based on status codes
function handleHttpError(response: AxiosResponse) {
  const { status, data } = response;
  const errorMessage = data?.error?.message || data?.message || 'An error occurred';

  switch (status) {
    case 400:
      // Bad Request - validation errors
      if (data?.error?.details) {
        // Handle detailed validation errors
        const validationErrors = data.error.details
          .map((detail: any) => detail.message)
          .join(', ');
        authToasts.validationError(validationErrors);
      } else {
        authToasts.validationError(errorMessage);
      }
      break;

    case 401:
      // Unauthorized - token expired or invalid
      handleUnauthorized();
      break;

    case 403:
      // Forbidden - insufficient permissions
      authToasts.forbidden();
      break;

    case 404:
      // Not Found
      authToasts.error('The requested resource was not found.');
      break;

    case 409:
      // Conflict - usually duplicate data
      authToasts.error(errorMessage);
      break;

    case 422:
      // Unprocessable Entity - validation errors
      authToasts.validationError(errorMessage);
      break;

    case 429:
      // Too Many Requests - rate limiting
      authToasts.error('Too many requests. Please wait a moment and try again.');
      break;

    case 500:
    case 502:
    case 503:
    case 504:
      // Server errors
      authToasts.serverError();
      break;

    default:
      // Other errors
      authToasts.error(errorMessage);
      break;
  }
}

// Handle network errors (no response from server)
function handleNetworkError() {
  authToasts.networkError();
}

// Handle generic errors
function handleGenericError(message: string) {
  console.error('Generic error:', message);
  authToasts.error('An unexpected error occurred. Please try again.');
}

// Handle unauthorized access
function handleUnauthorized() {
  // Clear authentication data
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-token');
    
    // Show unauthorized toast
    authToasts.unauthorized();
    
    // Redirect to login page after a short delay
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 1500);
  }
}

// Retry configuration for failed requests
const retryConfig = {
  retries: 3,
  retryDelay: (retryCount: number) => {
    return Math.pow(2, retryCount) * 1000; // Exponential backoff
  },
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status <= 599);
  },
};

// Add retry functionality
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as any;
    
    // Initialize retry count
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }

    // Check if we should retry
    if (
      config.__retryCount < retryConfig.retries &&
      retryConfig.retryCondition(error)
    ) {
      config.__retryCount++;
      
      // Calculate delay
      const delay = retryConfig.retryDelay(config.__retryCount);
      
      // Log retry attempt in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Retrying request (${config.__retryCount}/${retryConfig.retries}) after ${delay}ms`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return httpClient(config);
    }

    return Promise.reject(error);
  }
);

// Utility functions for common HTTP operations
export const api = {
  // GET request
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return httpClient.get<T>(url, config);
  },

  // POST request
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return httpClient.post<T>(url, data, config);
  },

  // PUT request
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return httpClient.put<T>(url, data, config);
  },

  // PATCH request
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return httpClient.patch<T>(url, data, config);
  },

  // DELETE request
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return httpClient.delete<T>(url, config);
  },
};

// Authentication-specific API calls
export const authApi = {
  // Login
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    return api.post('/api/auth/login', credentials);
  },

  // Register
  register: (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
  }) => {
    return api.post('/api/auth/register', userData);
  },

  // Logout
  logout: () => {
    return api.post('/api/auth/logout');
  },

  // Get current user
  me: () => {
    return api.get('/api/auth/me');
  },

  // Update profile
  updateProfile: (data: { name?: string; email?: string }) => {
    return api.put('/api/auth/profile', data);
  },

  // Change password
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    return api.put('/api/auth/change-password', data);
  },
};

export default httpClient;

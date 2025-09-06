'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  AuthState,
  AuthAction,
  LoginRequest,
  RegisterRequest,
  UpdateProfile,
  ChangePassword,
  UseAuthReturn
} from '@/lib/types/auth';
import { authApi } from '@/lib/utils/httpClient';
import { authToasts } from '@/lib/components/ui/Toast';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<UseAuthReturn | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to extract error message from unknown error
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  const errorObj = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
  return errorObj?.response?.data?.error?.message || errorObj?.message || defaultMessage;
};

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authApi.me();

      if (response.data.success && response.data.data) {
        const token = getStoredToken();
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.data,
            token: token || ''
          }
        });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
      removeToken();
    }
  }, [dispatch]);

  // Check for existing authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Get stored token from localStorage
  const getStoredToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    return null;
  };

  // Store token in localStorage
  const storeToken = (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
  };

  // Remove token from localStorage
  const removeToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
  };

  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authApi.login(credentials);
      const data = response.data;

      if (data.success && data.data) {
        const { user, token } = data.data;
        storeToken(token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token }
        });

        // Show success toast
        authToasts.loginSuccess(user.name);

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        const errorMessage = data.error?.message || 'Login failed';
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        authToasts.loginError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Login failed');
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      authToasts.loginError(errorMessage);
      throw error;
    }
  };

  // Register function
  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authApi.register(userData);
      const data = response.data;

      if (data.success && data.data) {
        const { user, token } = data.data;
        storeToken(token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token }
        });

        // Show success toast
        authToasts.registerSuccess(user.name);

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        const errorMessage = data.error?.message || 'Registration failed';
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        authToasts.registerError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Registration failed');
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      authToasts.registerError(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      dispatch({ type: 'AUTH_LOGOUT' });
      authToasts.logoutSuccess();
      router.push('/');
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  // Update profile function
  const updateProfile = async (profileData: UpdateProfile): Promise<void> => {
    try {
      const response = await authApi.updateProfile(profileData);
      const data = response.data;

      if (data.success && data.data) {
        dispatch({ type: 'AUTH_UPDATE_USER', payload: data.data });
        // Show success toast
        authToasts.profileUpdateSuccess();
      } else {
        const errorMessage = data.error?.message || 'Profile update failed';
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        authToasts.validationError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Profile update failed');
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      authToasts.validationError(errorMessage);
      throw error;
    }
  };

  // Change password function
  const changePassword = async (passwordData: ChangePassword): Promise<void> => {
    try {
      const response = await authApi.changePassword(passwordData);
      const data = response.data;

      if (data.success) {
        // Show success toast
        authToasts.passwordChangeSuccess();
      } else {
        const errorMessage = data.error?.message || 'Password change failed';
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        authToasts.validationError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Password change failed');
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      authToasts.validationError(errorMessage);
      throw error;
    }
  };

  // Context value
  const value: UseAuthReturn = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    clearError,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected route component
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallback
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show fallback if not authenticated
  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600">
            Please log in to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Check role requirements
  if (requiredRole && user) {
    const roleHierarchy = ['user', 'manager', 'admin'];
    const userRoleIndex = roleHierarchy.indexOf(user.role.toLowerCase());
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole.toLowerCase());

    if (userRoleIndex < requiredRoleIndex) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You don&apos;t have permission to access this page.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

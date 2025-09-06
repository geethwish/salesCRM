/**
 * Redux Provider wrapper for the Sales CRM application
 * 
 * This component provides Redux store and persistence to the entire application.
 * It replaces the previous AuthProvider and integrates with redux-persist
 * for token persistence across browser sessions.
 */

'use client';

import React, { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useRouter, usePathname } from 'next/navigation';
import { store, persistor } from '@/lib/store';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { checkAuthStatus, selectIsAuthenticated, selectIsLoading, selectUser } from '@/lib/store/slices/authSlice';

/**
 * Loading component displayed during rehydration
 */
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Auth initialization component
 * Handles authentication check and routing after rehydration
 */
function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const user = useAppSelector(selectUser);

  // Check authentication status on mount
  useEffect(() => {
    // Only check auth status if we have a token in persisted state
    const persistedState = localStorage.getItem('persist:auth');
    if (persistedState) {
      try {
        const authState = JSON.parse(persistedState);
        if (authState.token && authState.token !== 'null') {
          dispatch(checkAuthStatus());
        }
      } catch (error) {
        console.error('Error parsing persisted auth state:', error);
      }
    }
  }, [dispatch]);

  // Handle routing based on authentication status
  useEffect(() => {
    if (!isLoading) {
      // Redirect logic based on current path and auth status
      if (isAuthenticated && (pathname === '/' || pathname === '/auth/login' || pathname === '/auth/register')) {
        router.replace('/dashboard');
      } else if (!isAuthenticated && pathname.startsWith('/dashboard')) {
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return <>{children}</>;
}

/**
 * Protected Route component
 * Replaces the previous ProtectedRoute from AuthContext
 */
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
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const user = useAppSelector(selectUser);

  // Show loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show fallback if not authenticated
  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please log in to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Main Redux Provider component
 * Wraps the entire application with Redux store and persistence
 */
interface ReduxProviderProps {
  children: ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </PersistGate>
    </Provider>
  );
}

export default ReduxProvider;

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { LoadingTransition } from '@/lib/components/ui/PageTransition';

/**
 * Root page component that implements authentication-based routing
 *
 * Behavior:
 * - If user is NOT authenticated: Redirect to /auth/login
 * - If user IS authenticated: Redirect to /dashboard
 * - Shows loading state while determining authentication status
 */
export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after authentication status is determined
    if (!isLoading) {
      if (isAuthenticated) {
        // User is authenticated, redirect to dashboard
        router.replace('/dashboard');
      } else {
        // User is not authenticated, redirect to login
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while determining authentication status
  // This prevents any flash of content before redirect
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <LoadingTransition
        isLoading={true}
        loadingComponent={
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Loading Sales CRM...
            </p>
          </div>
        }
      >
        {/* This content should never be shown as redirect happens immediately */}
        <div></div>
      </LoadingTransition>
    </div>
  );
}

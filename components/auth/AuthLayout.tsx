'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useAuth } from '@/lib/contexts/AuthContext';
import { LoadingTransition } from '@/lib/components/ui/PageTransition';

type AuthMode = 'login' | 'register';

interface AuthLayoutProps {
  initialMode?: AuthMode;
  redirectTo?: string;
  className?: string;
}

export function AuthLayout({
  initialMode = 'login',
  redirectTo = '/dashboard',
  className = ''
}: AuthLayoutProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  const switchToLogin = () => setMode('login');
  const switchToRegister = () => setMode('register');

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingTransition
          isLoading={true}
          loadingComponent={
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Loading...
              </p>
            </div>
          }
        >
          <div></div>
        </LoadingTransition>
      </div>
    );
  }

  // Don't render auth forms if user is authenticated (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${className}`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Sales CRM
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your sales pipeline effectively
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {mode === 'login' ? (
          <LoginForm
            onSwitchToRegister={switchToRegister}
            redirectTo={redirectTo}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={switchToLogin}
            redirectTo={redirectTo}
          />
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 Sales CRM. All rights reserved.
        </p>
      </div>
    </div>
  );
}

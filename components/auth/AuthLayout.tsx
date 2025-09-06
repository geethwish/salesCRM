'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useAuth } from '@/lib/hooks/useAuth';
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
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors duration-200">
        <LoadingTransition
          isLoading={true}
          loadingComponent={
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary transition-colors duration-200"></div>
              <p className="text-muted-foreground text-sm transition-colors duration-200">
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
    <div className={`min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200 ${className}`}>
      {/* Enhanced branding section with better dark mode support */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3 transition-colors duration-200">
            Sales CRM
          </h1>
          <p className="text-lg text-muted-foreground transition-colors duration-200">
            Manage your sales pipeline effectively
          </p>
        </div>
      </div>

      {/* Form container with improved spacing */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
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

      {/* Enhanced footer with better dark mode styling */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground transition-colors duration-200">
          © 2024 Sales CRM. All rights reserved.
        </p>
      </div>
    </div>
  );
}

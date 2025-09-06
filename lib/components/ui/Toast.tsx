'use client';

import React from 'react';
import { Toaster, toast as hotToast, ToastOptions } from 'react-hot-toast';

// Base toast configuration
const baseToastConfig: ToastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    maxWidth: '400px',
  },
};

// Success toast styling
const successToastConfig: ToastOptions = {
  ...baseToastConfig,
  style: {
    ...baseToastConfig.style,
    background: 'rgb(34, 197, 94)', // green-500
    color: 'white',
    border: '1px solid rgb(22, 163, 74)', // green-600
  },
  iconTheme: {
    primary: 'white',
    secondary: 'rgb(34, 197, 94)',
  },
};

// Error toast styling
const errorToastConfig: ToastOptions = {
  ...baseToastConfig,
  style: {
    ...baseToastConfig.style,
    background: 'rgb(239, 68, 68)', // red-500
    color: 'white',
    border: '1px solid rgb(220, 38, 38)', // red-600
  },
  iconTheme: {
    primary: 'white',
    secondary: 'rgb(239, 68, 68)',
  },
};

// Loading toast styling
const loadingToastConfig: ToastOptions = {
  ...baseToastConfig,
  style: {
    ...baseToastConfig.style,
    background: 'rgb(59, 130, 246)', // blue-500
    color: 'white',
    border: '1px solid rgb(37, 99, 235)', // blue-600
  },
  iconTheme: {
    primary: 'white',
    secondary: 'rgb(59, 130, 246)',
  },
};

// Dark mode base configuration
const darkBaseToastConfig: ToastOptions = {
  ...baseToastConfig,
  style: {
    ...baseToastConfig.style,
    background: 'rgb(31, 41, 55)', // gray-800
    color: 'rgb(243, 244, 246)', // gray-100
    border: '1px solid rgb(55, 65, 81)', // gray-700
  },
};

// Dark mode success toast styling
const darkSuccessToastConfig: ToastOptions = {
  ...darkBaseToastConfig,
  style: {
    ...darkBaseToastConfig.style,
    background: 'rgb(22, 163, 74)', // green-600 (darker for dark mode)
    color: 'white',
    border: '1px solid rgb(21, 128, 61)', // green-700
  },
  iconTheme: {
    primary: 'white',
    secondary: 'rgb(22, 163, 74)',
  },
};

// Dark mode error toast styling
const darkErrorToastConfig: ToastOptions = {
  ...darkBaseToastConfig,
  style: {
    ...darkBaseToastConfig.style,
    background: 'rgb(220, 38, 38)', // red-600 (darker for dark mode)
    color: 'white',
    border: '1px solid rgb(185, 28, 28)', // red-700
  },
  iconTheme: {
    primary: 'white',
    secondary: 'rgb(220, 38, 38)',
  },
};

// Dark mode loading toast styling
const darkLoadingToastConfig: ToastOptions = {
  ...darkBaseToastConfig,
  style: {
    ...darkBaseToastConfig.style,
    background: 'rgb(37, 99, 235)', // blue-600 (darker for dark mode)
    color: 'white',
    border: '1px solid rgb(29, 78, 216)', // blue-700
  },
  iconTheme: {
    primary: 'white',
    secondary: 'rgb(37, 99, 235)',
  },
};

// Helper function to detect dark mode
const isDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Toast utility functions with dynamic dark mode support
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    const config = isDarkMode() ? darkSuccessToastConfig : successToastConfig;
    return hotToast.success(message, {
      ...config,
      ...options,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    const config = isDarkMode() ? darkErrorToastConfig : errorToastConfig;
    return hotToast.error(message, {
      ...config,
      ...options,
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    const config = isDarkMode() ? darkLoadingToastConfig : loadingToastConfig;
    return hotToast.loading(message, {
      ...config,
      ...options,
    });
  },

  promise: <T = unknown>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: ToastOptions
  ) => {
    const config = isDarkMode() ? darkBaseToastConfig : baseToastConfig;
    return hotToast.promise(promise, messages, {
      ...config,
      ...options,
    });
  },

  dismiss: (toastId?: string) => {
    return hotToast.dismiss(toastId);
  },

  remove: (toastId?: string) => {
    return hotToast.remove(toastId);
  },

  custom: (jsx: React.ReactElement, options?: ToastOptions) => {
    const config = isDarkMode() ? darkBaseToastConfig : baseToastConfig;
    return hotToast.custom(jsx, {
      ...config,
      ...options,
    });
  },
};

// Authentication-specific toast messages
export const authToasts = {
  loginSuccess: (userName?: string) => {
    const message = userName ? `Welcome back, ${userName}!` : 'Login successful!';
    return toast.success(message);
  },

  loginError: (error?: string) => {
    const message = error || 'Login failed. Please check your credentials.';
    return toast.error(message);
  },

  registerSuccess: (userName?: string) => {
    const message = userName ? `Welcome, ${userName}! Your account has been created.` : 'Registration successful!';
    return toast.success(message);
  },

  registerError: (error?: string) => {
    const message = error || 'Registration failed. Please try again.';
    return toast.error(message);
  },

  logoutSuccess: () => {
    return toast.success('You have been logged out successfully.');
  },

  profileUpdateSuccess: () => {
    return toast.success('Profile updated successfully!');
  },

  passwordChangeSuccess: () => {
    return toast.success('Password changed successfully!');
  },

  validationError: (error?: string) => {
    const message = error || 'Please check your input and try again.';
    return toast.error(message);
  },

  networkError: () => {
    return toast.error('Network error. Please check your connection and try again.');
  },

  serverError: () => {
    return toast.error('Server error. Please try again later.');
  },

  unauthorized: () => {
    return toast.error('Your session has expired. Please log in again.');
  },

  forbidden: () => {
    return toast.error('You do not have permission to perform this action.');
  },
};

// Toast Provider Component
interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  // Detect dark mode using CSS media query
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    // Check initial dark mode preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const currentConfig = isDarkMode ? darkBaseToastConfig : baseToastConfig;

  return (
    <>
      {children}
      <Toaster
        position={currentConfig.position}
        toastOptions={currentConfig}
        containerStyle={{
          top: 20,
          right: 20,
        }}
        containerClassName="toast-container"
      />
    </>
  );
}

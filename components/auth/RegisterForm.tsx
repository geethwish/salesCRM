'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { validatePasswordStrength } from '@/lib/utils/auth';
import { registerSchema, type RegisterFormData } from '@/lib/schemas/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FormFieldTransition } from '@/lib/components/ui/PageTransition';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  redirectTo?: string;
  className?: string;
}

export function RegisterForm({
  onSwitchToLogin,
  redirectTo = '/',
  className = ''
}: RegisterFormProps) {
  const router = useRouter();
  const { register, isLoading, error, clearError, isAuthenticated } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ isValid: boolean; errors: string[] }>({
    isValid: false,
    errors: [],
  });

  // Initialize form with react-hook-form and Zod validation
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    mode: 'onChange',
  });

  // Watch password field for strength validation
  const watchedPassword = form.watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  // Clear errors when form changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [form.formState, error, clearError]);

  // Check password strength when password changes
  useEffect(() => {
    if (watchedPassword) {
      setPasswordStrength(validatePasswordStrength(watchedPassword));
    } else {
      setPasswordStrength({ isValid: false, errors: [] });
    }
  }, [watchedPassword]);

  // Handle form submission with react-hook-form
  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.acceptTerms,
      });
    } catch (error) {
      // Error is handled by the auth context
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      <div className="bg-background p-8 rounded-3xl border-2 border-border shadow-xl transition-all duration-200">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4 transition-colors duration-200">
            Sign Up
          </h1>
          <p className="text-lg text-muted-foreground transition-colors duration-200">
            Join us today! Please fill in your information.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormFieldTransition delay={0.1}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-base font-medium text-foreground transition-colors duration-200">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        autoComplete="name"
                        disabled={isLoading}
                        className="h-14 text-base rounded-2xl border-2 border-input bg-background px-4 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm transition-colors duration-200" />
                  </FormItem>
                )}
              />
            </FormFieldTransition>
            <FormFieldTransition delay={0.2}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-base font-medium text-foreground transition-colors duration-200">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        disabled={isLoading}
                        className="h-14 text-base rounded-2xl border-2 border-input bg-background px-4 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm transition-colors duration-200" />
                  </FormItem>
                )}
              />
            </FormFieldTransition>
            <FormFieldTransition delay={0.3}>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-base font-medium text-foreground transition-colors duration-200">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          autoComplete="new-password"
                          disabled={isLoading}
                          className="h-14 text-base rounded-2xl border-2 border-input bg-background px-4 pr-14 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute inset-y-0 right-0 px-4 py-0 h-full hover:bg-transparent transition-colors duration-200"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-muted-foreground transition-colors duration-200" />
                          ) : (
                            <Eye className="h-5 w-5 text-muted-foreground transition-colors duration-200" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-sm transition-colors duration-200" />
                  </FormItem>
                )}
              />
            </FormFieldTransition>
            {watchedPassword && (
              <div className="mt-2 p-3 bg-muted/50 rounded-xl border border-border transition-colors duration-200">
                <div className="text-sm font-medium text-foreground mb-2">Password requirements:</div>
                <ul className="text-sm space-y-1">
                  {passwordStrength.errors.map((error, index) => (
                    <li key={index} className="flex items-center text-destructive">
                      <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </li>
                  ))}
                  {passwordStrength.isValid && (
                    <li className="flex items-center text-success">
                      <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Password meets all requirements
                    </li>
                  )}
                </ul>
              </div>
            )}

            <FormFieldTransition delay={0.4}>
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-base font-medium text-foreground transition-colors duration-200">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          disabled={isLoading}
                          className="h-14 text-base rounded-2xl border-2 border-input bg-background px-4 pr-14 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute inset-y-0 right-0 px-4 py-0 h-full hover:bg-transparent transition-colors duration-200"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-muted-foreground transition-colors duration-200" />
                          ) : (
                            <Eye className="h-5 w-5 text-muted-foreground transition-colors duration-200" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-sm transition-colors duration-200" />
                  </FormItem>
                )}
              />
            </FormFieldTransition>

            <FormFieldTransition delay={0.5}>
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 py-2">
                    <FormControl>
                      <Checkbox
                        disabled={isLoading}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-5 w-5 rounded border-2 border-input transition-colors duration-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </FormControl>
                    <FormLabel className="text-base font-normal text-foreground transition-colors duration-200 cursor-pointer leading-relaxed">
                      I agree to the{' '}
                      <Button
                        type="button"
                        variant="link"
                        className="px-0 text-base font-normal text-primary hover:text-primary/80 h-auto p-0 underline underline-offset-4 transition-colors duration-200"
                        disabled={isLoading}
                      >
                        Terms of Service
                      </Button>
                      {' '}and{' '}
                      <Button
                        type="button"
                        variant="link"
                        className="px-0 text-base font-normal text-primary hover:text-primary/80 h-auto p-0 underline underline-offset-4 transition-colors duration-200"
                        disabled={isLoading}
                      >
                        Privacy Policy
                      </Button>
                    </FormLabel>
                    <FormMessage className="text-sm transition-colors duration-200" />
                  </FormItem>
                )}
              />
            </FormFieldTransition>

            {error && (
              <div className="bg-destructive/10 border-2 border-destructive/20 rounded-2xl p-4 transition-colors duration-200">
                <p className="text-base text-destructive font-medium transition-colors duration-200">{error}</p>
              </div>
            )}

            <FormFieldTransition delay={0.6}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg font-semibold rounded-2xl transition-all duration-200 mt-6 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#01257D',
                  color: 'white',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#001f66';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#01257D';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
                onMouseDown={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-3 h-5 w-5 animate-spin text-white" />
                    <span className="text-white">Creating account...</span>
                  </div>
                ) : (
                  <span className="text-white font-semibold">Sign Up</span>
                )}
              </Button>
            </FormFieldTransition>
          </form>
        </Form>

        {onSwitchToLogin && (
          <div className="mt-8 text-center">
            <p className="text-lg text-foreground transition-colors duration-200">
              Already have an account?{' '}
              <Button
                type="button"
                variant="link"
                className="px-0 text-lg font-medium text-primary hover:text-primary/80 underline underline-offset-4 transition-colors duration-200"
                onClick={onSwitchToLogin}
                disabled={isLoading}
              >
                Sign in here
              </Button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { LoginRequest } from '@/lib/types/auth';
import { useAuth } from '@/lib/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth';
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

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  redirectTo?: string;
  className?: string;
}

export function LoginForm({
  onSwitchToRegister,
  className = ''
}: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form with react-hook-form and Zod validation
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      // Clear any previous errors
      if (error) {
        clearError();
      }

      // Convert to LoginRequest format
      const loginData: LoginRequest = {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      };

      await login(loginData);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      <div className="bg-background p-8 rounded-3xl border-2 border-border shadow-xl transition-all duration-200">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4 transition-colors duration-200">
            Sign In
          </h1>
          <p className="text-lg text-muted-foreground transition-colors duration-200">
            Welcome back! Please sign in to your account.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormFieldTransition delay={0.1}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-base font-medium text-foreground transition-colors duration-200">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                          disabled={isLoading}
                          className="h-14 text-base rounded-2xl border-2 border-input bg-background px-4 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-sm transition-colors duration-200" />
                  </FormItem>
                )}
              />
            </FormFieldTransition>

            <FormFieldTransition delay={0.2}>
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
                          placeholder="••••••••••"
                          autoComplete="current-password"
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

            {/* Remember Me and Forgot Password - Matching Design */}
            <div className="flex items-center justify-between py-2">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        disabled={isLoading}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-5 w-5 rounded border-2 border-input transition-colors duration-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </FormControl>
                    <FormLabel className="text-base font-normal text-foreground transition-colors duration-200 cursor-pointer">
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="link"
                className="px-0 text-base font-normal text-primary hover:text-primary/80 transition-colors duration-200"
                disabled={isLoading}
              >
                Forgot password?
              </Button>
            </div>
            {error && (
              <div className="bg-destructive/10 border-2 border-destructive/20 rounded-2xl p-4 transition-colors duration-200">
                <p className="text-base text-destructive font-medium transition-colors duration-200">{error}</p>
              </div>
            )}

            <FormFieldTransition delay={0.4}>
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
                    <span className="text-white">Signing in...</span>
                  </div>
                ) : (
                  <span className="text-white font-semibold">Sign In</span>
                )}
              </Button>
            </FormFieldTransition>
          </form>
        </Form>

        {onSwitchToRegister && (
          <div className="mt-8 text-center">
            <p className="text-lg text-foreground transition-colors duration-200">
              Don&apos;t have an account?{' '}
              <Button
                type="button"
                variant="link"
                className="px-0 text-lg font-medium text-primary hover:text-primary/80 underline underline-offset-4 transition-colors duration-200"
                onClick={onSwitchToRegister}
                disabled={isLoading}
              >
                Sign up here
              </Button>
            </p>
          </div>
        )}
      </div>
    </div >
  );
}

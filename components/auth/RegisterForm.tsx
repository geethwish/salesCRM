'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
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
} from '@/components/ui/form';
import { FormFieldTransition } from '@/lib/components/ui/PageTransition';
import { cn } from '@/lib/utils';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  redirectTo?: string;
  className?: string;
}

const EnhancedFormMessage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { error?: string }
>(({ className, error, children, ...props }, ref) => {
  const message = error || children;

  if (!message) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-start gap-2 mt-1 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 transition-all duration-200",
        className
      )}
      {...props}
    >
      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
      <p className="text-sm font-medium text-red-700 dark:text-red-300 leading-relaxed">
        {message}
      </p>
    </div>
  );
});
EnhancedFormMessage.displayName = "EnhancedFormMessage";

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
    mode: 'onBlur',
    reValidateMode: 'onChange',
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
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={cn(
                      "text-base font-medium transition-colors duration-200",
                      fieldState.error ? "text-red-700 dark:text-red-300" : "text-foreground"
                    )}>
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        autoComplete="name"
                        disabled={isLoading}
                        className={cn(
                          "h-14 text-base rounded-2xl border-2 bg-background px-4 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                          fieldState.error
                            ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20 dark:focus:ring-red-400/20"
                            : "border-input focus:border-primary"
                        )}
                        {...field}
                      />
                    </FormControl>
                    {fieldState.error && (
                      <EnhancedFormMessage error={fieldState.error.message} />
                    )}
                  </FormItem>
                )}
              />
            </FormFieldTransition>
            <FormFieldTransition delay={0.2}>
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={cn(
                      "text-base font-medium transition-colors duration-200",
                      fieldState.error ? "text-red-700 dark:text-red-300" : "text-foreground"
                    )}>
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        disabled={isLoading}
                        className={cn(
                          "h-14 text-base rounded-2xl border-2 bg-background px-4 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                          fieldState.error
                            ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20 dark:focus:ring-red-400/20"
                            : "border-input focus:border-primary"
                        )}
                        {...field}
                      />
                    </FormControl>
                    {fieldState.error && (
                      <EnhancedFormMessage error={fieldState.error.message} />
                    )}
                  </FormItem>
                )}
              />
            </FormFieldTransition>
            <FormFieldTransition delay={0.3}>
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={cn(
                      "text-base font-medium transition-colors duration-200",
                      fieldState.error ? "text-red-700 dark:text-red-300" : "text-foreground"
                    )}>
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          autoComplete="new-password"
                          disabled={isLoading}
                          className={cn(
                            "h-14 text-base rounded-2xl border-2 bg-background px-4 pr-14 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                            fieldState.error
                              ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20 dark:focus:ring-red-400/20"
                              : "border-input focus:border-primary"
                          )}
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
                    {fieldState.error && (
                      <EnhancedFormMessage error={fieldState.error.message} />
                    )}
                  </FormItem>
                )}
              />
            </FormFieldTransition>
            {watchedPassword && (
              <div className={cn(
                "mt-2 p-3 rounded-xl border transition-all duration-200",
                passwordStrength.isValid
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30"
                  : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30"
              )}>
                <div className={cn(
                  "text-sm font-medium mb-2 transition-colors duration-200",
                  passwordStrength.isValid
                    ? "text-green-800 dark:text-green-200"
                    : "text-amber-800 dark:text-amber-200"
                )}>
                  Password requirements:
                </div>
                <ul className="text-sm space-y-1">
                  {passwordStrength.errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-red-700 dark:text-red-300 leading-relaxed">{error}</span>
                    </li>
                  ))}
                  {passwordStrength.isValid && (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-green-700 dark:text-green-300 leading-relaxed font-medium">
                        Password meets all requirements
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            <FormFieldTransition delay={0.4}>
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={cn(
                      "text-base font-medium transition-colors duration-200",
                      fieldState.error ? "text-red-700 dark:text-red-300" : "text-foreground"
                    )}>
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          disabled={isLoading}
                          className={cn(
                            "h-14 text-base rounded-2xl border-2 bg-background px-4 pr-14 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                            fieldState.error
                              ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20 dark:focus:ring-red-400/20"
                              : "border-input focus:border-primary"
                          )}
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
                    {fieldState.error && (
                      <EnhancedFormMessage error={fieldState.error.message} />
                    )}
                  </FormItem>
                )}
              />
            </FormFieldTransition>

            <FormFieldTransition delay={0.5}>
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-2">
                    <div className="flex flex-row items-start space-x-3 space-y-0 py-2">
                      <FormControl>
                        <Checkbox
                          disabled={isLoading}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className={cn(
                            "h-5 w-5 rounded border-2 transition-colors duration-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5",
                            fieldState.error
                              ? "border-red-500 dark:border-red-400"
                              : "border-input"
                          )}
                        />
                      </FormControl>
                      <FormLabel className={cn(
                        "text-base font-normal transition-colors duration-200 cursor-pointer leading-relaxed",
                        fieldState.error ? "text-red-700 dark:text-red-300" : "text-foreground"
                      )}>
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
                    </div>
                    {fieldState.error && (
                      <EnhancedFormMessage error={fieldState.error.message} />
                    )}
                  </FormItem>
                )}
              />
            </FormFieldTransition>

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800/30 transition-all duration-200">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-base text-red-700 dark:text-red-300 font-medium leading-relaxed">
                    Registration Failed
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 leading-relaxed">
                    {error}
                  </p>
                </div>
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

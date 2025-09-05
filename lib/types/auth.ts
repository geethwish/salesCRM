import { z } from 'zod';

// User role enum
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  MANAGER: 'manager',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Password validation schema
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// User schema
export const UserSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password is required'), // Hashed password
  role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.MANAGER]).default(UserRole.USER),
  isActive: z.boolean().default(true),
  emailVerified: z.boolean().default(false),
  lastLogin: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Public user schema (without sensitive data)
export const PublicUserSchema = UserSchema.omit({ password: true });
export type PublicUser = z.infer<typeof PublicUserSchema>;

// Login request schema
export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Register request schema
export const RegisterRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format').toLowerCase(),
  password: PasswordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms of service',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// JWT payload schema
export const JWTPayloadSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.MANAGER]),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

// Auth response schema
export const AuthResponseSchema = z.object({
  user: PublicUserSchema,
  token: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number(), // Token expiration time in seconds
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Password reset request schema
export const PasswordResetRequestSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
});

export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;

// Password reset schema
export const PasswordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: PasswordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type PasswordReset = z.infer<typeof PasswordResetSchema>;

// Update profile schema
export const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  email: z.string().email('Invalid email format').toLowerCase().optional(),
}).partial();

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

// Change password schema
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: PasswordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ChangePassword = z.infer<typeof ChangePasswordSchema>;

// Auth state interface for client-side state management
export interface AuthState {
  user: PublicUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth context actions
export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: PublicUser; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_UPDATE_USER'; payload: PublicUser };

// Protected route props
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRoleType;
  fallback?: React.ReactNode;
}

// Auth hook return type
export interface UseAuthReturn {
  user: PublicUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (data: UpdateProfile) => Promise<void>;
  changePassword: (data: ChangePassword) => Promise<void>;
}

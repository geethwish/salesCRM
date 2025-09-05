import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { JWTPayload, PublicUser } from '@/lib/types/auth';
import { JWT_CONFIG, AUTH_CONFIG, ERROR_MESSAGES } from '@/lib/constants';

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(AUTH_CONFIG.BCRYPT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: PublicUser, rememberMe: boolean = false): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const expiresIn = rememberMe ? JWT_CONFIG.REFRESH_EXPIRES_IN : JWT_CONFIG.EXPIRES_IN;

  return jwt.sign(payload, JWT_CONFIG.SECRET, {
    expiresIn,
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE,
    algorithm: JWT_CONFIG.ALGORITHM,
  });
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(user: PublicUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_CONFIG.SECRET, {
    expiresIn: JWT_CONFIG.REFRESH_EXPIRES_IN,
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE,
    algorithm: JWT_CONFIG.ALGORITHM,
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET, {
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
      algorithms: [JWT_CONFIG.ALGORITHM],
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }

  // Check for Bearer token format
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (bearerMatch) {
    return bearerMatch[1];
  }

  // If not Bearer format, assume the entire header is the token
  return authHeader;
}

/**
 * Extract token from cookies
 */
export function extractTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get('auth-token')?.value || null;
}

/**
 * Get token from request (checks both header and cookies)
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // First try to get from Authorization header
  let token = extractTokenFromHeader(request);
  
  // If not found in header, try cookies
  if (!token) {
    token = extractTokenFromCookies(request);
  }

  return token;
}

/**
 * Authenticate request and return user payload
 */
export function authenticateRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

/**
 * Get token expiration time in seconds
 */
export function getTokenExpirationTime(rememberMe: boolean = false): number {
  const expiresIn = rememberMe ? JWT_CONFIG.REFRESH_EXPIRES_IN : JWT_CONFIG.EXPIRES_IN;
  
  // Convert time string to seconds
  if (typeof expiresIn === 'string') {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      
      switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 60 * 60;
        case 'd': return value * 24 * 60 * 60;
        default: return 24 * 60 * 60; // Default to 24 hours
      }
    }
  }
  
  return typeof expiresIn === 'number' ? expiresIn : 24 * 60 * 60;
}

/**
 * Generate a secure random token for password reset
 */
export function generateResetToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize user data for public consumption (remove sensitive fields)
 */
export function sanitizeUser(user: any): PublicUser {
  const { password, ...publicUser } = user;
  return publicUser as PublicUser;
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(userRole: string, requiredRole?: string): boolean {
  if (!requiredRole) {
    return true; // No specific role required
  }

  // Define role hierarchy (higher index = higher privilege)
  const roleHierarchy = ['user', 'manager', 'admin'];
  
  const userRoleIndex = roleHierarchy.indexOf(userRole.toLowerCase());
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole.toLowerCase());

  return userRoleIndex >= requiredRoleIndex;
}

/**
 * Create authentication error response
 */
export function createAuthError(message: string, statusCode: number = 401) {
  return {
    success: false,
    error: {
      error: 'Authentication Error',
      message,
      statusCode,
    },
  };
}

// API Configuration
export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_SORT_BY: "date",
  DEFAULT_SORT_ORDER: "desc",
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION_ERROR: "Validation error",
  ORDER_NOT_FOUND: "Order not found",
  INVALID_ORDER_ID: "Invalid order ID",
  INVALID_DATE_RANGE: "Invalid date range",
  INTERNAL_ERROR: "Internal server error",
  METHOD_NOT_ALLOWED: "Method not allowed",
  INVALID_QUERY_PARAMS: "Invalid query parameters",
  // Authentication errors
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "User not found",
  USER_ALREADY_EXISTS: "User already exists",
  EMAIL_ALREADY_EXISTS: "Email already exists",
  INVALID_TOKEN: "Invalid or expired token",
  TOKEN_EXPIRED: "Token has expired",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  WEAK_PASSWORD: "Password does not meet security requirements",
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match",
  CURRENT_PASSWORD_INCORRECT: "Current password is incorrect",
  EMAIL_NOT_VERIFIED: "Email address not verified",
  ACCOUNT_DISABLED: "Account has been disabled",
  TERMS_NOT_ACCEPTED: "Terms of service must be accepted",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_CREATED: "Order created successfully",
  ORDER_UPDATED: "Order updated successfully",
  ORDER_DELETED: "Order deleted successfully",
  ORDERS_RETRIEVED: "Orders retrieved successfully",
  // Authentication success messages
  LOGIN_SUCCESS: "Login successful",
  REGISTRATION_SUCCESS: "Registration successful",
  LOGOUT_SUCCESS: "Logout successful",
  PASSWORD_CHANGED: "Password changed successfully",
  PROFILE_UPDATED: "Profile updated successfully",
  EMAIL_VERIFIED: "Email verified successfully",
  PASSWORD_RESET_SENT: "Password reset email sent",
  PASSWORD_RESET_SUCCESS: "Password reset successful",
} as const;

// Date Formats
export const DATE_FORMATS = {
  ISO_DATE: "YYYY-MM-DD",
  ISO_DATETIME: "YYYY-MM-DDTHH:mm:ss.sssZ",
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  ORDERS_TTL: 5 * 60 * 1000, // 5 minutes in milliseconds
  STATS_TTL: 10 * 60 * 1000, // 10 minutes in milliseconds
} as const;

// JWT Configuration
export const JWT_CONFIG = {
  SECRET:
    process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
  EXPIRES_IN: "24h", // Token expiration time
  REFRESH_EXPIRES_IN: "7d", // Refresh token expiration time
  ALGORITHM: "HS256" as const,
  ISSUER: "sales-crm",
  AUDIENCE: "sales-crm-users",
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  BCRYPT_ROUNDS: 12, // Number of salt rounds for bcrypt
  MAX_LOGIN_ATTEMPTS: 5, // Maximum login attempts before lockout
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  PASSWORD_RESET_EXPIRES: 60 * 60 * 1000, // 1 hour in milliseconds
} as const;

// Cookie Configuration
export const COOKIE_CONFIG = {
  AUTH_TOKEN: "auth-token",
  REFRESH_TOKEN: "refresh-token",
  REMEMBER_ME: "remember-me",
  SECURE: process.env.NODE_ENV === "production",
  HTTP_ONLY: true,
  SAME_SITE: "strict" as const,
  PATH: "/",
} as const;

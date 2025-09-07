/**
 * API Configuration Utility
 * Automatically detects the correct base URL for API calls based on environment
 */

/**
 * Get the appropriate API base URL for the current environment
 * @returns The base URL for API calls
 */
export const getApiBaseUrl = (): string => {
  // If NEXT_PUBLIC_API_URL is explicitly set, use it (highest priority)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // For client-side (browser), use the current origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  
  // For server-side on Vercel, use the VERCEL_URL environment variable
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Fallback to localhost for local development
  return "http://localhost:3000";
};

/**
 * Check if the application is running in production
 * @returns true if in production environment
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === "production";
};

/**
 * Check if the application is running on Vercel
 * @returns true if running on Vercel
 */
export const isVercel = (): boolean => {
  return Boolean(process.env.VERCEL_URL);
};

/**
 * Get environment-specific configuration
 * @returns Configuration object with environment details
 */
export const getEnvironmentConfig = () => {
  const baseUrl = getApiBaseUrl();
  const isProd = isProduction();
  const onVercel = isVercel();
  
  return {
    baseUrl,
    isProduction: isProd,
    isVercel: onVercel,
    isDevelopment: !isProd,
    environment: isProd ? "production" : "development",
  };
};

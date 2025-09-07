/**
 * API Configuration Utility
 * Automatically detects the correct base URL for API calls based on environment
 */

/**
 * Get the appropriate API base URL for the current environment
 * @returns The base URL for API calls
 */

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
  const isProd = isProduction();
  const onVercel = isVercel();

  return {
    isProduction: isProd,
    isVercel: onVercel,
    isDevelopment: !isProd,
    environment: isProd ? "production" : "development",
  };
};

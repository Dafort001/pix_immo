/**
 * Runtime Configuration
 * Reads environment variables injected at build time
 */

/**
 * Get API Base URL from environment
 * @throws Error if VITE_API_BASE_URL is not set
 */
export function getApiBaseUrl(): string {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (!apiBaseUrl || apiBaseUrl === '') {
    throw new Error(
      'VITE_API_BASE_URL is not set. Please configure environment variables for API connectivity.'
    );
  }
  
  // Remove trailing slash for consistency
  return apiBaseUrl.replace(/\/$/, '');
}

/**
 * Get Application Environment
 * @returns 'development' | 'preview' | 'production'
 */
export function getAppEnv(): string {
  return import.meta.env.VITE_APP_ENV || 'development';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getAppEnv() === 'production';
}

/**
 * Check if running in preview
 */
export function isPreview(): boolean {
  return getAppEnv() === 'preview';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getAppEnv() === 'development';
}

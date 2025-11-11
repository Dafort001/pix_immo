/**
 * Feature Flags
 * Controlled via environment variables (VITE_FEATURE_*)
 */

/**
 * QA Guard - Enable smoke checks and rollback guards
 * Enabled in Preview, disabled in Production
 */
export const FEATURE_QA_GUARD = import.meta.env.VITE_FEATURE_QA_GUARD === 'true';

/**
 * Common.Types.ts
 * Shared primitive types used across the application.
 */

/** Supported locale codes — add new locales here */
export const SUPPORTED_LOCALES = ['ar', 'en'] as const;

/** Union type of all supported locale codes */
export type TLocale = typeof SUPPORTED_LOCALES[number];

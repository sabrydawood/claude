/**
 * Locale.Utils.ts
 * RTL/LTR direction utilities and locale validation.
 */
import { SUPPORTED_LOCALES, type TLocale } from "@/Shared/Types/Common.Types";

export type Locale = TLocale | "ar" | "en";

/**
 * RTL language codes — uses a broad string Set to cover all known RTL scripts,
 * not just the supported app locales. This ensures correct direction even when
 * users send Accept-Language headers with unsupported RTL locales.
 */
const RTL_LOCALES = new Set<string>([
  "ar",
  "he",
  "fa",
  "ur",
  "yi",
  "ps",
  "sd",
  "ug",
  "dv",
  "ks",
]);

/**
 * Returns the text direction for a given locale.
 * Accepts any locale string — not just TLocale — to handle Accept-Language headers.
 * @param Locale - BCP-47 locale code
 */
export function GetDir(Locale: string): "rtl" | "ltr" {
  return RTL_LOCALES.has(Locale) ? "rtl" : "ltr";
}

/**
 * Returns true if the locale uses right-to-left text direction.
 * Accepts any locale string — not just TLocale — to handle Accept-Language headers.
 * @param Locale - BCP-47 locale code
 */
export function IsRTL(Locale: string): boolean {
  return RTL_LOCALES.has(Locale);
}

/**
 * Validates a raw locale string and returns a supported TLocale.
 * Falls back to 'ar' if the value is unsupported or null.
 * @param RawLocale - Raw locale string from query param or header
 */
export function GetValidLocale(RawLocale: string | null | undefined): TLocale {
  if (
    RawLocale &&
    (SUPPORTED_LOCALES as readonly string[]).includes(RawLocale)
  ) {
    return RawLocale as TLocale;
  }
  return "ar";
}

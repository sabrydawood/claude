/**
 * Api.Errors.ts
 * Locale-aware API error response builder.
 *
 * Reads the request locale from headers (x-locale → Accept-Language → default 'ar'),
 * then uses next-intl getTranslations to return properly translated error messages.
 * This ensures ALL API error messages honor the frontend's language preference.
 */
import { getTranslations } from 'next-intl/server';
import type { NextRequest } from 'next/server';
import { SUPPORTED_LOCALES, type TLocale } from '@/Shared/Types/Common.Types';

/** All recognized API error codes */
export type TApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'INVALID_JSON'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'NO_API_KEY'
  | 'DECRYPT_FAILED'
  | 'LESSON_NOT_FOUND'
  | 'AGENT_NOT_FOUND'
  | 'NO_KEY'
  | 'INVALID_ID'
  | 'INVALID_KEY'
  | 'STREAM_ERROR'
  | 'AI_UNAVAILABLE';

/**
 * Extracts the locale from the incoming request.
 * Priority: X-Locale header → Accept-Language header → default 'ar'
 * @param Req - Incoming NextRequest
 */
export function GetRequestLocale(Req: NextRequest): TLocale {
  const XLocale = Req.headers.get('x-locale');
  if (XLocale && SUPPORTED_LOCALES.includes(XLocale as TLocale)) {
    return XLocale as TLocale;
  }

  const AcceptLang = Req.headers.get('accept-language') ?? '';
  for (const Locale of SUPPORTED_LOCALES) {
    if (AcceptLang.startsWith(Locale) || AcceptLang.includes(`${Locale}-`) || AcceptLang.includes(`,${Locale}`)) {
      return Locale;
    }
  }

  return 'ar';
}

/**
 * Returns a translated error object for use in API responses.
 * @param Locale - User's locale
 * @param Code - Machine-readable error code
 */
export async function GetApiError(
  Locale: TLocale,
  Code: TApiErrorCode,
): Promise<{ Code: TApiErrorCode; Message: string }> {
  try {
    const T = await getTranslations({ locale: Locale, namespace: 'apiErrors' });
    return { Code, Message: T(Code) };
  } catch {
    // Fallback: return code as message if translation fails
    return { Code, Message: Code };
  }
}

/**
 * Combined helper: reads locale from request, returns translated error object.
 * @param Req - Incoming NextRequest
 * @param Code - Machine-readable error code
 */
export async function GetRequestError(
  Req: NextRequest,
  Code: TApiErrorCode,
): Promise<{ Code: TApiErrorCode; Message: string }> {
  const Locale = GetRequestLocale(Req);
  return GetApiError(Locale, Code);
}

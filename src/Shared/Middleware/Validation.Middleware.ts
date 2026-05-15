/**
 * Validation.Middleware.ts
 * Parses and validates request body against a Zod schema.
 * Returns parsed data or a localized NextResponse 400 with validation errors.
 * The error message is translated based on the request's locale header.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GetRequestError, GetRequestLocale } from '@/lib/i18n/Api.Errors';
import { GetApiError } from '@/lib/i18n/Api.Errors';

/**
 * Parses and validates the JSON request body against the provided Zod schema.
 * @param Req - Incoming NextRequest (used for body parsing and locale detection)
 * @param Schema - Zod schema to validate against
 * @returns Parsed data or a localized NextResponse 400
 */
export async function ParseBodyOrBadRequest<T>(
  Req: NextRequest,
  Schema: z.ZodSchema<T>,
): Promise<T | NextResponse> {
  const Locale = GetRequestLocale(Req);
  try {
    const RawBody: unknown = await Req.json();
    const Parsed = Schema.safeParse(RawBody);
    if (!Parsed.success) {
      const Error = await GetApiError(Locale, 'VALIDATION_ERROR');
      return NextResponse.json(
        { Success: false, Error: { ...Error, Details: Parsed.error.flatten().fieldErrors } },
        { status: 400 },
      );
    }
    return Parsed.data;
  } catch {
    const Error = await GetRequestError(Req, 'INVALID_JSON');
    return NextResponse.json({ Success: false, Error }, { status: 400 });
  }
}

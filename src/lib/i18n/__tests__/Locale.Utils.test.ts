/**
 * Tests for GetValidLocale, GetDir, and IsRTL — pure functions with no external deps.
 */
import { describe, it, expect } from 'vitest';
import { GetValidLocale, GetDir, IsRTL } from '@/lib/i18n/Locale.Utils';

describe('GetValidLocale', () => {
  it('returns ar for Arabic locale', () => {
    expect(GetValidLocale('ar')).toBe('ar');
  });

  it('returns en for English locale', () => {
    expect(GetValidLocale('en')).toBe('en');
  });

  it('returns ar (default) for unsupported locale', () => {
    expect(GetValidLocale('xyz')).toBe('ar');
  });

  it('returns ar (default) for null', () => {
    expect(GetValidLocale(null)).toBe('ar');
  });

  it('returns ar (default) for undefined', () => {
    expect(GetValidLocale(undefined)).toBe('ar');
  });
});

describe('GetDir', () => {
  it('returns rtl for Arabic', () => {
    expect(GetDir('ar')).toBe('rtl');
  });

  it('returns rtl for Hebrew', () => {
    expect(GetDir('he')).toBe('rtl');
  });

  it('returns ltr for English', () => {
    expect(GetDir('en')).toBe('ltr');
  });

  it('returns ltr for French', () => {
    expect(GetDir('fr')).toBe('ltr');
  });
});

describe('IsRTL', () => {
  it('returns true for Arabic', () => {
    expect(IsRTL('ar')).toBe(true);
  });

  it('returns true for Farsi', () => {
    expect(IsRTL('fa')).toBe(true);
  });

  it('returns false for English', () => {
    expect(IsRTL('en')).toBe(false);
  });

  it('returns false for Spanish', () => {
    expect(IsRTL('es')).toBe(false);
  });
});

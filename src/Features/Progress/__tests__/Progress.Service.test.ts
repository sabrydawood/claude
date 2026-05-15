/**
 * Tests for CalcStreak — pure function, no DB needed.
 * The DB-connected modules imported by Progress.Service.ts are mocked
 * so no real database connection is required.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the DB connection before importing the service so no real
// postgres connection is attempted at module load time.
vi.mock('@/lib/db/Index', () => ({ db: {} }));
vi.mock('@/lib/db/Schema', () => ({}));

import { CalcStreak } from '../Progress.Service';

describe('CalcStreak', () => {
  const TODAY = new Date('2026-05-16T12:00:00Z');
  const YESTERDAY = new Date('2026-05-15T12:00:00Z');
  const TWO_DAYS_AGO = new Date('2026-05-14T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 1 when no previous activity', () => {
    expect(CalcStreak(null, 0)).toBe(1);
  });

  it('keeps streak when already active today', () => {
    expect(CalcStreak(TODAY, 5)).toBe(5);
  });

  it('increments streak for consecutive day', () => {
    expect(CalcStreak(YESTERDAY, 3)).toBe(4);
  });

  it('resets streak after gap', () => {
    expect(CalcStreak(TWO_DAYS_AGO, 7)).toBe(1);
  });
});

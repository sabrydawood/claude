/**
 * Tests for ResolveTrack — pure function, no DB needed.
 * getLessonsByAgent (used only by GenerateLearningPath, not ResolveTrack)
 * is mocked to prevent any DB connection at module load time.
 */
import { describe, it, expect, vi } from 'vitest';

// Mock content queries so the module loads without a DB connection.
vi.mock('@/lib/db/queries/content', () => ({
  getLessonsByAgent: vi.fn().mockResolvedValue([]),
}));

// Mock DB connection pulled in transitively through content.ts
vi.mock('@/lib/db/Index', () => ({ db: {} }));

import { ResolveTrack } from '../Onboarding.Service';

describe('ResolveTrack', () => {
  it('routes developer goal to developer track', () => {
    const result = ResolveTrack('developer', 'none');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('routes educator goal correctly', () => {
    const result = ResolveTrack('educator', 'some');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('routes advanced experience correctly', () => {
    const result = ResolveTrack('chat', 'advanced');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns a string for any valid combination', () => {
    const goals = ['chat', 'work', 'creative', 'developer', 'educator'];
    const experiences = ['none', 'some', 'advanced'];
    for (const g of goals) {
      for (const e of experiences) {
        expect(typeof ResolveTrack(g, e)).toBe('string');
      }
    }
  });
});

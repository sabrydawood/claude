/**
 * Mastery.Types.ts
 * Type definitions for the Student Mastery feature.
 */

export type TSignalType =
  | 'quiz_correct'
  | 'quiz_wrong'
  | 'socratic_pass'
  | 'practical_done'
  | 'peer_taught';

export interface IMasteryScore {
  ConceptId: string;
  ConceptNameAr: string;
  ConceptNameEn: string;
  Score: number;       // 0-100
  Attempts: number;
  LastTested: string | null;
}

export interface IStudentMasteryProfile {
  UserId: string;
  Scores: IMasteryScore[];
  TotalConcepts: number;
  MasteredCount: number;   // Score >= 80
  InProgressCount: number; // Score 1-79
  Insights: Record<string, unknown>;
}

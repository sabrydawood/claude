/**
 * Mascot.Types.ts
 * Types for the AI mascot chat feature.
 */

export interface IMascotMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Sandbox.Types.ts
 * Types for the AI sandbox chat feature.
 */

export interface ISandboxMessage {
  role: 'user' | 'assistant';
  content: string;
}

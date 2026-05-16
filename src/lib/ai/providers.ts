/**
 * Providers.ts
 * Centralized AI provider system with automatic fallback.
 * Fallback order: OpenRouter → Gemini → OpenAI → Anthropic
 * Adding a new provider = add one entry to the PROVIDERS array below.
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { APP_URL } from '@/lib/utils';

/** Chat message shape shared across all providers. */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Debug metadata returned after a successful stream. */
export interface StreamDebugInfo {
  provider: string;
  inputTokens: number;
  outputTokens: number;
}

/** Internal provider contract — not exported. */
interface IAIProvider {
  Name: string;
  IsAvailable: () => boolean;
  /** Yields text chunks. Sets debug counters on the tracker object when available. */
  GenerateStream: (System: string, Messages: ChatMessage[], debug: DebugTracker) => AsyncGenerator<string>;
}

/** Mutable tracker — providers write token counts here during streaming. */
interface DebugTracker {
  inputTokens: number;
  outputTokens: number;
}

// ─── OpenRouter (OpenAI-compatible, routes to many models) ───────────────────

/** OpenRouter provider — preferred because it supports many models and regions. */
const OpenRouterProvider: IAIProvider = {
  Name: 'OpenRouter',
  IsAvailable: () => !!process.env.OPENROUTER_API_KEY,
  async *GenerateStream(System, Messages, debug) {
    const Client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': APP_URL,
        'X-Title': 'Zkawi',
      },
    });

    const Stream = await Client.chat.completions.create({
      model: 'google/gemini-2.0-flash-lite-001',
      messages: [{ role: 'system', content: System }, ...Messages],
      stream: true,
      stream_options: { include_usage: true },
      max_tokens: 512,
    });

    for await (const Chunk of Stream) {
      const Text = Chunk.choices[0]?.delta?.content;
      if (Text) yield Text;
      if (Chunk.usage) {
        debug.inputTokens = Chunk.usage.prompt_tokens ?? 0;
        debug.outputTokens = Chunk.usage.completion_tokens ?? 0;
      }
    }
  },
};

// ─── Gemini via OpenAI-compatible endpoint ───────────────────────────────────

/** Google Gemini provider — second in fallback chain. */
const GeminiProvider: IAIProvider = {
  Name: 'Gemini',
  IsAvailable: () => !!process.env.GEMINI_API_KEY,
  async *GenerateStream(System, Messages, debug) {
    const Client = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    });

    const Stream = await Client.chat.completions.create({
      model: 'gemini-2.0-flash-lite',
      messages: [{ role: 'system', content: System }, ...Messages],
      stream: true,
      stream_options: { include_usage: true },
      max_tokens: 512,
    });

    for await (const Chunk of Stream) {
      const Text = Chunk.choices[0]?.delta?.content;
      if (Text) yield Text;
      if (Chunk.usage) {
        debug.inputTokens = Chunk.usage.prompt_tokens ?? 0;
        debug.outputTokens = Chunk.usage.completion_tokens ?? 0;
      }
    }
  },
};

// ─── OpenAI ──────────────────────────────────────────────────────────────────

/** OpenAI provider — third in fallback chain. */
const OpenAIProvider: IAIProvider = {
  Name: 'OpenAI',
  IsAvailable: () => !!process.env.OPENAI_API_KEY,
  async *GenerateStream(System, Messages, debug) {
    const Client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const Stream = await Client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: System }, ...Messages],
      stream: true,
      stream_options: { include_usage: true },
      max_tokens: 512,
    });

    for await (const Chunk of Stream) {
      const Text = Chunk.choices[0]?.delta?.content;
      if (Text) yield Text;
      if (Chunk.usage) {
        debug.inputTokens = Chunk.usage.prompt_tokens ?? 0;
        debug.outputTokens = Chunk.usage.completion_tokens ?? 0;
      }
    }
  },
};

// ─── Anthropic ───────────────────────────────────────────────────────────────

/** Anthropic Claude provider — last resort fallback. */
const AnthropicProvider: IAIProvider = {
  Name: 'Anthropic',
  IsAvailable: () => !!process.env.ANTHROPIC_API_KEY,
  async *GenerateStream(System, Messages, debug) {
    const Client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const Stream = await Client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: System,
      messages: Messages,
      stream: true,
    });

    for await (const Event of Stream) {
      if (Event.type === 'content_block_delta' && Event.delta.type === 'text_delta') {
        yield Event.delta.text;
      }
      if (Event.type === 'message_delta' && Event.usage) {
        debug.outputTokens = Event.usage.output_tokens ?? 0;
      }
      if (Event.type === 'message_start' && Event.message.usage) {
        debug.inputTokens = Event.message.usage.input_tokens ?? 0;
      }
    }
  },
};

// ─── Provider registry — change order here to change fallback priority ────────

/** Ordered list of providers. First available provider wins; others are fallbacks. */
const PROVIDERS: IAIProvider[] = [
  OpenRouterProvider,
  GeminiProvider,
  OpenAIProvider,
  AnthropicProvider,
];

// ─── Main export: tries providers in order, falls back on error ───────────────

/**
 * Streams a chat response using the first available AI provider.
 * Falls back to the next provider in the registry on any error.
 * Throws if all providers fail or none are configured.
 *
 * @param System   - System prompt string
 * @param Messages - Conversation history
 * @param onDebug  - Optional callback with provider/token info (called after stream ends)
 */
export async function* StreamChat(
  System: string,
  Messages: ChatMessage[],
  onDebug?: (info: StreamDebugInfo) => void,
): AsyncGenerator<string> {
  const Available = PROVIDERS.filter((P) => P.IsAvailable());

  if (Available.length === 0) {
    throw new Error(
      'No AI provider configured. Set at least one of: OPENROUTER_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY',
    );
  }

  for (const Provider of Available) {
    const debug: DebugTracker = { inputTokens: 0, outputTokens: 0 };
    try {
      yield* Provider.GenerateStream(System, Messages, debug);
      onDebug?.({ provider: Provider.Name, inputTokens: debug.inputTokens, outputTokens: debug.outputTokens });
      return;
    } catch (Err) {
      console.error(`[AI] ${Provider.Name} failed, trying next:`, (Err as Error).message);
    }
  }

  throw new Error('All AI providers failed');
}

/** @deprecated Use StreamChat (PascalCase) for new code. Kept for backward compatibility. */
export const streamChat = StreamChat;

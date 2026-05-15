/**
 * Centralized AI provider system.
 * Fallback order: OpenRouter → Gemini → OpenAI → Anthropic
 * Adding a new provider = add one entry to PROVIDERS array below.
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIProvider {
  name: string;
  isAvailable: () => boolean;
  generateStream: (system: string, messages: ChatMessage[]) => AsyncGenerator<string>;
}

// ─── OpenRouter (OpenAI-compatible, routes to many models) ───────────────────
const openRouterProvider: AIProvider = {
  name: 'OpenRouter',
  isAvailable: () => !!process.env.OPENROUTER_API_KEY,
  async *generateStream(system, messages) {
    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'Zkawi',
      },
    });

    const stream = await client.chat.completions.create({
      model: 'google/gemini-2.0-flash-lite-001',
      messages: [{ role: 'system', content: system }, ...messages],
      stream: true,
      max_tokens: 512,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
  },
};

// ─── Gemini via OpenAI-compatible endpoint ───────────────────────────────────
const geminiProvider: AIProvider = {
  name: 'Gemini',
  isAvailable: () => !!process.env.GEMINI_API_KEY,
  async *generateStream(system, messages) {
    const client = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    });

    const stream = await client.chat.completions.create({
      model: 'gemini-2.0-flash-lite',
      messages: [{ role: 'system', content: system }, ...messages],
      stream: true,
      max_tokens: 512,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
  },
};

// ─── OpenAI ──────────────────────────────────────────────────────────────────
const openAIProvider: AIProvider = {
  name: 'OpenAI',
  isAvailable: () => !!process.env.OPENAI_API_KEY,
  async *generateStream(system, messages) {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: system }, ...messages],
      stream: true,
      max_tokens: 512,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
  },
};

// ─── Anthropic ───────────────────────────────────────────────────────────────
const anthropicProvider: AIProvider = {
  name: 'Anthropic',
  isAvailable: () => !!process.env.ANTHROPIC_API_KEY,
  async *generateStream(system, messages) {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system,
      messages,
      stream: true,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  },
};

// ─── Provider registry — change order here to change fallback priority ────────
const PROVIDERS: AIProvider[] = [
  openRouterProvider,
  geminiProvider,
  openAIProvider,
  anthropicProvider,
];

// ─── Main export: tries providers in order, falls back on error ───────────────
export async function* streamChat(
  system: string,
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const available = PROVIDERS.filter((p) => p.isAvailable());

  if (available.length === 0) {
    throw new Error('No AI provider configured. Set at least one of: OPENROUTER_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY');
  }

  for (const provider of available) {
    try {
      console.log(`[AI] Using ${provider.name}`);
      yield* provider.generateStream(system, messages);
      return;
    } catch (err) {
      console.warn(`[AI] ${provider.name} failed, trying next:`, (err as Error).message);
    }
  }

  throw new Error('All AI providers failed');
}

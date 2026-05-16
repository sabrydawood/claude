/**
 * stream-client.ts
 * Unified client-side streaming wrapper. Two modes:
 *
 * 1. text — raw ReadableStream accumulation (e.g. sandbox chat).
 *    Calls onChunk with the full accumulated string on every read.
 *
 * 2. sse — Server-Sent Events line parsing (e.g. mascot AI chat).
 *    Parses `data: <JSON>` lines and calls onEvent for each, onDone on [DONE].
 *
 * Both modes throw StreamError on non-ok HTTP responses so callers can
 * handle errors uniformly in a catch block.
 */

export class StreamError extends Error {
  constructor(public code: string, public status: number) {
    super(code);
  }
}

type TextStreamOptions = {
  onChunk: (accumulated: string) => void;
  onHeaders?: (headers: Headers) => void;
  signal?: AbortSignal;
};

type SseStreamOptions<T> = {
  onEvent: (event: T) => void;
  onDone?: () => void;
  signal?: AbortSignal;
};

async function postStream(url: string, body: unknown, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({})) as { error?: string; Error?: { Code?: string } };
    const code = data?.Error?.Code ?? data?.error ?? 'STREAM_ERROR';
    throw new StreamError(code, res.status);
  }

  return res;
}

export const streamClient = {
  /**
   * Raw text streaming — accumulates ReadableStream chunks and calls
   * onChunk(accumulated) after every decoded chunk.
   */
  async text(url: string, body: unknown, opts: TextStreamOptions): Promise<void> {
    const res = await postStream(url, body, opts.signal);
    opts.onHeaders?.(res.headers);
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
      opts.onChunk(accumulated);
    }
  },

  /**
   * SSE streaming — parses `data: <JSON>` lines from a ReadableStream,
   * calls onEvent for each parsed chunk, onDone on `[DONE]`.
   */
  async sse<T>(url: string, body: unknown, opts: SseStreamOptions<T>): Promise<void> {
    const res = await postStream(url, body, opts.signal);
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    outer: while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') {
          opts.onDone?.();
          break outer;
        }
        try {
          opts.onEvent(JSON.parse(raw) as T);
        } catch { /* skip malformed chunks */ }
      }
    }
  },
};

/**
 * http-client.ts
 * Unified client-side HTTP wrapper. All API calls outside of streaming
 * (SSE/ReadableStream) should go through this module.
 */

type ApiResponse<T> = { Success: true; Data: T } | { Success: false; Error: { Code: string; Details?: unknown } };

class HttpClientError extends Error {
  constructor(public code: string, public status: number) {
    super(code);
  }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json()) as ApiResponse<T>;

  if (!data.Success) {
    throw new HttpClientError(data.Error.Code, res.status);
  }

  return data.Data;
}

export const http = {
  get: <T>(url: string) => request<T>('GET', url),
  post: <T>(url: string, body?: unknown) => request<T>('POST', url, body ?? {}),
  put: <T>(url: string, body?: unknown) => request<T>('PUT', url, body ?? {}),
  delete: <T>(url: string) => request<T>('DELETE', url),
};

export { HttpClientError };

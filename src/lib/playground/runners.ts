/**
 * runners.ts
 * Code execution helpers for the Code Playground component.
 * JavaScript runs in a sandboxed iframe; Python runs via Pyodide WebAssembly.
 */

export interface RunResult {
  output: string;
  error?: string;
}

// ─── JavaScript runner — sandboxed iframe ─────────────────────────────────────

export function runJS(code: string, timeoutMs = 5000): Promise<RunResult> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const timeout = setTimeout(() => {
      document.body.removeChild(iframe);
      resolve({ output: '', error: 'TIMEOUT' });
    }, timeoutMs);

    const handler = (e: MessageEvent) => {
      if (e.source !== iframe.contentWindow) return;
      clearTimeout(timeout);
      window.removeEventListener('message', handler);
      document.body.removeChild(iframe);
      resolve(e.data as RunResult);
    };
    window.addEventListener('message', handler);

    const html = `<script>
      const logs = [];
      const origLog = console.log;
      console.log = (...a) => { logs.push(a.map(String).join(' ')); };
      try {
        ${code}
        parent.postMessage({ output: logs.join('\\n') }, '*');
      } catch(e) {
        parent.postMessage({ output: logs.join('\\n'), error: e.message }, '*');
      }
    <\/script>`;
    iframe.srcdoc = html;
  });
}

// ─── Python runner — Pyodide WebAssembly ──────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodideInstance: any = null;

export async function loadPyodide(): Promise<unknown> {
  if (pyodideInstance) return pyodideInstance;

  await new Promise<void>((res, rej) => {
    if (typeof window === 'undefined') return rej(new Error('Not in browser'));
    const existing = document.querySelector('script[data-pyodide]');
    if (existing) {
      // Already injected — wait for global to appear
      const poll = setInterval(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).loadPyodide) { clearInterval(poll); res(); }
      }, 100);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js';
    script.setAttribute('data-pyodide', 'true');
    script.onload = () => res();
    script.onerror = () => rej(new Error('LOAD_PYODIDE_ERROR'));
    document.head.appendChild(script);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pyodideInstance = await (window as any).loadPyodide();
  return pyodideInstance;
}

export async function runPython(code: string): Promise<RunResult> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pyodide = await loadPyodide() as any;

    await pyodide.runPythonAsync(`
import sys
from io import StringIO
_stdout = StringIO()
sys.stdout = _stdout
`);

    await pyodide.runPythonAsync(code);
    const output = await pyodide.runPythonAsync('_stdout.getvalue()');
    return { output: String(output) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === 'LOAD_PYODIDE_ERROR') {
      return { output: '', error: 'LOAD_PYODIDE_ERROR' };
    }
    return { output: '', error: msg };
  }
}

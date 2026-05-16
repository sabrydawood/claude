"use client";

/**
 * code-playground.tsx
 * Interactive code editor with sandboxed JS execution (iframe) and Python (Pyodide).
 * UI strings come from the 'playground' i18n namespace — no hardcoded text.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import dynamic from "next/dynamic";
import { Play, RotateCcw, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDir } from "@/lib/i18n/locale-utils";
import { runJS, runPython } from "@/lib/playground/runners";
import type { Extension } from "@codemirror/state";

// Lazy-load CodeMirror to avoid SSR issues and reduce initial bundle
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
});

export interface CodePlaygroundProps {
  starterCode: string;
  language: "javascript" | "python";
  expectedOutput?: string;
  testCases?: { input: string; expected: string }[];
  hint?: string;
  onPass?: (code: string) => void;
  readOnly?: boolean;
}

type RunState = "idle" | "running" | "loading-python";
type Verdict = "none" | "pass" | "fail";

export default function CodePlayground({
  starterCode,
  language,
  expectedOutput,
  hint,
  onPass,
  readOnly = false,
}: CodePlaygroundProps) {
  const t = useTranslations("playground");
  const locale = useLocale();
  const dir = getDir(locale);

  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [runState, setRunState] = useState<RunState>("idle");
  const [verdict, setVerdict] = useState<Verdict>("none");
  const [hintOpen, setHintOpen] = useState(false);

  // Extensions are loaded lazily to avoid SSR
  const extensionsRef = useRef<Extension[] | null>(null);

  const getExtensions = useCallback(async (): Promise<Extension[]> => {
    if (extensionsRef.current) return extensionsRef.current;
    if (language === "javascript") {
      const { javascript } = await import("@codemirror/lang-javascript");
      extensionsRef.current = [javascript()];
    } else {
      const { python } = await import("@codemirror/lang-python");
      extensionsRef.current = [python()];
    }
    return extensionsRef.current;
  }, [language]);

  // Pre-load extensions on mount (fire-and-forget)
  useEffect(() => {
    getExtensions();
  }, [getExtensions]);

  const handleRun = useCallback(async () => {
    if (runState !== "idle") return;

    setVerdict("none");
    setErrorMsg("");

    if (language === "python") {
      setRunState("loading-python");
    } else {
      setRunState("running");
    }

    try {
      const result =
        language === "javascript" ? await runJS(code) : await runPython(code);

      const rawOutput = result.output ?? "";
      setOutput(rawOutput);

      if (result.error) {
        if (result.error === "TIMEOUT") {
          setErrorMsg(t("timeoutError"));
        } else if (result.error === "LOAD_PYODIDE_ERROR") {
          setErrorMsg(t("loadPyodideError"));
        } else {
          setErrorMsg(result.error);
        }
        setVerdict("none");
      } else if (expectedOutput !== undefined) {
        const passed = rawOutput.trim() === expectedOutput.trim();
        setVerdict(passed ? "pass" : "fail");
        if (passed) onPass?.(code);
      }
    } finally {
      setRunState("idle");
    }
  }, [runState, language, code, expectedOutput, onPass, t]);

  const handleReset = useCallback(() => {
    setCode(starterCode);
    setOutput("");
    setErrorMsg("");
    setVerdict("none");
    setRunState("idle");
  }, [starterCode]);

  const languageLabel =
    language === "javascript" ? t("javascript") : t("python");
  const languageDot =
    language === "javascript" ? "bg-yellow-400" : "bg-blue-400";
  const isRunning = runState !== "idle";

  return (
    <div
      dir={dir}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden flex flex-col"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="flex items-center gap-2">
          <span
            className={cn("inline-block w-3 h-3 rounded-full", languageDot)}
          />
          <span className="text-sm font-semibold text-[var(--fg)]">
            {languageLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={isRunning || readOnly}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl border border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--zkawi-pink)] hover:text-[var(--zkawi-pink)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={t("reset")}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t("reset")}</span>
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning || readOnly}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-xl bg-[var(--zkawi-pink)] text-white hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label={t("runCode")}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>
                  {runState === "loading-python"
                    ? t("loadingPython")
                    : t("running")}
                </span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{t("runCode")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor — always LTR regardless of locale */}
      <div dir="ltr" className="min-h-[200px]">
        <CodeMirrorEditor
          code={code}
          onChange={setCode}
          language={language}
          readOnly={readOnly}
          getExtensions={getExtensions}
        />
      </div>

      {/* Output panel */}
      <div className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-3 min-h-[80px]">
        <p className="text-xs font-semibold text-[var(--fg-muted)] mb-1">
          {t("output")}
        </p>

        {runState !== "idle" && !output && !errorMsg && (
          <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>
              {runState === "loading-python"
                ? t("loadingPython")
                : t("running")}
            </span>
          </div>
        )}

        {errorMsg && (
          <p className="text-sm text-red-400 whitespace-pre-wrap font-mono">
            <span className="font-bold">{t("errorLabel")} </span>
            {errorMsg}
          </p>
        )}

        {output && !errorMsg && (
          <pre
            className="text-sm text-[var(--fg)] whitespace-pre-wrap font-mono"
            dir="ltr"
          >
            {output}
          </pre>
        )}

        {/* Verdict */}
        {verdict !== "none" && (
          <div
            className={cn(
              "mt-2 flex items-center gap-1.5 text-sm font-bold",
              verdict === "pass" ? "text-[var(--zkawi-green)]" : "text-red-400",
            )}
          >
            <span>{verdict === "pass" ? "✅" : "❌"}</span>
            <span>{verdict === "pass" ? t("pass") : t("fail")}</span>
          </div>
        )}
      </div>

      {/* Hint section */}
      {hint && (
        <div className="border-t border-[var(--border)]">
          <button
            onClick={() => setHintOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
          >
            <span>💡</span>
            <span className="font-semibold">{t("hint")}</span>
            <span className="text-xs text-[var(--fg-muted)]">
              {hintOpen ? t("hideHint") : t("showHint")}
            </span>
            {hintOpen ? (
              <ChevronUp className="w-3.5 h-3.5 ms-auto" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ms-auto" />
            )}
          </button>
          {hintOpen && (
            <div className="px-4 py-3 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/10">
              {hint}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Inner editor component — isolates the dynamic import ─────────────────────

interface EditorProps {
  code: string;
  onChange: (v: string) => void;
  language: "javascript" | "python";
  readOnly: boolean;
  getExtensions: () => Promise<Extension[]>;
}

function CodeMirrorEditor({
  code,
  onChange,
  language,
  readOnly,
  getExtensions,
}: EditorProps) {
  const [extensions, setExtensions] = useState<Extension[]>([]);

  // Load extensions once on mount
  useEffect(() => {
    getExtensions()
      .then(setExtensions)
      .catch(() => {});
  }, [getExtensions]);

  return (
    <CodeMirror
      value={code}
      onChange={readOnly ? undefined : onChange}
      extensions={extensions}
      theme="dark"
      height="200px"
      readOnly={readOnly}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        dropCursor: false,
        allowMultipleSelections: false,
        indentOnInput: true,
        tabSize: language === "python" ? 4 : 2,
      }}
      className="text-sm [&_.cm-editor]:bg-[#1e1e2e] [&_.cm-gutters]:bg-[#1a1a2a] [&_.cm-gutters]:border-e-[var(--border)]"
    />
  );
}

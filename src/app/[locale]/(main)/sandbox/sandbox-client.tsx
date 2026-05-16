"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "@/lib/i18n/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Send,
  Key,
  Trash2,
  Bot,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { KeysService } from "@/lib/api/services/keys.service";
import { HttpClientError } from "@/lib/api/http-client";
import { streamClient } from "@/lib/api/stream-client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function SandboxClient({
  initialHint,
}: {
  initialHint: string | null;
}) {
  const t = useTranslations("sandbox");
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [hint, setHint] = useState<string | null>(initialHint);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [keySaving, setKeySaving] = useState(false);
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function saveKey() {
    setKeyError("");
    setKeySaving(true);
    try {
      const data = await KeysService.saveKey(keyInput);
      setHint(data.Hint);
      setKeyInput("");
      setShowKeyForm(false);
    } catch (err) {
      setKeyError(err instanceof HttpClientError ? err.code : "خطأ");
    } finally {
      setKeySaving(false);
    }
  }

  async function deleteKey() {
    await KeysService.deleteKey();
    setHint(null);
  }

  async function sendMessage() {
    if (!input.trim() || streaming) return;
    if (!hint) {
      setError(t("noKeyError"));
      return;
    }

    setError("");
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      await streamClient.text(
        "/api/v1/sandbox",
        { messages: newMessages },
        {
          onChunk: (accumulated) => {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: accumulated,
              };
              return updated;
            });
          },
        },
      );
    } catch {
      setMessages((prev) => prev.slice(0, -1));
      setError(t("connectionError"));
    } finally {
      setStreaming(false);
    }
  }

  if (isPending) return null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              {t("title")}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {t("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hint ? (
              <>
                <span
                  className="text-xs px-2 py-1 rounded-full font-mono"
                  style={{
                    background: "var(--surface)",
                    color: "var(--text-muted)",
                  }}
                >
                  {hint}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeyForm(true)}
                >
                  <Key size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={deleteKey}>
                  <Trash2 size={14} />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowKeyForm(true)}
                style={{ background: "var(--zkawi-pink)", color: "#fff" }}
              >
                <Key size={14} className="me-1" />
                {t("addKey")}
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showKeyForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card
                className="p-4 flex flex-col gap-3"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text)" }}
                >
                  {t("keyLabel")}
                </p>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full rounded-lg px-3 py-2 text-sm font-mono outline-none"
                  style={{
                    background: "var(--bg)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && saveKey()}
                />
                {keyError && <p className="text-xs text-red-500">{keyError}</p>}
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowKeyForm(false);
                      setKeyError("");
                    }}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveKey}
                    disabled={keySaving}
                    style={{ background: "var(--zkawi-pink)", color: "#fff" }}
                  >
                    {keySaving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      t("save")
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Card
          className="flex-1 flex flex-col"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            minHeight: "400px",
          }}
        >
          <div
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
            style={{ maxHeight: "60vh" }}
          >
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-[var(--zkawi-pink)]"
                  style={{ background: "var(--bg)" }}
                >
                  <Bot size={32} />
                </div>
                <p className="font-medium" style={{ color: "var(--text)" }}>
                  {t("greeting")}
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {t("greetingSubtitle")}
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      msg.role === "user" ? "var(--zkawi-pink)" : "var(--bg)",
                  }}
                >
                  {msg.role === "user" ? (
                    <User size={14} color="#fff" />
                  ) : (
                    <Bot size={14} style={{ color: "var(--zkawi-pink)" }} />
                  )}
                </div>
                <div
                  className="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap"
                  style={{
                    background:
                      msg.role === "user" ? "var(--zkawi-pink)" : "var(--bg)",
                    color: msg.role === "user" ? "#fff" : "var(--text)",
                  }}
                >
                  {msg.content}
                  {msg.role === "assistant" &&
                    streaming &&
                    i === messages.length - 1 && (
                      <span
                        className="inline-block w-1.5 h-4 ms-0.5 align-text-bottom animate-pulse"
                        style={{ background: "var(--zkawi-pink)" }}
                      />
                    )}
                </div>
              </motion.div>
            ))}

            <div ref={bottomRef} />
          </div>

          {error && (
            <div className="mx-4 mb-2 flex items-center gap-2 text-xs text-red-500">
              <AlertCircle size={12} />
              {error}
            </div>
          )}

          <div
            className="p-4 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={t("placeholder")}
                disabled={streaming}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--bg)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
              />
              <Button
                onClick={sendMessage}
                disabled={streaming || !input.trim()}
                className="rounded-xl px-4"
                style={{ background: "var(--zkawi-pink)", color: "#fff" }}
              >
                {streaming ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

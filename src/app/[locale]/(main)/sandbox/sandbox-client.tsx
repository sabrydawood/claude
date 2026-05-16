"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "@/lib/i18n/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Send, Key, Trash2, Bot, User, Loader2, AlertCircle, Globe,
  Plus, MessageSquare, ChevronLeft,
} from "lucide-react";
import { KeysService } from "@/lib/api/services/keys.service";
import { HttpClientError, http } from "@/lib/api/http-client";
import { streamClient, StreamError } from "@/lib/api/stream-client";
import type { TProvider } from "@/Features/Keys/Keys.Schemas";
import { PROVIDER_VALUES } from "@/Features/Keys/Keys.Schemas";
import type { IConversationListItem, IConversationMessage } from "@/Features/Conversations/Conversations.Types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const KEY_PLACEHOLDERS: Record<TProvider, string> = {
  anthropic:  "sk-ant-...",
  openai:     "sk-proj-... or sk-...",
  gemini:     "AIza...",
  openrouter: "sk-or-v1-...",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString();
}

function groupByDate(convs: IConversationListItem[]) {
  const groups: Record<string, IConversationListItem[]> = {};
  for (const c of convs) {
    const label = formatDate(c.UpdatedAt);
    (groups[label] ??= []).push(c);
  }
  return groups;
}

export default function SandboxClient({
  initialHint,
  initialProvider,
  initialConversations,
  initialConversationId,
  initialMessages,
}: {
  initialHint:           string | null;
  initialProvider:       string | null;
  initialConversations:  IConversationListItem[];
  initialConversationId: string | null;
  initialMessages:       IConversationMessage[];
}) {
  const t = useTranslations("sandbox");
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Key state
  const [hint, setHint]                       = useState(initialHint);
  const [provider, setProvider]               = useState(initialProvider);
  const [selectedProvider, setSelectedProvider] = useState<TProvider>("anthropic");
  const [keyInput, setKeyInput]               = useState("");
  const [keyError, setKeyError]               = useState("");
  const [keySaving, setKeySaving]             = useState(false);
  const [showKeyForm, setShowKeyForm]         = useState(false);

  // Conversation state
  const [conversations, setConversations]       = useState(initialConversations);
  const [currentConvId, setCurrentConvId]       = useState<string | null>(initialConversationId);
  const [messages, setMessages]                 = useState<Message[]>(
    initialMessages.map((m) => ({ role: m.Role as Message['role'], content: m.Content })),
  );
  const [loadingMessages, setLoadingMessages]   = useState(false);

  // Chat state
  const [input, setInput]         = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError]         = useState("");
  const [keyFailed, setKeyFailed] = useState(false);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!isPending && !session) router.push("/login"); }, [session, isPending, router]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streaming]);

  // ── Key management ────────────────────────────────────────────────────────

  async function saveKey() {
    setKeyError("");
    setKeySaving(true);
    try {
      const data = await KeysService.saveKey(keyInput, selectedProvider);
      setHint(data.Hint);
      setProvider(data.Provider);
      setKeyInput("");
      setShowKeyForm(false);
      setKeyFailed(false);
    } catch (err) {
      setKeyError(err instanceof HttpClientError ? err.code : "خطأ");
    } finally {
      setKeySaving(false);
    }
  }

  async function deleteKey() {
    await KeysService.deleteKey();
    setHint(null);
    setProvider(null);
    setKeyFailed(false);
  }

  // ── Conversation management ───────────────────────────────────────────────

  const refreshConversations = useCallback(async () => {
    try {
      const data = await http.get<IConversationListItem[]>("/api/v1/conversations");
      setConversations(data);
    } catch { /* ignore */ }
  }, []);

  async function startNewChat() {
    setCurrentConvId(null);
    setMessages([]);
    setError("");
    setKeyFailed(false);
  }

  async function loadConversation(convId: string) {
    if (convId === currentConvId) return;
    setLoadingMessages(true);
    setCurrentConvId(convId);
    try {
      const data = await http.get<{ Messages: IConversationMessage[] }>(`/api/v1/conversations/${convId}`);
      setMessages(data.Messages.map((m) => ({ role: m.Role as Message['role'], content: m.Content })));
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function deleteConversation(convId: string, e: React.MouseEvent) {
    e.stopPropagation();
    await http.delete(`/api/v1/conversations/${convId}`).catch(() => {});
    setConversations((prev) => prev.filter((c) => c.Id !== convId));
    if (currentConvId === convId) {
      setCurrentConvId(null);
      setMessages([]);
    }
  }

  // ── Chat ─────────────────────────────────────────────────────────────────

  async function sendMessage() {
    if (!input.trim() || streaming) return;

    setError("");
    setKeyFailed(false);
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    let receivedConvId = currentConvId;

    try {
      await streamClient.text(
        "/api/v1/sandbox",
        { Messages: newMessages, ConversationId: currentConvId ?? undefined },
        {
          onHeaders: (headers) => {
            const id = headers.get("X-Conversation-Id");
            if (id) {
              receivedConvId = id;
              setCurrentConvId(id);
              // Optimistically add new conversation to sidebar
              if (!currentConvId) {
                const tempConv: IConversationListItem = {
                  Id: id,
                  Title: userMsg.content.slice(0, 50),
                  UpdatedAt: new Date().toISOString(),
                };
                setConversations((prev) => [tempConv, ...prev]);
              } else {
                setConversations((prev) =>
                  prev.map((c) => c.Id === id ? { ...c, UpdatedAt: new Date().toISOString() } : c)
                );
              }
            }
          },
          onChunk: (accumulated) => {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: accumulated };
              return updated;
            });
          },
        },
      );
      // Refresh sidebar to get AI-generated title
      if (receivedConvId) setTimeout(refreshConversations, 3_000);
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      if (err instanceof StreamError && err.code === "USER_KEY_FAILED") {
        setKeyFailed(true);
      } else {
        setError(t("connectionError"));
      }
    } finally {
      setStreaming(false);
    }
  }

  if (isPending) return null;

  const providerLabel = provider ? t(`providers.${provider}`) : null;
  const groups = groupByDate(conversations);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <Header />

      <main className="flex-1 flex overflow-hidden" style={{ maxHeight: "calc(100vh - 120px)" }}>
        {/* ── Sidebar ── */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-shrink-0 overflow-hidden border-e"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="p-3 flex flex-col gap-2 flex-1 overflow-hidden">
                <Button
                  size="sm"
                  onClick={startNewChat}
                  className="w-full justify-start gap-2"
                  style={{ background: "var(--zkawi-pink)", color: "#fff" }}
                >
                  <Plus size={14} />
                  {t("newChat")}
                </Button>

                <div className="flex-1 overflow-y-auto flex flex-col gap-4 mt-1">
                  {conversations.length === 0 ? (
                    <p className="text-xs text-center mt-8" style={{ color: "var(--text-muted)" }}>
                      {t("noConversations")}
                    </p>
                  ) : (
                    Object.entries(groups).map(([label, items]) => (
                      <div key={label}>
                        <p className="text-xs font-semibold mb-1 px-1" style={{ color: "var(--text-muted)" }}>
                          {label}
                        </p>
                        <div className="flex flex-col gap-0.5">
                          {items.map((conv) => (
                            <button
                              key={conv.Id}
                              onClick={() => loadConversation(conv.Id)}
                              className="w-full text-start flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors group"
                              style={{
                                background: currentConvId === conv.Id ? "rgba(124,58,237,0.15)" : "transparent",
                                color: currentConvId === conv.Id ? "#C4B5FD" : "var(--text-muted)",
                              }}
                            >
                              <MessageSquare size={11} className="flex-shrink-0" />
                              <span className="flex-1 truncate">
                                {conv.Title ?? t("newChat")}
                              </span>
                              <button
                                onClick={(e) => deleteConversation(conv.Id, e)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 transition-all"
                                title={t("deleteConversation")}
                              >
                                <Trash2 size={10} />
                              </button>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Main chat area ── */}
        <div className="flex-1 flex flex-col overflow-hidden px-4 py-6 gap-4">
          {/* Header row */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                <ChevronLeft size={16} style={{ transform: sidebarOpen ? "none" : "rotate(180deg)" }} />
              </button>
              <div>
                <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>{t("title")}</h1>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t("subtitle")}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hint ? (
                <>
                  {providerLabel && (
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "var(--surface)", color: "var(--text-muted)" }}>
                      {providerLabel}
                    </span>
                  )}
                  <span className="text-xs px-2 py-1 rounded-full font-mono" style={{ background: "var(--surface)", color: "var(--text-muted)" }}>
                    {hint}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setShowKeyForm(true)}><Key size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={deleteKey}><Trash2 size={14} /></Button>
                </>
              ) : (
                <>
                  <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1" style={{ background: "var(--surface)", color: "var(--text-muted)" }}>
                    <Globe size={11} />{t("systemMode")}
                  </span>
                  <Button size="sm" onClick={() => setShowKeyForm(true)} style={{ background: "var(--zkawi-pink)", color: "#fff" }}>
                    <Key size={14} className="me-1" />{t("addKey")}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Key form */}
          <AnimatePresence>
            {showKeyForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card className="p-4 flex flex-col gap-3 flex-shrink-0" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{t("keyLabel")}</p>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs" style={{ color: "var(--text-muted)" }}>{t("providerLabel")}</label>
                    <select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value as TProvider)}
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                      style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)" }}
                    >
                      {PROVIDER_VALUES.map((p) => (
                        <option key={p} value={p}>{t(`providers.${p}`)}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder={KEY_PLACEHOLDERS[selectedProvider]}
                    className="w-full rounded-lg px-3 py-2 text-sm font-mono outline-none"
                    style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)" }}
                    onKeyDown={(e) => e.key === "Enter" && saveKey()}
                  />
                  {keyError && <p className="text-xs text-red-500">{keyError}</p>}
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => { setShowKeyForm(false); setKeyError(""); }}>{t("cancel")}</Button>
                    <Button size="sm" onClick={saveKey} disabled={keySaving} style={{ background: "var(--zkawi-pink)", color: "#fff" }}>
                      {keySaving ? <Loader2 size={14} className="animate-spin" /> : t("save")}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat card */}
          <Card className="flex-1 flex flex-col min-h-0" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {loadingMessages ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin" style={{ color: "var(--zkawi-pink)" }} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--bg)", color: "var(--zkawi-pink)" }}>
                    <Bot size={32} />
                  </div>
                  <p className="font-medium" style={{ color: "var(--text)" }}>{t("greeting")}</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("greetingSubtitle")}</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: msg.role === "user" ? "var(--zkawi-pink)" : "var(--bg)" }}
                    >
                      {msg.role === "user"
                        ? <User size={14} color="#fff" />
                        : <Bot size={14} style={{ color: "var(--zkawi-pink)" }} />}
                    </div>
                    <div
                      className="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap"
                      style={{
                        background: msg.role === "user" ? "var(--zkawi-pink)" : "var(--bg)",
                        color: msg.role === "user" ? "#fff" : "var(--text)",
                      }}
                    >
                      {msg.content}
                      {msg.role === "assistant" && streaming && i === messages.length - 1 && (
                        <span className="inline-block w-1.5 h-4 ms-0.5 align-text-bottom animate-pulse" style={{ background: "var(--zkawi-pink)" }} />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Key-failed banner */}
            <AnimatePresence>
              {keyFailed && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  className="mx-4 mb-2 p-3 rounded-xl flex items-start gap-3"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
                >
                  <AlertCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-500 font-medium flex-1">{t("userKeyFailed")}</p>
                  <button onClick={deleteKey} className="text-xs underline text-red-400 whitespace-nowrap flex-shrink-0">
                    {t("deleteKeyToRecover")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="mx-4 mb-2 flex items-center gap-2 text-xs text-red-500">
                <AlertCircle size={12} />{error}
              </div>
            )}

            <div className="p-4 border-t flex-shrink-0" style={{ borderColor: "var(--border)" }}>
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={t("placeholder")}
                  disabled={streaming}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)" }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={streaming || !input.trim()}
                  className="rounded-xl px-4"
                  style={{ background: "var(--zkawi-pink)", color: "#fff" }}
                >
                  {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

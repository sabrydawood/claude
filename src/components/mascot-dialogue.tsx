'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { getDir, isRTL } from '@/lib/i18n/locale-utils';
import { X, Send, Loader2, RotateCcw } from 'lucide-react';
import { streamClient } from '@/lib/api/stream-client';
import { ZakiPortrait } from '@/components/mascot-3d';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DebugInfo {
  provider: string;
  inputTokens: number;
  outputTokens: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
  debug?: DebugInfo;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

// ─── localStorage helpers ────────────────────────────────────────────────────

function chatKey(pathname: string) {
  return `zkawi_chat_${encodeURIComponent(pathname)}`;
}

function loadChatHistory(pathname: string): Message[] {
  try {
    const raw = localStorage.getItem(chatKey(pathname));
    return raw ? (JSON.parse(raw) as Message[]) : [];
  } catch {
    return [];
  }
}

function saveChatHistory(pathname: string, messages: Message[]) {
  try {
    const toSave = messages.filter((m) => !m.streaming).slice(-20);
    if (toSave.length > 0) {
      localStorage.setItem(chatKey(pathname), JSON.stringify(toSave));
    }
  } catch {
    /* ignore quota errors */
  }
}

// ─── Typing indicator ────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex gap-1 items-center py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: '#7C3AED' }}
          animate={{ y: [0, -5, 0] }}
          transition={{
            repeat: Infinity,
            duration: 0.7,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Main RPG dialogue component ─────────────────────────────────────────────

export function MascotDialogue({ isOpen, onClose, locale }: Props) {
  const pathname = usePathname();
  const t = useTranslations('mascot');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pathnameRef = useRef(pathname);
  const dir = getDir(locale);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // ── Core streaming function ────────────────────────────────────────────────

  const streamResponse = useCallback(
    async (history: Message[], isGreeting = false) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsStreaming(true);

      // Add placeholder assistant message
      setMessages((prev) => [
        ...(isGreeting ? [] : prev),
        ...(isGreeting ? history.slice(0, -1) : []),
        { role: 'assistant', content: '', streaming: true },
      ]);

      try {
        await streamClient.sse<{
          text?: string;
          error?: string;
          debug?: DebugInfo;
        }>(
          '/api/v1/mascot',
          { Messages: history, Pathname: pathname, Locale: locale },
          {
            signal: controller.signal,
            onEvent: (event) => {
              if (event.text) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.role === 'assistant') {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + event.text,
                      streaming: true,
                    };
                  }
                  return updated;
                });
              }
              if (event.debug) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.role === 'assistant') {
                    updated[updated.length - 1] = {
                      ...last,
                      debug: event.debug,
                    };
                  }
                  return updated;
                });
              }
            },
          },
        );
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === 'assistant' && last.streaming) {
              updated[updated.length - 1] = {
                ...last,
                content: last.content || t('errorMsg'),
              };
            }
            return updated;
          });
        }
      } finally {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = { ...last, streaming: false };
          }
          return updated;
        });
        setIsStreaming(false);
      }
    },
    [pathname, locale, t],
  );

  // ── Proactive greeting on first open ──────────────────────────────────────

  useEffect(() => {
    if (isOpen && !initialized && messages.length === 0) {
      setInitialized(true);
      streamResponse(
        [
          {
            role: 'user',
            content:
              locale === 'ar'
                ? 'قدّم نفسك وقول إيه اللي تقدر تساعدني بيه في الصفحة دي.'
                : 'Introduce yourself and tell me how you can help me on this page.',
          },
        ],
        true,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialized]);

  // ── Platform event listeners ───────────────────────────────────────────────

  useEffect(() => {
    const onLessonStart = (e: Event) => {
      const { lessonTitle } =
        (e as CustomEvent<{ lessonTitle: string }>).detail ?? {};
      if (isStreaming) return;
      const prompt =
        locale === 'ar'
          ? `المستخدم بدأ درس "${lessonTitle}". شجّعه ببضع كلمات وادّيله نصيحة واحدة عشان يستفيد من الدرس.`
          : `The user just started the lesson "${lessonTitle}". Give a short encouraging message and one tip to get the most from it.`;
      const newHistory: Message[] = [
        ...messages,
        { role: 'user', content: prompt },
      ];
      streamResponse(newHistory, true);
    };

    const onQuizComplete = (e: Event) => {
      const { score, xpEarned } =
        (e as CustomEvent<{ score: number; xpEarned: number }>).detail ?? {};
      if (isStreaming) return;
      const prompt =
        locale === 'ar'
          ? `المستخدم خلّص الكويز وجاب ${score}% وكسب ${xpEarned} XP. علّق على نتيجته وشجّعه.`
          : `The user just completed the quiz with ${score}% and earned ${xpEarned} XP. Comment briefly on their result.`;
      const newHistory: Message[] = [
        ...messages,
        { role: 'user', content: prompt },
      ];
      streamResponse(newHistory, true);
    };

    /**
     * zkawi:auto_send — external components can trigger an automatic message.
     * Expected detail shape: { message: string }
     */
    const onAutoSend = (e: Event) => {
      const { message } =
        (e as CustomEvent<{ message: string }>).detail ?? {};
      if (!message || isStreaming) return;
      const userMsg: Message = { role: 'user', content: message };
      const newHistory: Message[] = [
        ...messages.filter((m) => !m.streaming),
        userMsg,
      ];
      setMessages(newHistory);
      streamResponse(
        newHistory.map(({ role, content }) => ({ role, content })),
      );
    };

    window.addEventListener('zkawi:lesson_start', onLessonStart);
    window.addEventListener('zkawi:quiz_complete', onQuizComplete);
    window.addEventListener('zkawi:auto_send', onAutoSend);
    return () => {
      window.removeEventListener('zkawi:lesson_start', onLessonStart);
      window.removeEventListener('zkawi:quiz_complete', onQuizComplete);
      window.removeEventListener('zkawi:auto_send', onAutoSend);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming, messages, locale]);

  // ── Persist chat history (skip streaming messages) ────────────────────────

  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(pathnameRef.current, messages);
    }
  }, [messages]);

  // ── Route change: restore per-page history ────────────────────────────────

  useEffect(() => {
    pathnameRef.current = pathname;
    abortRef.current?.abort();
    const history = loadChatHistory(pathname);
    setMessages(history);
    setInitialized(history.length > 0);
    setInput('');
    setIsStreaming(false);
  }, [pathname]);

  // ── User actions ──────────────────────────────────────────────────────────

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = { role: 'user', content: text };
    const updatedHistory = [...messages.filter((m) => !m.streaming), userMsg];
    setMessages(updatedHistory);
    setInput('');
    streamResponse(
      updatedHistory.map(({ role, content }) => ({ role, content })),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setInitialized(false);
    setIsStreaming(false);
    try {
      localStorage.removeItem(chatKey(pathname));
    } catch {
      /* ignore */
    }
  };

  // ── Mood derived from state ────────────────────────────────────────────────

  const portraitMood = isStreaming ? 'talking' : 'idle';

  // ── Render ────────────────────────────────────────────────────────────────

  const lastAiMsg = [...messages].reverse().find(m => m.role === 'assistant');
  const hasHistory = messages.length > 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mascot-dialogue"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50"
          dir={dir}
          style={{ height: 230 }}
        >
          {/* ── Character portrait — overlaps above the box ── */}
          <div
            className="absolute bottom-0 left-4 z-20 pointer-events-none"
            style={{ width: 150, height: 270 }}
          >
            <ZakiPortrait mood={portraitMood} talking={isStreaming} width={150} height={270} />
          </div>

          {/* ── Dialogue box ── */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: 230,
              background: 'rgba(4, 2, 18, 0.96)',
              backdropFilter: 'blur(28px)',
              borderTop: '2px solid rgba(124, 58, 237, 0.55)',
              boxShadow: '0 -10px 80px rgba(80, 30, 200, 0.3), inset 0 1px 0 rgba(167,139,250,0.08)',
              paddingLeft: 168,
            }}
          >
            <div className="h-full flex flex-col px-5 py-3" dir={dir}>

              {/* ── Character name row ── */}
              <div className="flex items-center gap-3 mb-1 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <span
                    style={{
                      color: '#C4B5FD',
                      fontWeight: 900,
                      fontSize: 12,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    ذكي · Zaki
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {hasHistory && (
                    <button
                      onClick={handleReset}
                      className="p-1 rounded-lg hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
                      title={t('newChat')}
                    >
                      <RotateCcw size={12} color="rgba(196,181,253,0.8)" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
                    aria-label={locale === 'ar' ? 'إغلاق' : 'Close'}
                  >
                    <X size={14} color="rgba(255,255,255,0.8)" />
                  </button>
                </div>
              </div>

              {/* ── Separator ── */}
              <div
                className="mb-2 flex-shrink-0"
                style={{ height: 1, background: 'linear-gradient(90deg, rgba(124,58,237,0.5), transparent)' }}
              />

              {/* ── Message display area ── */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {/* History (collapsed, only user messages shown small) */}
                {hasHistory && (
                  <div className="mb-2 space-y-1">
                    {messages.slice(0, -1).filter(m => m.role === 'user').slice(-2).map((msg, i) => (
                      <p
                        key={i}
                        className="text-xs truncate"
                        style={{ color: 'rgba(196,181,253,0.45)' }}
                      >
                        ↪ {msg.content.slice(0, 80)}{msg.content.length > 80 ? '…' : ''}
                      </p>
                    ))}
                  </div>
                )}

                {/* Latest AI message — RPG dialogue style */}
                {lastAiMsg && (
                  <motion.p
                    key={messages.length}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      color: 'rgba(255,255,255,0.94)',
                      fontSize: 15,
                      lineHeight: 1.65,
                      fontWeight: 400,
                    }}
                  >
                    {lastAiMsg.streaming && lastAiMsg.content === '' ? (
                      <TypingDots />
                    ) : (
                      <>
                        {lastAiMsg.content}
                        {lastAiMsg.streaming && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="inline-block w-px h-4 bg-white/80 ms-0.5 align-middle"
                          />
                        )}
                        {lastAiMsg.debug && (
                          <span
                            className="ms-2 text-[10px]"
                            style={{ color: 'rgba(196,181,253,0.35)' }}
                          >
                            [{lastAiMsg.debug.provider} ↑{lastAiMsg.debug.inputTokens} ↓{lastAiMsg.debug.outputTokens}]
                          </span>
                        )}
                      </>
                    )}
                  </motion.p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── ▼ Continue indicator ── */}
              {!isStreaming && lastAiMsg && !lastAiMsg.streaming && (
                <motion.div
                  className="flex justify-end mb-1 flex-shrink-0"
                  animate={{ y: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  style={{ color: '#A78BFA', fontSize: 11 }}
                >
                  ▼
                </motion.div>
              )}

              {/* ── Input row ── */}
              <div className="flex items-end gap-2 flex-shrink-0" style={{ borderTop: '1px solid rgba(124,58,237,0.2)', paddingTop: 8 }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('placeholder')}
                  rows={1}
                  disabled={isStreaming}
                  className="flex-1 resize-none rounded-lg px-3 py-1.5 text-sm outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(124,58,237,0.3)',
                    color: 'rgba(255,255,255,0.88)',
                    maxHeight: 56,
                    lineHeight: '1.4',
                  }}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                    opacity: !input.trim() || isStreaming ? 0.35 : 1,
                    boxShadow: input.trim() && !isStreaming ? '0 0 14px rgba(124,58,237,0.5)' : 'none',
                  }}
                  aria-label={locale === 'ar' ? 'إرسال' : 'Send'}
                >
                  {isStreaming ? (
                    <Loader2 size={13} color="white" className="animate-spin" />
                  ) : (
                    <Send size={13} color="white" style={{ transform: isRTL(locale) ? 'scaleX(-1)' : undefined }} />
                  )}
                </motion.button>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

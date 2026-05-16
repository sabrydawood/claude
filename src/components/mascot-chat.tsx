'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { getDir, isRTL } from '@/lib/i18n/locale-utils';
import { X, Send, Loader2, MessageCircle, RotateCcw } from 'lucide-react';
import { streamClient } from '@/lib/api/stream-client';

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
}

// Small inline robot avatar for chat bubbles
function ZakiAvatar({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className="flex-shrink-0">
      <rect width="80" height="80" rx="16" fill="url(#chat-grad)" />
      <defs>
        <radialGradient id="chat-grad" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#5B21B6" />
        </radialGradient>
      </defs>
      {/* Eyes */}
      <ellipse cx="28" cy="34" rx="9" ry="9" fill="#93C5FD" />
      <circle cx="30" cy="32" r="3.5" fill="white" opacity="0.9" />
      <circle cx="28" cy="34" r="2.5" fill="#1D4ED8" />
      <ellipse cx="52" cy="34" rx="9" ry="9" fill="#93C5FD" />
      <circle cx="54" cy="32" r="3.5" fill="white" opacity="0.9" />
      <circle cx="52" cy="34" r="2.5" fill="#1D4ED8" />
      {/* Smile */}
      <path d="M31 46 Q40 53 49 46" stroke="rgba(255,255,255,0.85)" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Antenna */}
      <rect x="37" y="8" width="6" height="10" rx="3" fill="#7C3AED" />
      <circle cx="40" cy="8" r="5" fill="#FCD34D" />
    </svg>
  );
}

// Typing dots animation
function TypingDots() {
  return (
    <div className="flex gap-1 items-center py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: 'var(--zkawi-purple)' }}
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export function MascotChat({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('mascot');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  const streamResponse = useCallback(async (history: Message[], isGreeting = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsStreaming(true);

    // Add placeholder assistant message
    setMessages(prev => [
      ...(isGreeting ? [] : prev),
      ...(isGreeting ? history.slice(0, -1) : []), // hide internal greeting prompt
      { role: 'assistant', content: '', streaming: true },
    ]);

    try {
      await streamClient.sse<{ text?: string; error?: string; debug?: DebugInfo }>(
        '/api/v1/mascot',
        { Messages: history, Pathname: pathname, Locale: locale },
        {
          signal: controller.signal,
          onEvent: (event) => {
            if (event.text) {
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === 'assistant') {
                  updated[updated.length - 1] = { ...last, content: last.content + event.text, streaming: true };
                }
                return updated;
              });
            }
            if (event.debug) {
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === 'assistant') {
                  updated[updated.length - 1] = { ...last, debug: event.debug };
                }
                return updated;
              });
            }
          },
        },
      );
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant' && last.streaming) {
            updated[updated.length - 1] = { ...last, content: last.content || t('errorMsg') };
          }
          return updated;
        });
      }
    } finally {
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === 'assistant') {
          updated[updated.length - 1] = { ...last, streaming: false };
        }
        return updated;
      });
      setIsStreaming(false);
    }
  }, [pathname, locale, t]);

  // Send proactive greeting on first open
  useEffect(() => {
    if (isOpen && !initialized && messages.length === 0) {
      setInitialized(true);
      streamResponse([{
        role: 'user',
        content: locale === 'ar'
          ? 'قدّم نفسك وقول إيه اللي تقدر تساعدني بيه في الصفحة دي.'
          : 'Introduce yourself and tell me how you can help me on this page.',
      }], true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialized]);

  // Listen for platform events and proactively respond
  useEffect(() => {
    const onLessonStart = (e: Event) => {
      const { lessonTitle } = (e as CustomEvent<{ lessonTitle: string }>).detail ?? {};
      if (isStreaming) return;
      const prompt = locale === 'ar'
        ? `المستخدم بدأ درس "${lessonTitle}". شجّعه ببضع كلمات وادّيله نصيحة واحدة عشان يستفيد من الدرس.`
        : `The user just started the lesson "${lessonTitle}". Give a short encouraging message and one tip to get the most from it.`;
      const newHistory: Message[] = [...messages, { role: 'user', content: prompt }];
      streamResponse(newHistory, true);
    };

    const onQuizComplete = (e: Event) => {
      const { score, xpEarned } = (e as CustomEvent<{ score: number; xpEarned: number }>).detail ?? {};
      if (isStreaming) return;
      const prompt = locale === 'ar'
        ? `المستخدم خلّص الكويز وجاب ${score}% وكسب ${xpEarned} XP. علّق على نتيجته وشجّعه.`
        : `The user just completed the quiz with ${score}% and earned ${xpEarned} XP. Comment briefly on their result.`;
      const newHistory: Message[] = [...messages, { role: 'user', content: prompt }];
      streamResponse(newHistory, true);
    };

    window.addEventListener('zkawi:lesson_start', onLessonStart);
    window.addEventListener('zkawi:quiz_complete', onQuizComplete);
    return () => {
      window.removeEventListener('zkawi:lesson_start', onLessonStart);
      window.removeEventListener('zkawi:quiz_complete', onQuizComplete);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming, messages, locale]);

  // Reset on route change
  useEffect(() => {
    setMessages([]);
    setInitialized(false);
    setInput('');
  }, [pathname]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = { role: 'user', content: text };
    const updatedHistory = [...messages.filter(m => !m.streaming), userMsg];
    setMessages(updatedHistory);
    setInput('');
    streamResponse(updatedHistory.map(({ role, content }) => ({ role, content })));
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
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mascot-chat"
          initial={{ opacity: 0, y: 20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.92 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className="fixed bottom-24 end-4 z-50 w-80 flex flex-col rounded-3xl overflow-hidden shadow-2xl"
          style={{
            border: '1px solid var(--border)',
            maxHeight: '70vh',
          }}
          dir={getDir(locale)}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6D28D9, #4C1D95)' }}
          >
            <ZakiAvatar size={36} />
            <div className="flex-1 min-w-0">
              <p className="font-black text-white text-sm leading-none">ذكي · Zaki</p>
              <p className="text-purple-200 text-xs mt-0.5">
                {isStreaming
                  ? t('typing')
                  : t('guide')}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                title={t('newChat')}
              >
                <RotateCcw size={14} color="rgba(255,255,255,0.7)" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={16} color="rgba(255,255,255,0.8)" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ background: 'var(--bg)', minHeight: 0 }}
          >
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && <ZakiAvatar size={24} />}

                  <div className="max-w-[78%] flex flex-col gap-1">
                    <div
                      className="rounded-2xl px-3 py-2 text-sm leading-relaxed"
                      style={
                        msg.role === 'user'
                          ? {
                              background: 'var(--zkawi-purple)',
                              color: '#fff',
                              borderEndEndRadius: 4,
                            }
                          : {
                              background: 'var(--surface)',
                              color: 'var(--text)',
                              border: '1px solid var(--border)',
                              borderStartStartRadius: 4,
                            }
                      }
                    >
                      {msg.streaming && msg.content === '' ? (
                        <TypingDots />
                      ) : (
                        <>
                          {msg.content}
                          {msg.streaming && (
                            <motion.span
                              animate={{ opacity: [1, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6 }}
                              className="inline-block w-0.5 h-3.5 bg-current ms-0.5 align-middle"
                            />
                          )}
                        </>
                      )}
                    </div>
                    {msg.role === 'assistant' && msg.debug && (
                      <p className="text-[10px] px-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                        {msg.debug.provider} · ↑{msg.debug.inputTokens} ↓{msg.debug.outputTokens} tokens
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="flex items-end gap-2 px-3 py-3 flex-shrink-0"
            style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder')}
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                maxHeight: 80,
                lineHeight: '1.4',
              }}
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-opacity"
              style={{
                background: 'var(--zkawi-purple)',
                opacity: !input.trim() || isStreaming ? 0.4 : 1,
              }}
            >
              {isStreaming
                ? <Loader2 size={15} color="white" className="animate-spin" />
                : <Send size={15} color="white" style={{ transform: isRTL(locale) ? 'scaleX(-1)' : undefined }} />
              }
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Small trigger button to open chat (used separately from mascot)
export function MascotChatTrigger({ onClick }: { onClick: () => void }) {
  const t = useTranslations('mascot');

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="fixed bottom-6 end-24 z-40 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg font-bold text-sm"
      style={{
        background: 'var(--zkawi-purple)',
        color: '#fff',
        boxShadow: '0 4px 20px rgba(109,40,217,0.4)',
      }}
    >
      <MessageCircle size={15} />
      {t('askZaki')}
    </motion.button>
  );
}

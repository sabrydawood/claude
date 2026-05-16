'use client';
import { useCallback, useRef } from 'react';

export interface VoiceOptions {
  lang?: 'ar' | 'en';
  rate?: number;   // 0.5-2.0, default 0.9 for children
  pitch?: number;  // 0.5-2.0, default 1.1 (slightly higher for children)
}

export function useVoice(options: VoiceOptions = {}) {
  const { lang = 'ar', rate = 0.9, pitch = 1.1 } = options;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, overrideOptions?: Partial<VoiceOptions>) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = (overrideOptions?.lang ?? lang) === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = overrideOptions?.rate ?? rate;
    utterance.pitch = overrideOptions?.pitch ?? pitch;

    // Try to find an Arabic voice
    const voices = window.speechSynthesis.getVoices();
    const targetLang = utterance.lang.split('-')[0];
    const matchingVoice = voices.find(v => v.lang.startsWith(targetLang));
    if (matchingVoice) utterance.voice = matchingVoice;

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [lang, rate, pitch]);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel();
  }, []);

  const isSpeaking = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.speechSynthesis.speaking;
  }, []);

  return { speak, stop, isSpeaking };
}

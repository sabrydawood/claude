'use client';
import { useVoice } from '@/hooks/useVoice';

interface VoiceButtonProps {
  text: string;
  lang?: 'ar' | 'en';
  className?: string;
  children?: React.ReactNode;
}

export default function VoiceButton({ text, lang = 'ar', className = '', children }: VoiceButtonProps) {
  const { speak, stop, isSpeaking } = useVoice({ lang });

  return (
    <button
      type="button"
      onClick={() => isSpeaking() ? stop() : speak(text)}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-all ${
        isSpeaking() ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-500'
      } ${className}`}
      aria-label={lang === 'ar' ? 'استمع' : 'Listen'}
      title={lang === 'ar' ? 'اضغط للاستماع' : 'Click to listen'}
    >
      {children ?? (isSpeaking() ? '🔊' : '🔈')}
    </button>
  );
}

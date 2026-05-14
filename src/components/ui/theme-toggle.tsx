'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      className="
        relative w-9 h-9 rounded-xl flex items-center justify-center
        text-[var(--text-muted)] hover:text-[var(--zkawi-purple)]
        bg-[var(--surface)] border border-[var(--border)]
        hover:border-[var(--zkawi-purple-light)]
        hover:bg-[var(--bg-secondary)]
        transition-all duration-200 hover:scale-105
      "
    >
      {isDark
        ? <Sun size={17} className="text-[var(--zkawi-gold)]" />
        : <Moon size={17} className="text-[var(--zkawi-purple)]" />
      }
    </button>
  );
}

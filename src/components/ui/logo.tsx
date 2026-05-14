'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'icon' | 'white-icon';
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export function Logo({
  variant = 'icon',
  size = 40,
  className,
  showText = false,
  textClassName,
}: LogoProps) {
  const src =
    variant === 'white-icon' ? '/logo-white.svg' : '/logo-icon.svg';

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Image
        src={src}
        alt="ذكاوي"
        width={size}
        height={size}
        priority
        className="shrink-0"
      />
      {showText && (
        <span
          className={cn(
            'font-black tracking-tight leading-none',
            variant === 'white-icon' ? 'text-white' : 'text-purple-700',
            textClassName,
          )}
        >
          ذكاوي
        </span>
      )}
    </span>
  );
}

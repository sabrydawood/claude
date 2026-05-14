import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-[var(--text-muted)]">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-2xl border-2 bg-[var(--input-bg)] px-4 py-3 text-base text-[var(--text)] transition-all duration-200',
            'placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:border-[var(--zkawi-purple)] focus:ring-2 focus:ring-[var(--zkawi-purple)]/10',
            'hover:border-[var(--zkawi-purple-light)]',
            error
              ? 'border-[var(--zkawi-red)] focus:border-[var(--zkawi-red)] focus:ring-[var(--zkawi-red)]/10'
              : 'border-[var(--border)]',
            icon && 'ps-10',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[var(--zkawi-red)]">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };

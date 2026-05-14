import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--zkawi-purple)]/15 text-[var(--zkawi-purple)] border border-[var(--zkawi-purple)]/30',
        secondary: 'bg-[var(--zkawi-gold)]/15 text-[var(--zkawi-gold)] border border-[var(--zkawi-gold)]/30',
        success: 'bg-[var(--zkawi-green)]/15 text-[var(--zkawi-green)] border border-[var(--zkawi-green)]/30',
        danger: 'bg-[var(--zkawi-red)]/15 text-[var(--zkawi-red)] border border-[var(--zkawi-red)]/30',
        info: 'bg-blue-500/15 text-blue-500 border border-blue-500/30',
        xp: 'bg-gradient-to-r from-[var(--zkawi-purple)] to-[var(--zkawi-purple-light)] text-white shadow-sm',
        achievement: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm',
        outline: 'border-2 border-current bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

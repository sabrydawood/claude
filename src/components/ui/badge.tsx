import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-purple-100 text-purple-700 border border-purple-200',
        secondary: 'bg-amber-100 text-amber-700 border border-amber-200',
        success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        danger: 'bg-red-100 text-red-700 border border-red-200',
        info: 'bg-blue-100 text-blue-700 border border-blue-200',
        xp: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm',
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

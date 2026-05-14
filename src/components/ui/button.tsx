'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 btn-press select-none',
  {
    variants: {
      variant: {
        default:
          'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-105 active:scale-95',
        secondary:
          'bg-amber-400 text-amber-900 hover:bg-amber-500 shadow-lg shadow-amber-100 hover:shadow-amber-200 hover:scale-105 active:scale-95',
        outline:
          'border-2 border-purple-600 text-purple-600 hover:bg-purple-50 hover:scale-105 active:scale-95',
        ghost:
          'text-purple-600 hover:bg-purple-50 hover:scale-105 active:scale-95',
        success:
          'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95',
        danger:
          'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-100 hover:scale-105 active:scale-95',
        glass:
          'bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:scale-105 active:scale-95',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        default: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        xl: 'h-16 px-10 text-xl',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

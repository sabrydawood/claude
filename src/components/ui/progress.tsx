'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  showLabel?: boolean;
  colorScheme?: 'purple' | 'amber' | 'green' | 'blue';
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, showLabel, colorScheme = 'purple', ...props }, ref) => {
  const colors = {
    purple: 'bg-gradient-to-r from-purple-500 to-purple-400',
    amber: 'bg-gradient-to-r from-amber-400 to-orange-400',
    green: 'bg-gradient-to-r from-emerald-500 to-green-400',
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-400',
  };

  return (
    <div className="relative w-full">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative h-3 w-full overflow-hidden rounded-full bg-gray-100',
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full w-full flex-1 transition-all duration-700 ease-out rounded-full',
            colors[colorScheme],
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      {showLabel && (
        <span className="absolute -top-6 end-0 text-xs font-bold text-purple-600">
          {Math.round(value || 0)}%
        </span>
      )}
    </div>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

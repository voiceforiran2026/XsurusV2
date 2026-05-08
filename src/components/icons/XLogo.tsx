import * as React from 'react';
import { cn } from '@/lib/utils';

interface XLogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'mono' | 'inverted';
}

const sizeMap = {
  sm: 'h-6 w-6 text-base',
  md: 'h-8 w-8 text-lg',
  lg: 'h-10 w-10 text-xl',
  xl: 'h-14 w-14 text-3xl',
};

export function XLogo({
  size = 'md',
  variant = 'mono',
  className,
  ...props
}: XLogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md font-black leading-none',
        sizeMap[size],
        variant === 'mono'
          ? 'bg-foreground text-background'
          : 'bg-background text-foreground border border-foreground/10',
        className,
      )}
      aria-label="X"
      {...props}
    >
      X
    </span>
  );
}

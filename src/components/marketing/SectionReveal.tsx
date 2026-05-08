import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  y?: number;
}

/**
 * Önceden Framer Motion + IntersectionObserver kullanıyordu — her sayfada
 * 10+ observer + her bölüm için ayrı motion node. CSS-only fade-in yeterli
 * ve tarayıcının composite thread'inde "bedavaya" çalışıyor (main thread
 * bloklanmaz). Marketing sayfasında belirgin hızlanma.
 */
export const SectionReveal = React.forwardRef<HTMLDivElement, SectionRevealProps>(
  ({ children, className, delay = 0, y, style, ...props }, ref) => {
    void y;
    return (
      <div
        ref={ref}
        className={cn('animate-fade-in motion-reduce:animate-none', className)}
        style={{
          animationDelay: delay ? `${delay}s` : undefined,
          animationFillMode: 'both',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);
SectionReveal.displayName = 'SectionReveal';

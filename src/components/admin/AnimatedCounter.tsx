'use client';

import * as React from 'react';
import { useReducedMotion } from 'framer-motion';

interface AnimatedCounterProps {
  to: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

/**
 * Hedef değişimine kadarki değerden hedefe akıcı geçiş yapar.
 * Eski versiyon her `to` değişiminde 0'dan saymaya başlıyordu — bu da
 * polling/refresh'lerde sayaçların sürekli sıfırlanıp tekrar zıplamasına
 * yol açıyordu (havuz panelinde her 4sn'de bir bütün rakamlar 0'dan
 * başlıyordu). Artık küçük değişimler küçük geçiş.
 */
export function AnimatedCounter({
  to,
  duration = 700,
  format = (n) => Math.round(n).toString(),
  className,
}: AnimatedCounterProps) {
  const reduced = useReducedMotion();
  const [value, setValue] = React.useState(to);
  const fromRef = React.useRef(to);

  React.useEffect(() => {
    if (reduced || fromRef.current === to) {
      fromRef.current = to;
      setValue(to);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (to - from) * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, reduced]);

  return <span className={className}>{format(value)}</span>;
}

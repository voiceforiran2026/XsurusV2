import { Award, Users, Clock, MapPin } from 'lucide-react';
import { SectionReveal } from './SectionReveal';
import { cn } from '@/lib/utils';

const STATS = [
  { value: '+10M', label: 'Tamamlanan Yolculuk', icon: Award },
  { value: '+1M', label: 'Mutlu Müşteri', icon: Users },
  { value: '7/24', label: 'Hizmet', icon: Clock },
  { value: '50+', label: 'Şehirde Hizmet', icon: MapPin },
];

export function StatsStrip({
  variant = 'light',
  className,
}: {
  variant?: 'light' | 'dark';
  className?: string;
}) {
  const isDark = variant === 'dark';
  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl border',
        isDark ? 'border-white/10 bg-white/5' : 'border-border bg-border',
        className,
      )}
    >
      {STATS.map((s, i) => (
        <SectionReveal
          key={s.label}
          delay={i * 0.05}
          className={cn(
            'flex items-start gap-3 p-5 md:p-6',
            isDark ? 'bg-canvas text-white' : 'bg-background',
          )}
        >
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full shrink-0',
              isDark ? 'bg-white/10' : 'bg-muted',
            )}
          >
            <s.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div
              className={cn(
                'text-2xl md:text-3xl font-bold tracking-tight',
                isDark ? 'text-white' : 'text-foreground',
              )}
            >
              {s.value}
            </div>
            <div
              className={cn(
                'text-xs',
                isDark ? 'text-white/60' : 'text-muted-foreground',
              )}
            >
              {s.label}
            </div>
          </div>
        </SectionReveal>
      ))}
    </div>
  );
}

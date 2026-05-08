'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { subscribe } from '@/lib/broadcast';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';

interface UnreadBadgeProps {
  initialUnread: number;
  href?: string;
  className?: string;
  iconClassName?: string;
}

/**
 * Kompakt çan ikonu + badge. Server-side initial unread count alır.
 * Client'ta:
 *  - `notification:new` event'i gelirse +1 (kendi userId'sine)
 *  - `notifications:cleared` event'i gelirse 0
 */
export function UnreadBadge({
  initialUnread,
  href = '/yolcu/bildirimler',
  className,
  iconClassName,
}: UnreadBadgeProps) {
  const [count, setCount] = React.useState(initialUnread);
  const userId = useAuthStore((s) => s.user?.id ?? null);

  React.useEffect(() => {
    return subscribe((e) => {
      if (e.type === 'notification:new') {
        // Sadece bu kullanıcı için olan bildirimlerde artır
        if (!userId || e.userId === userId) setCount((c) => c + 1);
      } else if (e.type === 'notifications:cleared') {
        if (!userId || e.userId === userId) setCount(0);
      }
    });
  }, [userId]);

  return (
    <Link
      href={href}
      aria-label={`Bildirimler${count > 0 ? `, ${count} okunmamış` : ''}`}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-full',
        'text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors',
        className,
      )}
    >
      <Bell className={cn('h-4 w-4', iconClassName)} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { broadcast } from '@/lib/broadcast';
import { useAuthStore } from '@/stores/useAuthStore';

export function MarkAllReadButton() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const [pending, setPending] = React.useState(false);

  const handleClick = async () => {
    setPending(true);
    try {
      const res = await fetch('/api/me/notifications', { method: 'POST' });
      if (res.ok && userId) {
        // UnreadBadge'in (kendi sekmesi + diğer sekmeler) sıfırlanması için broadcast
        broadcast({ type: 'notifications:cleared', userId });
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} disabled={pending}>
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
      Tümünü Okundu
    </Button>
  );
}

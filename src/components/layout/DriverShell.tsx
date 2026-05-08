import * as React from 'react';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { MobileFrame } from '@/components/layout/MobileFrame';
import { MobileTopBar } from '@/components/layout/MobileTopBar';
import { DriverBottomNav } from '@/components/layout/DriverBottomNav';

/**
 * Sürücü sayfaları için server component shell. RiderShell'in eşi —
 * topSlot ve bottomSlot mobile çerçevenin içinde sticky olarak yerleşir.
 */
export async function DriverShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = (await getCurrentUser())!;
  const unread = await db.notification.count({
    where: { userId: user.id, read: false },
  });

  return (
    <MobileFrame
      topSlot={
        <MobileTopBar
          user={user}
          unreadCount={unread}
          bildirimlerHref="/surucu/bildirimler"
          homeHref="/surucu"
        />
      }
      bottomSlot={<DriverBottomNav />}
    >
      {children}
    </MobileFrame>
  );
}

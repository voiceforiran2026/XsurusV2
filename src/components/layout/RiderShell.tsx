import * as React from 'react';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { MobileFrame } from '@/components/layout/MobileFrame';
import { MobileTopBar } from '@/components/layout/MobileTopBar';
import { RiderBottomNav } from '@/components/layout/RiderBottomNav';

/**
 * Yolcu sayfaları için server component shell.
 * Her yolcu sayfası bu shell'i kullanır → user + unread count tek seferde
 * fetch edilir, MobileFrame'in topSlot/bottomSlot'u doldurulur, içeriğin
 * tamamı çerçevenin içinde kalır.
 */
export async function RiderShell({
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
          bildirimlerHref="/yolcu/bildirimler"
          homeHref="/yolcu"
        />
      }
      bottomSlot={<RiderBottomNav />}
    >
      {children}
    </MobileFrame>
  );
}

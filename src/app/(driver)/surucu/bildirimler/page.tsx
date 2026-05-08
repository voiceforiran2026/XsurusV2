import type { Metadata } from 'next';
import { Bell, Check } from 'lucide-react';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { DriverShell } from '@/components/layout/DriverShell';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';
import { formatRelative } from '@/lib/format';
import { MarkAllReadButton } from '@/components/notification/MarkAllReadButton';

export const metadata: Metadata = { title: 'Bildirimler' };

export default async function DriverBildirimlerPage() {
  const user = (await getCurrentUser())!;
  const items = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const unread = items.filter((n) => !n.read).length;

  return (
    <DriverShell>
      <div className="px-5 py-4 max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Hesap</p>
            <h1 className="text-xl font-bold">Bildirimler</h1>
          </div>
          {unread > 0 && <MarkAllReadButton />}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-5 w-5" />}
            title="Bildirim yok"
            description="Yeni talep, sistem ve ödeme bildirimleri burada görünür."
          />
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <Card
                key={n.id}
                className={`p-3.5 transition-colors ${
                  n.read ? '' : 'border-foreground/30 bg-foreground/[0.02]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      n.read ? 'bg-muted text-muted-foreground' : 'bg-foreground text-background'
                    }`}
                  >
                    {n.read ? <Check className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">
                      {formatRelative(n.createdAt)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DriverShell>
  );
}

import { redirect } from 'next/navigation';
import { getCurrentUser, dashboardPathForRole } from '@/lib/auth/getCurrentUser';
import { AuthHydrator } from '@/components/layout/AuthHydrator';
import { NotificationListener } from '@/components/notification/NotificationListener';

export default async function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/giris?next=/yolcu');
  if (user.role !== 'RIDER') redirect(dashboardPathForRole(user.role));

  // Layout artık UI render etmiyor — TopBar mobile çerçevenin içinde
  // (RiderShell üzerinden) yerleşir.
  return (
    <div className="min-h-screen bg-background">
      <AuthHydrator user={user} />
      <NotificationListener />
      {children}
    </div>
  );
}

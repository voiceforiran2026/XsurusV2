import { redirect } from 'next/navigation';
import { getCurrentUser, dashboardPathForRole } from '@/lib/auth/getCurrentUser';
import { AuthHydrator } from '@/components/layout/AuthHydrator';
import { NotificationListener } from '@/components/notification/NotificationListener';

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/giris?next=/surucu');
  if (user.role !== 'DRIVER') redirect(dashboardPathForRole(user.role));

  return (
    <div className="min-h-screen bg-background">
      <AuthHydrator user={user} />
      <NotificationListener />
      {children}
    </div>
  );
}

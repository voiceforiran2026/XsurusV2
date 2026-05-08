import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  LayoutDashboard,
  Map as MapIcon,
  Users,
  Car,
  Banknote,
  PiggyBank,
  Settings,
  Radar,
} from 'lucide-react';
import { getCurrentUser, dashboardPathForRole } from '@/lib/auth/getCurrentUser';
import { AccountTopBar } from '@/components/layout/AccountTopBar';
import { AuthHydrator } from '@/components/layout/AuthHydrator';
import { NotificationListener } from '@/components/notification/NotificationListener';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/dispatch', label: 'Dispatch', icon: Radar },
  { href: '/admin/yolculuklar', label: 'Yolculuklar', icon: MapIcon },
  { href: '/admin/suruculer', label: 'Sürücüler', icon: Car },
  { href: '/admin/yolcular', label: 'Yolcular', icon: Users },
  { href: '/admin/havuz', label: 'Para Havuzu', icon: PiggyBank },
  { href: '/admin/finans', label: 'Finans', icon: Banknote },
  { href: '/admin/ayarlar', label: 'Ayarlar', icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/giris?next=/admin');
  if (user.role !== 'ADMIN') redirect(dashboardPathForRole(user.role));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthHydrator user={user} />
      <NotificationListener />
      <AccountTopBar user={user} />
      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block w-64 shrink-0 border-r bg-muted/20">
          <nav className="sticky top-14 p-3 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-background hover:text-foreground transition-colors',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 overflow-x-auto">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="lg:hidden sticky bottom-0 z-30 border-t bg-background/95 backdrop-blur">
        <div className="flex justify-around">
          {NAV.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

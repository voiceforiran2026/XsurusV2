import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { XLogo } from '@/components/icons/XLogo';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { dashboardPathForRole } from '@/lib/auth/getCurrentUser';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) redirect(dashboardPathForRole(user.role));

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Sol: marka paneli (md+) */}
      <div className="hidden lg:flex relative bg-canvas text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08),_transparent_60%)]" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2">
            <XLogo size="md" variant="inverted" />
            <span className="font-semibold text-lg">X</span>
          </Link>
        </div>
        <div className="relative space-y-6 max-w-md">
          <h2 className="heading-display text-4xl font-bold text-balance">
            Yolculuk ve gönderim için tek platform.
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Şehir içi mobiliteyi yeniden tanımlıyoruz. Güvenli, hızlı ve şeffaf
            bir deneyim için X.
          </p>
          <div className="flex items-center gap-6 pt-4 text-xs text-white/40">
            <div>
              <div className="text-2xl font-bold text-white">+10M</div>
              <div>Tamamlanan Yolculuk</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">+1M</div>
              <div>Mutlu Müşteri</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">50+</div>
              <div>Şehir</div>
            </div>
          </div>
        </div>
        <div className="relative text-xs text-white/40">
          © {new Date().getFullYear()} X. Tüm hakları saklıdır.
        </div>
      </div>

      {/* Sağ: form alanı */}
      <div className="flex flex-col">
        <div className="lg:hidden border-b border-border">
          <div className="container-narrow flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <XLogo size="sm" />
              <span className="font-semibold">X</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfa
            </Link>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}

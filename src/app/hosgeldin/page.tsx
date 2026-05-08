import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser, dashboardPathForRole } from '@/lib/auth/getCurrentUser';
import { WelcomeCarousel } from '@/components/onboarding/WelcomeCarousel';

export const metadata: Metadata = {
  title: 'Hoş Geldin',
  description: 'X ile mobiliteye yeni başlangıç.',
};

// Auth'lu kullanıcı /hosgeldin'e direkt gelirse dashboard'una geri gitsin
// (carousel sadece anonim ilk-ziyaret deneyimi içindir).
export default async function HosgeldinPage() {
  const user = await getCurrentUser();
  if (user) redirect(dashboardPathForRole(user.role));
  return <WelcomeCarousel />;
}

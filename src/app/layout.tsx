import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
// Önce Leaflet CSS, sonra globals.css — bu sırada Tailwind layer'ları
// Leaflet'i override edebilir ama tersi olamaz.
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { DemoQuickSwitch } from '@/components/common/DemoQuickSwitch';
import { AuthBootstrap } from '@/components/layout/AuthBootstrap';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'X — Sürüş & Gönderim',
    template: '%s · X',
  },
  description:
    'Yolculuk ve gönderi tek platformda. Hızlı, güvenli, konforlu.',
  applicationName: 'X',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="font-sans antialiased">
        <AuthBootstrap />
        {children}
        {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && <DemoQuickSwitch />}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { ServicesSection } from '@/components/marketing/ServicesSection';
import { SectionReveal } from '@/components/marketing/SectionReveal';
import { PageHeroBackdrop } from '@/components/marketing/PageHeroBackdrop';

export const metadata: Metadata = {
  title: 'Nasıl Çalışır?',
  description: 'X uygulamasını adım adım keşfedin.',
};

export default function NasilCalisirPage() {
  return (
    <AppShell navVariant="dark">
      <section className="relative bg-canvas text-white pt-16 pb-12 overflow-hidden">
        <PageHeroBackdrop src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1920&q=80&auto=format&fit=crop" />
        <div className="container-wide max-w-3xl text-center relative">
          <SectionReveal>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
              Adım Adım
            </p>
            <h1 className="heading-display text-4xl md:text-6xl font-bold text-balance">
              X Nasıl Çalışır?
            </h1>
            <p className="mt-5 text-base md:text-lg text-white/70">
              Hızlı, kolay ve güvenli adımlarla yolculuğunuzu veya gönderiminizi
              oluşturun.
            </p>
          </SectionReveal>
        </div>
      </section>
      <HowItWorksSection showHeading={false} />
      <ServicesSection />
    </AppShell>
  );
}

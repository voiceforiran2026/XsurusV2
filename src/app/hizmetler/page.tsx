import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { ServicesSection } from '@/components/marketing/ServicesSection';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { SectionReveal } from '@/components/marketing/SectionReveal';
import { PageHeroBackdrop } from '@/components/marketing/PageHeroBackdrop';

export const metadata: Metadata = {
  title: 'Hizmetler',
  description: 'X Ride ve X Go ile yolculuk ve gönderi.',
};

export default function HizmetlerPage() {
  return (
    <AppShell navVariant="dark">
      <section className="relative bg-canvas text-white pt-16 pb-20 overflow-hidden">
        <PageHeroBackdrop src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1920&q=80&auto=format&fit=crop" />
        <div className="container-wide max-w-3xl text-center relative">
          <SectionReveal>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
              Hizmetlerimiz
            </p>
            <h1 className="heading-display text-4xl md:text-6xl font-bold text-balance">
              X ile dilediğin hizmeti seç
            </h1>
            <p className="mt-5 text-base md:text-lg text-white/70">
              İki farklı ihtiyaç, tek platform. Ride ile yolculuk, Go ile
              gönderim.
            </p>
          </SectionReveal>
        </div>
      </section>
      <ServicesSection showHeading={false} />
      <HowItWorksSection />
    </AppShell>
  );
}

import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { ServicesSection } from '@/components/marketing/ServicesSection';
import { SectionReveal } from '@/components/marketing/SectionReveal';

export const metadata: Metadata = {
  title: 'Nasıl Çalışır?',
  description: 'X uygulamasını adım adım keşfedin.',
};

export default function NasilCalisirPage() {
  return (
    <AppShell>
      <section className="bg-background pt-16 pb-12">
        <div className="container-wide max-w-3xl text-center">
          <SectionReveal>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Adım Adım
            </p>
            <h1 className="heading-display text-4xl md:text-6xl font-bold text-balance">
              X Nasıl Çalışır?
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground">
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

import { AppShell } from '@/components/layout/AppShell';
import { HeroSection } from '@/components/marketing/HeroSection';
import { StatsStrip } from '@/components/marketing/StatsStrip';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { ServicesSection } from '@/components/marketing/ServicesSection';
import { AppDownloadSection } from '@/components/marketing/AppDownloadSection';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';

export default function HomePage() {
  return (
    <AppShell navVariant="dark">
      <OnboardingGate />
      <HeroSection
        eyebrow="Türkiye'nin yeni mobilite platformu"
        title={
          <>
            İhtiyacın olan yolculuk ve gönderim hizmetleri,{' '}
            <span className="text-white/50">tek platformda.</span>
          </>
        }
        subtitle="Güvenli, hızlı ve konforlu çözümler için X uygulaması — yolcu ve gönderici için tek adres."
      />
      <section className="bg-canvas pb-20 md:pb-24">
        <div className="container-wide">
          <StatsStrip variant="dark" />
        </div>
      </section>
      <HowItWorksSection />
      <ServicesSection />
      <AppDownloadSection />
    </AppShell>
  );
}

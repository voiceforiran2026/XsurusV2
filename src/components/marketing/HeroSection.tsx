import * as React from 'react';
import { ServiceSelectorCard } from './ServiceSelectorCard';
import { SectionReveal } from './SectionReveal';
import { CityBackdrop } from './CityBackdrop';

interface HeroSectionProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  showSelector?: boolean;
}

export function HeroSection({
  eyebrow,
  title,
  subtitle,
  showSelector = true,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-canvas text-white">
      <CityBackdrop />
      <div className="container-wide relative py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 max-w-2xl">
            {eyebrow && (
              <SectionReveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  {eyebrow}
                </div>
              </SectionReveal>
            )}
            <SectionReveal delay={0.05}>
              <h1 className="heading-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-balance">
                {title}
              </h1>
            </SectionReveal>
            {subtitle && (
              <SectionReveal delay={0.15}>
                <p className="text-base md:text-lg text-white/70 max-w-xl">
                  {subtitle}
                </p>
              </SectionReveal>
            )}
          </div>
          {showSelector && (
            <div className="lg:col-span-5">
              <ServiceSelectorCard />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

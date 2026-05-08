import Link from 'next/link';
import {
  Car,
  Package,
  Shield,
  Sparkles,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { SectionReveal } from './SectionReveal';
import { cn } from '@/lib/utils';

const SERVICES = [
  {
    id: 'ride',
    type: 'Ride',
    name: 'X Ride',
    headline: 'Konforlu yolculuklar için',
    icon: Car,
    bullets: [
      { icon: Clock, label: '7/24 Hizmet' },
      { icon: Shield, label: 'Güvenli Yolculuk' },
      { icon: Sparkles, label: 'Premium Konfor' },
    ],
    cta: { label: 'Yolculuk Çağır', href: '/giris?next=/yolcu' },
  },
  {
    id: 'go',
    type: 'Go',
    name: 'X Go',
    headline: 'Gönderileriniz güvende',
    icon: Package,
    bullets: [
      { icon: Clock, label: 'Hızlı Teslimat' },
      { icon: Shield, label: 'Güvenli Taşıma' },
      { icon: Sparkles, label: 'Canlı Takip' },
    ],
    cta: { label: 'Gönderi Oluştur', href: '/giris?next=/yolcu' },
  },
];

export function ServicesSection({
  showHeading = true,
}: {
  showHeading?: boolean;
}) {
  return (
    <section className="bg-canvas text-white py-20 md:py-28">
      <div className="container-wide">
        {showHeading && (
          <SectionReveal className="mx-auto max-w-2xl text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
              Hizmetlerimiz
            </p>
            <h2 className="heading-display text-3xl md:text-5xl font-bold text-balance">
              X ile dilediğin hizmeti seç
            </h2>
          </SectionReveal>
        )}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {SERVICES.map((s, i) => (
            <SectionReveal
              key={s.id}
              id={s.id}
              delay={i * 0.1}
              className="group relative overflow-hidden rounded-2xl bg-white text-foreground p-7 hover:shadow-soft-lg transition-all duration-300 ease-smooth"
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-foreground/[0.03] transition-transform duration-500 ease-smooth group-hover:scale-110" />
              <div className="relative flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.type}
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background">
                    <s.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">{s.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {s.headline}
                </p>
                <ul className="space-y-3 mb-7">
                  {s.bullets.map((b) => (
                    <li
                      key={b.label}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full bg-muted',
                        )}
                      >
                        <b.icon className="h-3.5 w-3.5" />
                      </div>
                      {b.label}
                    </li>
                  ))}
                </ul>
                <Link
                  href={s.cta.href}
                  className="mt-auto inline-flex items-center justify-between rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-all duration-200 ease-smooth hover:bg-foreground/90 active:scale-[0.98]"
                >
                  {s.cta.label}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

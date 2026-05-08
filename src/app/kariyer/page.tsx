import type { Metadata } from 'next';
import {
  HeartHandshake,
  Sparkles,
  TrendingUp,
  Scale,
  ArrowRight,
  MapPin,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { SectionReveal } from '@/components/marketing/SectionReveal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Kariyer',
  description: "X'te kariyer fırsatları.",
};

const REASONS = [
  {
    icon: HeartHandshake,
    title: 'Neden X?',
    body: 'İnovatif, dinamik ve insan odaklı bir çalışma kültürü.',
  },
  {
    icon: Sparkles,
    title: 'Fırsatlar',
    body: 'Farklı departmanlarda birçok kariyer fırsatı seni bekliyor.',
  },
  {
    icon: TrendingUp,
    title: 'Gelişim',
    body: 'Sürekli öğrenme ve gelişim desteği sağlıyoruz.',
  },
  {
    icon: Scale,
    title: 'Eşitlik',
    body: 'Çeşitliliğe önem verir, eşitlikçi bir iş ortamı sunarız.',
  },
];

const POSITIONS = [
  {
    title: 'Yazılım Geliştirici',
    department: 'Tam Zamanlı',
    location: 'İstanbul',
  },
  {
    title: 'Müşteri Destek Uzmanı',
    department: 'Tam Zamanlı',
    location: 'İstanbul',
  },
  {
    title: 'Dijital Pazarlama Uzmanı',
    department: 'Tam Zamanlı',
    location: 'İstanbul',
  },
  {
    title: 'Sürücü (Part-Time / Full-Time)',
    department: 'Yarı Zamanlı / Tam Zamanlı',
    location: 'Istanbul',
  },
];

export default function KariyerPage() {
  return (
    <AppShell>
      <section className="bg-background pt-16 pb-12">
        <div className="container-wide grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionReveal>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Kariyer
              </p>
              <h1 className="heading-display text-4xl md:text-6xl font-bold text-balance">
                X'te Kariyer
              </h1>
              <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl">
                Büyüyen ekibimize katıl, geleceği birlikte şekillendirelim.
              </p>
            </SectionReveal>
          </div>
          <SectionReveal delay={0.15}>
            <TeamMosaic />
          </SectionReveal>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="container-wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REASONS.map((r, i) => (
              <SectionReveal key={r.title} delay={i * 0.05}>
                <Card className="p-6 h-full hover:shadow-soft transition-all duration-300 ease-smooth">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background mb-4">
                    <r.icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold mb-1.5">{r.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {r.body}
                  </p>
                </Card>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="container-wide">
          <SectionReveal className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Açık Pozisyonlar
              </p>
              <h2 className="heading-display text-3xl md:text-4xl font-bold">
                Tüm Pozisyonlar
              </h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-md">
                Açık pozisyonlarımıza göz atın, kariyer yolculuğunuza X'te
                başlayın.
              </p>
            </div>
          </SectionReveal>

          <div className="grid sm:grid-cols-2 gap-3">
            {POSITIONS.map((p, i) => (
              <SectionReveal key={i} delay={i * 0.05}>
                <Card className="p-5 group hover:shadow-soft transition-all duration-300 ease-smooth cursor-pointer">
                  <h3 className="font-semibold mb-3 group-hover:translate-x-0.5 transition-transform duration-200">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {p.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {p.department}
                    </span>
                  </div>
                </Card>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-canvas text-white py-20">
        <div className="container-wide max-w-3xl text-center">
          <SectionReveal>
            <h2 className="heading-display text-3xl md:text-5xl font-bold mb-4">
              Sen de X ailesine katıl!
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              Birlikte daha büyük başarılara imza atalım.
            </p>
            <Button asChild variant="invert" size="lg">
              <Link href="#">
                Hemen Başvur
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </SectionReveal>
        </div>
      </section>
    </AppShell>
  );
}

function TeamMosaic() {
  // Görsel asset olmadan ekip hissi veren grid mozaik
  const cells = [
    { bg: 'bg-foreground/90', label: 'CEO' },
    { bg: 'bg-foreground/70', label: 'CTO' },
    { bg: 'bg-foreground/50', label: 'PM' },
    { bg: 'bg-foreground/85', label: 'Eng' },
    { bg: 'bg-foreground/60', label: 'Ops' },
    { bg: 'bg-foreground/95', label: 'Design' },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 p-2 rounded-2xl border bg-card shadow-soft">
      {cells.map((c, i) => (
        <div
          key={i}
          className={`aspect-square rounded-xl ${c.bg} flex items-end justify-start p-3 hover:scale-[1.02] transition-transform duration-300 ease-smooth`}
        >
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/90">
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Building2,
  Users,
  Receipt,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { SectionReveal } from '@/components/marketing/SectionReveal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Kurumsal',
  description: 'X kurumsal çözümleri.',
};

const FEATURES = [
  {
    icon: Building2,
    title: 'Filo Yönetimi',
    body: 'Tüm sürücü ve araç bilgilerini tek panelden takip edin.',
  },
  {
    icon: Users,
    title: 'Çalışan Yolculukları',
    body: 'Şirket çalışanlarınız için özel hesaplar ve bütçe yönetimi.',
  },
  {
    icon: Receipt,
    title: 'Aylık Faturalandırma',
    body: 'Tüm yolculukları tek faturada toplayın, muhasebenizi basitleştirin.',
  },
  {
    icon: ShieldCheck,
    title: 'Kurumsal Güvence',
    body: 'SLA garantili hizmet, dedicated destek ve güvenlik standartları.',
  },
];

export default function KurumsalPage() {
  return (
    <AppShell>
      <section className="bg-background pt-16 pb-12">
        <div className="container-wide max-w-3xl text-center">
          <SectionReveal>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Kurumsal
            </p>
            <h1 className="heading-display text-4xl md:text-6xl font-bold text-balance">
              İşinizi büyütecek<br />kurumsal çözümler
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground">
              Şirketinizin yolculuk ve gönderim ihtiyaçları için tek noktadan
              yönetilen profesyonel çözümler.
            </p>
          </SectionReveal>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="container-wide">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <SectionReveal key={f.title} delay={i * 0.05}>
                <Card className="p-6 h-full hover:shadow-soft transition-all duration-300 ease-smooth">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background mb-4">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold mb-1.5">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {f.body}
                  </p>
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
              Şirketiniz için X
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              Demo talebi ya da fiyat teklifi için ekibimizle iletişime geçin.
            </p>
            <Button asChild variant="invert" size="lg">
              <Link href="#">
                Bizimle İletişime Geç
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </SectionReveal>
        </div>
      </section>
    </AppShell>
  );
}

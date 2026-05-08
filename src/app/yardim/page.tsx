import type { Metadata } from 'next';
import {
  Mail,
  Phone,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { FaqAccordion, type FaqItem } from '@/components/marketing/FaqAccordion';
import { SectionReveal } from '@/components/marketing/SectionReveal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Yardım Merkezi',
  description: 'Sıkça sorulan sorular ve iletişim.',
};

const FAQ: FaqItem[] = [
  {
    q: 'Ödeme nasıl yapılır?',
    a: 'Yolculuğunuz tamamlandıktan sonra kayıtlı kredi/banka kartınızdan otomatik olarak tahsilat yapılır. Chip bakiyenizi de ödeme aracı olarak kullanabilirsiniz.',
  },
  {
    q: 'Yolculuğumu nasıl iptal edebilirim?',
    a: 'Sürücü size atanmadan önce ücretsiz iptal edebilirsiniz. Atama sonrası iptal etmek için "Yolculuğumu İptal Et" butonunu kullanın.',
  },
  {
    q: 'Faturamı nasıl alabilirim?',
    a: 'Geçmiş yolculuklar bölümünden ilgili yolculuğun detaylarına girerek e-fatura indirebilirsiniz.',
  },
  {
    q: 'Promosyon kodumu nasıl kullanırım?',
    a: 'Kart bilgileriniz altında bulunan "Promosyon Kodu" alanına kodunuzu girerek aktifleştirebilirsiniz. Aktif kodunuz bir sonraki yolculukta otomatik uygulanır.',
  },
  {
    q: 'Sürücü olarak nasıl başvurabilirim?',
    a: 'Kariyer sayfamızdaki "Sürücü" pozisyonu üzerinden başvuru formunu doldurabilirsiniz. Ekibimiz 48 saat içinde size dönüş yapacaktır.',
  },
  {
    q: 'X Go ile neler gönderebilirim?',
    a: 'Kişisel eşyalarınız, dokümanlar, küçük paketler ve gıda dahil çoğu yasal ürünü X Go ile güvenle gönderebilirsiniz. Yasaklı ürünler için yardım merkezimizden detaylı listeye ulaşabilirsiniz.',
  },
  {
    q: 'Chip nedir, nasıl kazanılır?',
    a: 'Her tamamlanan yolculuk ücretinin %10\'u chip olarak hesabınıza yansır. 1 chip = 1 ₺ değerindedir ve bir sonraki yolculuğunuzda ödeme aracı olarak kullanılabilir.',
  },
  {
    q: 'Uygulamayı nasıl indirebilirim?',
    a: 'iOS için App Store, Android için Google Play üzerinden "X" uygulamasını ücretsiz indirebilirsiniz.',
  },
];

const CONTACT = [
  {
    icon: Mail,
    label: 'E-posta',
    value: 'destek@x.com',
    href: 'mailto:destek@x.com',
  },
  {
    icon: Phone,
    label: 'Çağrı Merkezi',
    value: '0850 123 45 67',
    href: 'tel:08501234567',
  },
  {
    icon: MessageSquare,
    label: 'Canlı Destek',
    value: '7/24 hizmet',
    href: '#',
  },
];

export default function YardimPage() {
  return (
    <AppShell>
      <section className="bg-background pt-16 pb-12">
        <div className="container-wide max-w-3xl text-center">
          <SectionReveal>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Yardım Merkezi
            </p>
            <h1 className="heading-display text-4xl md:text-6xl font-bold text-balance">
              Yardım Merkezi
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground">
              Sıkça sorulan sorulara hızlı yanıtlar ve canlı destek.
            </p>
          </SectionReveal>
        </div>
      </section>

      <section className="bg-background pb-20">
        <div className="container-wide grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SectionReveal className="mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Sık Sorulan Sorular
              </h2>
            </SectionReveal>
            <Card className="p-6">
              <FaqAccordion items={FAQ} />
            </Card>
          </div>

          <aside className="space-y-6">
            <SectionReveal>
              <h2 className="text-2xl font-bold mb-4">Bize Ulaşın</h2>
              <Card className="divide-y">
                {CONTACT.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    className="flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <c.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {c.label}
                      </p>
                      <p className="text-sm font-medium">{c.value}</p>
                    </div>
                  </a>
                ))}
              </Card>
            </SectionReveal>

            <SectionReveal delay={0.1}>
              <Card className="p-6 bg-canvas text-white border-canvas">
                <h3 className="text-base font-semibold mb-2">
                  Başka sorunuz mu var?
                </h3>
                <p className="text-sm text-white/70 mb-4">
                  Canlı destek hattımız 7/24 hizmetinizdedir.
                </p>
                <Button variant="invert" className="w-full">
                  Canlı Destek
                </Button>
              </Card>
            </SectionReveal>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}

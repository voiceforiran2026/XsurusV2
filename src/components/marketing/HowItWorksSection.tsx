import { MousePointerClick, MapPinned, Car } from 'lucide-react';
import { SectionReveal } from './SectionReveal';

const STEPS = [
  {
    n: '01',
    icon: MousePointerClick,
    title: 'Hizmeti Seç',
    body: 'Ride mı yoksa Go mu? İhtiyacına uygun hizmeti tek dokunuşla seç.',
  },
  {
    n: '02',
    icon: MapPinned,
    title: 'Bilgileri Gir',
    body: 'Nereden ve nereye gideceğini belirt; ücretini anında gör.',
  },
  {
    n: '03',
    icon: Car,
    title: 'Hizmeti Al',
    body: 'En yakın sürücü seninle bağlantı kurar. Hızlı, güvenli, konforlu.',
  },
];

export function HowItWorksSection({
  showHeading = true,
}: {
  showHeading?: boolean;
}) {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container-wide">
        {showHeading && (
          <SectionReveal className="mx-auto max-w-2xl text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Nasıl Çalışır?
            </p>
            <h2 className="heading-display text-3xl md:text-5xl font-bold text-balance">
              X Nasıl Çalışır?
            </h2>
            <p className="mt-4 text-muted-foreground text-base">
              Hızlı, kolay ve güvenli adımlarla yolculuğunu veya gönderimini
              oluştur.
            </p>
          </SectionReveal>
        )}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-10 max-w-5xl mx-auto">
          {STEPS.map((step, i) => (
            <SectionReveal
              key={step.n}
              delay={i * 0.1}
              className="relative rounded-2xl border bg-card p-7 hover:shadow-soft transition-shadow duration-300 ease-smooth group"
            >
              <div className="absolute top-7 right-7 text-xs font-mono text-muted-foreground/60">
                {step.n}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background mb-5 transition-transform duration-300 ease-smooth group-hover:scale-110">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.body}
              </p>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

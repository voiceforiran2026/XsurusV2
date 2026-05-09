import Image from 'next/image';
import { Apple, Smartphone, Star } from 'lucide-react';
import { SectionReveal } from './SectionReveal';

export function AppDownloadSection() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container-wide">
        <div className="rounded-2xl bg-canvas text-white p-8 md:p-14 overflow-hidden relative">
          {/* Arka plan fotoğrafı — Unsplash modern araba garaj */}
          <Image
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80&auto=format&fit=crop"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/85 to-canvas/60" />
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_0%,_transparent_60%)]" />
          <div className="grid md:grid-cols-2 gap-10 items-center relative">
            <SectionReveal>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
                Mobil Uygulama
              </p>
              <h2 className="heading-display text-3xl md:text-4xl font-bold mb-4">
                X'i indir, hayatını kolaylaştır.
              </h2>
              <p className="text-white/70 mb-7 max-w-md">
                Yolculukların ve gönderilerin için tek uygulama. iOS ve Android
                için ücretsiz indir.
              </p>
              <div className="flex flex-wrap gap-3">
                <DownloadButton icon={Apple} primary="App Store'dan" secondary="İNDİR" />
                <DownloadButton
                  icon={Smartphone}
                  primary="Google Play'den"
                  secondary="İNDİR"
                />
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-white/60">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-white text-white"
                    />
                  ))}
                </div>
                4.8 / 5 — 250.000+ değerlendirme
              </div>
            </SectionReveal>

            <SectionReveal delay={0.15} className="hidden md:block">
              <PhoneMockup />
            </SectionReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function DownloadButton({
  icon: Icon,
  primary,
  secondary,
}: {
  icon: typeof Apple;
  primary: string;
  secondary: string;
}) {
  return (
    <a
      href="#"
      className="group inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-black hover:bg-white/90 transition-all duration-200 ease-smooth active:scale-[0.98]"
    >
      <Icon className="h-5 w-5" />
      <div className="text-left leading-tight">
        <div className="text-[10px] uppercase tracking-wider opacity-60">
          {primary}
        </div>
        <div className="text-sm font-semibold">{secondary}</div>
      </div>
    </a>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[260px]">
      <div className="aspect-[9/19.5] rounded-[36px] border-[8px] border-white/20 bg-white p-3 shadow-2xl">
        <div className="h-full w-full rounded-[24px] bg-background overflow-hidden flex flex-col">
          <div className="flex-1 bg-gradient-to-br from-foreground/5 to-foreground/0 relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 h-1.5 w-12 rounded-full bg-foreground/20" />
            <div className="absolute bottom-6 left-4 right-4 rounded-2xl bg-background border shadow-soft p-4">
              <div className="text-[10px] font-semibold mb-2">X i'le</div>
              <div className="text-xs text-muted-foreground">
                Hayatını kolaylaştır
              </div>
              <div className="mt-3 h-8 rounded-full bg-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

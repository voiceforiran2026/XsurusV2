import Image from 'next/image';

// Hero arka planı: gerçek gece-şehir fotoğrafı + dark overlay ile okunabilirlik
// Görsel CSS efektleri (ışık halkaları, grid, silüet) overlay olarak korunur.
export function CityBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* Gerçek arka plan fotoğrafı — Unsplash modern şehir caddesi trafik */}
      <Image
        src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80&auto=format&fit=crop"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-50"
      />
      {/* Karanlık degrade — metnin okunması için */}
      <div className="absolute inset-0 bg-gradient-to-b from-canvas/85 via-canvas/70 to-canvas/95" />

      {/* Üst sağ ışık */}
      <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.08)_0%,_transparent_60%)]" />
      {/* Alt sol ışık */}
      <div className="absolute -bottom-40 -left-32 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.04)_0%,_transparent_70%)]" />
      {/* İnce grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      {/* Şehir silüeti SVG (alt kısım) */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-32 md:h-48 text-white/[0.03]"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0,200 L0,140 L40,140 L40,100 L80,100 L80,120 L120,120 L120,80 L160,80 L160,110 L200,110 L200,90 L260,90 L260,70 L300,70 L300,100 L350,100 L350,60 L400,60 L400,90 L450,90 L450,110 L500,110 L500,80 L550,80 L550,100 L600,100 L600,70 L650,70 L650,90 L700,90 L700,50 L750,50 L750,80 L800,80 L800,100 L850,100 L850,70 L900,70 L900,90 L960,90 L960,60 L1010,60 L1010,100 L1060,100 L1060,80 L1110,80 L1110,110 L1160,110 L1160,90 L1210,90 L1210,70 L1260,70 L1260,100 L1310,100 L1310,80 L1360,80 L1360,120 L1400,120 L1400,100 L1440,100 L1440,200 Z" />
      </svg>
      {/* Pencere ışıkları (rastgele küçük noktalar) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 md:h-48">
        {[
          [10, 80], [12, 60], [18, 90], [22, 70], [28, 110], [34, 50],
          [40, 100], [46, 75], [52, 85], [60, 65], [66, 95], [72, 55],
          [78, 105], [84, 80], [90, 70],
        ].map(([x, y], i) => (
          <span
            key={i}
            className="absolute h-px w-px rounded-full bg-white/40"
            style={{
              left: `${x}%`,
              bottom: `${y}px`,
              boxShadow: '0 0 4px rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

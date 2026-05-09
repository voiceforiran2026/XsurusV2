import Image from 'next/image';

interface PageHeroBackdropProps {
  /** Unsplash photo URL (full src) */
  src: string;
  /** Image opacity (default 0.45) */
  imageOpacity?: number;
}

/**
 * Marketing alt sayfaları (/hizmetler, /kariyer, /kurumsal, /nasil-calisir,
 * /yardim) hero bölümleri için ortak arka plan: gerçek fotoğraf + dark overlay.
 *
 * Kullanım: Hero `<section>` içine `relative overflow-hidden` ekle, ilk child
 * olarak `<PageHeroBackdrop src="..." />` koy, içerik wrapper'ına `relative`
 * sınıfı ekle ki overlay'in üstünde kalsın.
 */
export function PageHeroBackdrop({
  src,
  imageOpacity = 0.45,
}: PageHeroBackdropProps) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <Image
        src={src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ opacity: imageOpacity }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-canvas/80 via-canvas/65 to-canvas/95" />
      <div className="absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_0%,_transparent_60%)]" />
    </div>
  );
}

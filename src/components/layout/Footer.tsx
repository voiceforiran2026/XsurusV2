import Link from 'next/link';
import { Apple, Smartphone } from 'lucide-react';
import { XLogo } from '@/components/icons/XLogo';

const FOOTER_LINKS = {
  hizmetler: {
    title: 'Hizmetler',
    links: [
      { href: '/hizmetler#ride', label: 'X Ride' },
      { href: '/hizmetler#go', label: 'X Go' },
      { href: '/kurumsal', label: 'Kurumsal Çözümler' },
    ],
  },
  sirket: {
    title: 'Şirket',
    links: [
      { href: '/kariyer', label: 'Kariyer' },
      { href: '/yardim', label: 'Yardım Merkezi' },
      { href: '/nasil-calisir', label: 'Nasıl Çalışır?' },
    ],
  },
  yasal: {
    title: 'Yasal',
    links: [
      { href: '#', label: 'Kullanım Koşulları' },
      { href: '#', label: 'Gizlilik Politikası' },
      { href: '#', label: 'KVKK Aydınlatma' },
    ],
  },
};

export function Footer() {
  return (
    <footer className="bg-canvas text-white">
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <XLogo size="md" variant="inverted" />
              <span className="text-lg font-semibold">X</span>
            </div>
            <p className="text-sm text-white/60 max-w-xs">
              Yolculuk ve gönderi tek platformda. Hızlı, güvenli, konforlu.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-black hover:bg-white/90 transition-colors w-fit"
              >
                <Apple className="h-4 w-4" />
                App Store'dan İndir
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-black hover:bg-white/90 transition-colors w-fit"
              >
                <Smartphone className="h-4 w-4" />
                Google Play'den İndir
              </a>
            </div>
          </div>

          {Object.values(FOOTER_LINKS).map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-white/50">
          <span>© {new Date().getFullYear()} X. Tüm hakları saklıdır.</span>
          <span>Türkiye'de tasarlandı ve geliştirildi.</span>
        </div>
      </div>
    </footer>
  );
}

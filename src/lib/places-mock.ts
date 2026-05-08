// Curated TR adres dataseti — Google Places anahtarı yokken fallback olarak kullanılır.
// Aynı zamanda seed verisinde gerçekçi yolculuk lokasyonları için referans.

export interface MockPlace {
  placeId: string;
  name: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
}

export const MOCK_PLACES: MockPlace[] = [
  // İstanbul — Avrupa Yakası
  { placeId: 'tr-ist-001', name: 'Taksim Meydanı', district: 'Beyoğlu', city: 'İstanbul', lat: 41.037, lng: 28.985 },
  { placeId: 'tr-ist-002', name: 'İstiklal Caddesi', district: 'Beyoğlu', city: 'İstanbul', lat: 41.0345, lng: 28.9776 },
  { placeId: 'tr-ist-003', name: 'Galata Kulesi', district: 'Beyoğlu', city: 'İstanbul', lat: 41.0256, lng: 28.9742 },
  { placeId: 'tr-ist-004', name: 'Karaköy Meydanı', district: 'Beyoğlu', city: 'İstanbul', lat: 41.0254, lng: 28.9744 },
  { placeId: 'tr-ist-005', name: 'Beşiktaş İskelesi', district: 'Beşiktaş', city: 'İstanbul', lat: 41.042, lng: 29.0078 },
  { placeId: 'tr-ist-006', name: 'Levent', district: 'Beşiktaş', city: 'İstanbul', lat: 41.0814, lng: 29.0094 },
  { placeId: 'tr-ist-007', name: 'Maslak', district: 'Sarıyer', city: 'İstanbul', lat: 41.111, lng: 29.022 },
  { placeId: 'tr-ist-008', name: 'Sarıyer Sahil', district: 'Sarıyer', city: 'İstanbul', lat: 41.167, lng: 29.055 },
  { placeId: 'tr-ist-009', name: 'Bebek Sahil', district: 'Beşiktaş', city: 'İstanbul', lat: 41.079, lng: 29.042 },
  { placeId: 'tr-ist-010', name: 'Etiler', district: 'Beşiktaş', city: 'İstanbul', lat: 41.081, lng: 29.033 },
  { placeId: 'tr-ist-011', name: 'Şişli Meydanı', district: 'Şişli', city: 'İstanbul', lat: 41.061, lng: 28.9879 },
  { placeId: 'tr-ist-012', name: 'Mecidiyeköy', district: 'Şişli', city: 'İstanbul', lat: 41.0666, lng: 28.994 },
  { placeId: 'tr-ist-013', name: 'Nişantaşı', district: 'Şişli', city: 'İstanbul', lat: 41.049, lng: 28.992 },
  { placeId: 'tr-ist-014', name: 'Cevahir AVM', district: 'Şişli', city: 'İstanbul', lat: 41.067, lng: 28.992 },
  { placeId: 'tr-ist-015', name: 'Sultanahmet Meydanı', district: 'Fatih', city: 'İstanbul', lat: 41.0058, lng: 28.9784 },
  { placeId: 'tr-ist-016', name: 'Eminönü', district: 'Fatih', city: 'İstanbul', lat: 41.0166, lng: 28.9706 },
  { placeId: 'tr-ist-017', name: 'Aksaray', district: 'Fatih', city: 'İstanbul', lat: 41.0123, lng: 28.9492 },
  { placeId: 'tr-ist-018', name: 'Bakırköy Çarşı', district: 'Bakırköy', city: 'İstanbul', lat: 40.9786, lng: 28.8736 },
  { placeId: 'tr-ist-019', name: 'Florya Sahil', district: 'Bakırköy', city: 'İstanbul', lat: 40.975, lng: 28.786 },
  { placeId: 'tr-ist-020', name: 'Yeşilköy', district: 'Bakırköy', city: 'İstanbul', lat: 40.959, lng: 28.823 },
  { placeId: 'tr-ist-021', name: 'İstanbul Havalimanı', district: 'Arnavutköy', city: 'İstanbul', lat: 41.262, lng: 28.741 },
  { placeId: 'tr-ist-022', name: 'Beylikdüzü Migros AVM', district: 'Beylikdüzü', city: 'İstanbul', lat: 41.005, lng: 28.639 },
  { placeId: 'tr-ist-023', name: 'Bahçeşehir', district: 'Başakşehir', city: 'İstanbul', lat: 41.085, lng: 28.67 },
  { placeId: 'tr-ist-024', name: 'Başakşehir', district: 'Başakşehir', city: 'İstanbul', lat: 41.102, lng: 28.798 },
  { placeId: 'tr-ist-025', name: 'Esenyurt Meydanı', district: 'Esenyurt', city: 'İstanbul', lat: 41.029, lng: 28.676 },

  // İstanbul — Anadolu Yakası
  { placeId: 'tr-ist-026', name: 'Kadıköy İskelesi', district: 'Kadıköy', city: 'İstanbul', lat: 40.9929, lng: 29.026 },
  { placeId: 'tr-ist-027', name: 'Bahariye Caddesi', district: 'Kadıköy', city: 'İstanbul', lat: 40.989, lng: 29.029 },
  { placeId: 'tr-ist-028', name: 'Moda Sahil', district: 'Kadıköy', city: 'İstanbul', lat: 40.981, lng: 29.025 },
  { placeId: 'tr-ist-029', name: 'Bağdat Caddesi (Caddebostan)', district: 'Kadıköy', city: 'İstanbul', lat: 40.965, lng: 29.064 },
  { placeId: 'tr-ist-030', name: 'Üsküdar Sahil', district: 'Üsküdar', city: 'İstanbul', lat: 41.0245, lng: 29.015 },
  { placeId: 'tr-ist-031', name: 'Çamlıca Tepesi', district: 'Üsküdar', city: 'İstanbul', lat: 41.023, lng: 29.068 },
  { placeId: 'tr-ist-032', name: 'Ataşehir Meydan', district: 'Ataşehir', city: 'İstanbul', lat: 40.9928, lng: 29.128 },
  { placeId: 'tr-ist-033', name: 'Finanskent (Ataşehir)', district: 'Ataşehir', city: 'İstanbul', lat: 40.99, lng: 29.133 },
  { placeId: 'tr-ist-034', name: 'Kozyatağı', district: 'Kadıköy', city: 'İstanbul', lat: 40.9764, lng: 29.0944 },
  { placeId: 'tr-ist-035', name: 'Kartal Meydan', district: 'Kartal', city: 'İstanbul', lat: 40.902, lng: 29.19 },
  { placeId: 'tr-ist-036', name: 'Pendik İstasyon', district: 'Pendik', city: 'İstanbul', lat: 40.877, lng: 29.253 },
  { placeId: 'tr-ist-037', name: 'Sabiha Gökçen Havalimanı', district: 'Pendik', city: 'İstanbul', lat: 40.898, lng: 29.309 },
  { placeId: 'tr-ist-038', name: 'Tuzla Marina', district: 'Tuzla', city: 'İstanbul', lat: 40.82, lng: 29.305 },
  { placeId: 'tr-ist-039', name: 'Maltepe Sahil', district: 'Maltepe', city: 'İstanbul', lat: 40.932, lng: 29.13 },
  { placeId: 'tr-ist-040', name: 'Ümraniye', district: 'Ümraniye', city: 'İstanbul', lat: 41.026, lng: 29.098 },

  // Ankara — Çankaya
  { placeId: 'tr-ank-001', name: 'Kızılay Meydanı', district: 'Çankaya', city: 'Ankara', lat: 39.9208, lng: 32.8541 },
  { placeId: 'tr-ank-002', name: 'Tunalı Hilmi Caddesi', district: 'Çankaya', city: 'Ankara', lat: 39.908, lng: 32.858 },
  { placeId: 'tr-ank-003', name: 'Çankaya Meydanı', district: 'Çankaya', city: 'Ankara', lat: 39.892, lng: 32.863 },
  { placeId: 'tr-ank-004', name: 'Bahçelievler 7. Cadde', district: 'Çankaya', city: 'Ankara', lat: 39.923, lng: 32.833 },
  { placeId: 'tr-ank-005', name: 'Çukurambar', district: 'Çankaya', city: 'Ankara', lat: 39.909, lng: 32.812 },
  { placeId: 'tr-ank-006', name: 'Söğütözü Metro', district: 'Çankaya', city: 'Ankara', lat: 39.918, lng: 32.805 },
  { placeId: 'tr-ank-007', name: 'Eskişehir Yolu', district: 'Çankaya', city: 'Ankara', lat: 39.905, lng: 32.79 },
  { placeId: 'tr-ank-008', name: 'Kavaklıdere', district: 'Çankaya', city: 'Ankara', lat: 39.913, lng: 32.857 },
  { placeId: 'tr-ank-009', name: 'Gaziosmanpaşa', district: 'Çankaya', city: 'Ankara', lat: 39.906, lng: 32.866 },
  { placeId: 'tr-ank-010', name: 'Atakule', district: 'Çankaya', city: 'Ankara', lat: 39.901, lng: 32.866 },
  { placeId: 'tr-ank-011', name: 'Anıtkabir', district: 'Çankaya', city: 'Ankara', lat: 39.9255, lng: 32.8378 },
  { placeId: 'tr-ank-012', name: 'Mustafa Kemal Mahallesi', district: 'Çankaya', city: 'Ankara', lat: 39.9, lng: 32.766 },
  { placeId: 'tr-ank-013', name: 'Çayyolu', district: 'Çankaya', city: 'Ankara', lat: 39.876, lng: 32.667 },
  { placeId: 'tr-ank-014', name: 'Ümitköy', district: 'Çankaya', city: 'Ankara', lat: 39.89, lng: 32.687 },
  { placeId: 'tr-ank-015', name: 'Dikmen', district: 'Çankaya', city: 'Ankara', lat: 39.886, lng: 32.847 },
  { placeId: 'tr-ank-016', name: 'Balgat', district: 'Çankaya', city: 'Ankara', lat: 39.911, lng: 32.819 },
  { placeId: 'tr-ank-017', name: 'Beştepe', district: 'Yenimahalle', city: 'Ankara', lat: 39.943, lng: 32.799 },
  { placeId: 'tr-ank-018', name: 'ODTÜ Kampüs', district: 'Çankaya', city: 'Ankara', lat: 39.886, lng: 32.779 },
  { placeId: 'tr-ank-019', name: 'Bilkent Üniversitesi', district: 'Çankaya', city: 'Ankara', lat: 39.866, lng: 32.745 },
  { placeId: 'tr-ank-020', name: 'Hacettepe Beytepe', district: 'Çankaya', city: 'Ankara', lat: 39.87, lng: 32.736 },
  { placeId: 'tr-ank-021', name: 'Armada AVM', district: 'Çankaya', city: 'Ankara', lat: 39.916, lng: 32.806 },
  { placeId: 'tr-ank-022', name: 'Cepa AVM', district: 'Yenimahalle', city: 'Ankara', lat: 39.96, lng: 32.776 },

  // Ankara — Yenimahalle / Keçiören / Altındağ / Mamak / çevre
  { placeId: 'tr-ank-023', name: 'ANKAmall', district: 'Yenimahalle', city: 'Ankara', lat: 39.965, lng: 32.797 },
  { placeId: 'tr-ank-024', name: 'Yenimahalle Meydanı', district: 'Yenimahalle', city: 'Ankara', lat: 39.96, lng: 32.812 },
  { placeId: 'tr-ank-025', name: 'Batıkent', district: 'Yenimahalle', city: 'Ankara', lat: 39.978, lng: 32.728 },
  { placeId: 'tr-ank-026', name: 'Demetevler', district: 'Yenimahalle', city: 'Ankara', lat: 39.971, lng: 32.793 },
  { placeId: 'tr-ank-027', name: 'Eryaman', district: 'Etimesgut', city: 'Ankara', lat: 39.984, lng: 32.62 },
  { placeId: 'tr-ank-028', name: 'Sincan Merkez', district: 'Sincan', city: 'Ankara', lat: 39.977, lng: 32.578 },
  { placeId: 'tr-ank-029', name: 'Keçiören Meydanı', district: 'Keçiören', city: 'Ankara', lat: 39.983, lng: 32.864 },
  { placeId: 'tr-ank-030', name: 'Etlik', district: 'Keçiören', city: 'Ankara', lat: 39.984, lng: 32.842 },
  { placeId: 'tr-ank-031', name: 'Pursaklar', district: 'Pursaklar', city: 'Ankara', lat: 40.029, lng: 32.898 },
  { placeId: 'tr-ank-032', name: 'Mamak Meydanı', district: 'Mamak', city: 'Ankara', lat: 39.928, lng: 32.926 },
  { placeId: 'tr-ank-033', name: 'Ulus', district: 'Altındağ', city: 'Ankara', lat: 39.942, lng: 32.854 },
  { placeId: 'tr-ank-034', name: 'Hamamönü', district: 'Altındağ', city: 'Ankara', lat: 39.937, lng: 32.857 },
  { placeId: 'tr-ank-035', name: 'Ankara Kalesi (Hisar)', district: 'Altındağ', city: 'Ankara', lat: 39.938, lng: 32.862 },
  { placeId: 'tr-ank-036', name: 'AŞTİ Otogar', district: 'Çankaya', city: 'Ankara', lat: 39.928, lng: 32.815 },
  { placeId: 'tr-ank-037', name: 'Ankara YHT Garı', district: 'Altındağ', city: 'Ankara', lat: 39.937, lng: 32.843 },
  { placeId: 'tr-ank-038', name: 'Esenboğa Havalimanı', district: 'Çubuk', city: 'Ankara', lat: 40.128, lng: 32.995 },
  { placeId: 'tr-ank-039', name: 'Polatlı Merkez', district: 'Polatlı', city: 'Ankara', lat: 39.583, lng: 32.146 },
  { placeId: 'tr-ank-040', name: 'Akay Kavşağı', district: 'Çankaya', city: 'Ankara', lat: 39.911, lng: 32.86 },

  // İzmir — Konak (merkez + sahil)
  { placeId: 'tr-izm-001', name: 'Konak Meydanı', district: 'Konak', city: 'İzmir', lat: 38.4192, lng: 27.1287 },
  { placeId: 'tr-izm-002', name: 'Alsancak', district: 'Konak', city: 'İzmir', lat: 38.436, lng: 27.143 },
  { placeId: 'tr-izm-003', name: 'Kordon', district: 'Konak', city: 'İzmir', lat: 38.429, lng: 27.135 },
  { placeId: 'tr-izm-004', name: 'Kemeraltı Çarşısı', district: 'Konak', city: 'İzmir', lat: 38.42, lng: 27.131 },
  { placeId: 'tr-izm-005', name: 'Tarihi Asansör', district: 'Konak', city: 'İzmir', lat: 38.412, lng: 27.121 },
  { placeId: 'tr-izm-006', name: 'Kadifekale', district: 'Konak', city: 'İzmir', lat: 38.413, lng: 27.146 },
  { placeId: 'tr-izm-007', name: 'Karataş Sahil', district: 'Konak', city: 'İzmir', lat: 38.412, lng: 27.131 },
  { placeId: 'tr-izm-008', name: 'Hatay Mahallesi', district: 'Konak', city: 'İzmir', lat: 38.403, lng: 27.144 },
  { placeId: 'tr-izm-009', name: 'Göztepe Sahil', district: 'Konak', city: 'İzmir', lat: 38.405, lng: 27.099 },
  { placeId: 'tr-izm-010', name: 'Üçkuyular İskele', district: 'Konak', city: 'İzmir', lat: 38.397, lng: 27.069 },
  { placeId: 'tr-izm-011', name: 'Basmane Garı', district: 'Konak', city: 'İzmir', lat: 38.42, lng: 27.14 },
  { placeId: 'tr-izm-012', name: 'Mavibahçe AVM', district: 'Konak', city: 'İzmir', lat: 38.444, lng: 27.133 },

  // İzmir — Karşıyaka
  { placeId: 'tr-izm-013', name: 'Karşıyaka İskele', district: 'Karşıyaka', city: 'İzmir', lat: 38.457, lng: 27.114 },
  { placeId: 'tr-izm-014', name: 'Karşıyaka Çarşı', district: 'Karşıyaka', city: 'İzmir', lat: 38.46, lng: 27.115 },
  { placeId: 'tr-izm-015', name: 'Bostanlı Vapur İskelesi', district: 'Karşıyaka', city: 'İzmir', lat: 38.467, lng: 27.103 },
  { placeId: 'tr-izm-016', name: 'Mavişehir', district: 'Karşıyaka', city: 'İzmir', lat: 38.473, lng: 27.077 },
  { placeId: 'tr-izm-017', name: 'Bostanlı Sahil', district: 'Karşıyaka', city: 'İzmir', lat: 38.461, lng: 27.099 },

  // İzmir — Bornova / Bayraklı / Buca / Gaziemir / Çiğli
  { placeId: 'tr-izm-018', name: 'Bornova Meydan', district: 'Bornova', city: 'İzmir', lat: 38.464, lng: 27.22 },
  { placeId: 'tr-izm-019', name: 'Forum Bornova AVM', district: 'Bornova', city: 'İzmir', lat: 38.47, lng: 27.218 },
  { placeId: 'tr-izm-020', name: 'Ege Üniversitesi', district: 'Bornova', city: 'İzmir', lat: 38.457, lng: 27.209 },
  { placeId: 'tr-izm-021', name: 'Bayraklı', district: 'Bayraklı', city: 'İzmir', lat: 38.464, lng: 27.158 },
  { placeId: 'tr-izm-022', name: 'Buca Meydan', district: 'Buca', city: 'İzmir', lat: 38.387, lng: 27.176 },
  { placeId: 'tr-izm-023', name: 'Şirinyer', district: 'Buca', city: 'İzmir', lat: 38.397, lng: 27.176 },
  { placeId: 'tr-izm-024', name: 'Gaziemir Merkez', district: 'Gaziemir', city: 'İzmir', lat: 38.318, lng: 27.139 },
  { placeId: 'tr-izm-025', name: 'Optimum Outlet', district: 'Gaziemir', city: 'İzmir', lat: 38.305, lng: 27.169 },
  { placeId: 'tr-izm-026', name: 'Adnan Menderes Havalimanı', district: 'Gaziemir', city: 'İzmir', lat: 38.292, lng: 27.157 },
  { placeId: 'tr-izm-027', name: 'Çiğli Merkez', district: 'Çiğli', city: 'İzmir', lat: 38.487, lng: 27.06 },

  // İzmir — Çevre ilçeler / sahil
  { placeId: 'tr-izm-028', name: 'Menemen', district: 'Menemen', city: 'İzmir', lat: 38.605, lng: 27.066 },
  { placeId: 'tr-izm-029', name: 'Aliağa', district: 'Aliağa', city: 'İzmir', lat: 38.799, lng: 26.972 },
  { placeId: 'tr-izm-030', name: 'Foça', district: 'Foça', city: 'İzmir', lat: 38.665, lng: 26.762 },
  { placeId: 'tr-izm-031', name: 'Urla', district: 'Urla', city: 'İzmir', lat: 38.323, lng: 26.766 },
  { placeId: 'tr-izm-032', name: 'Seferihisar', district: 'Seferihisar', city: 'İzmir', lat: 38.196, lng: 26.838 },
  { placeId: 'tr-izm-033', name: 'Çeşme Marina', district: 'Çeşme', city: 'İzmir', lat: 38.326, lng: 26.305 },
  { placeId: 'tr-izm-034', name: 'Alaçatı Eski Liman', district: 'Çeşme', city: 'İzmir', lat: 38.281, lng: 26.376 },
  { placeId: 'tr-izm-035', name: 'Selçuk (Efes)', district: 'Selçuk', city: 'İzmir', lat: 37.951, lng: 27.367 },
];

/**
 * Basit fuzzy arama: query'yi normalize edip name+district+city alanlarında eşleşme bulur,
 * skoruna göre sıralar. Limit varsayılan 6.
 */
export function searchMockPlaces(query: string, limit = 6): MockPlace[] {
  const q = normalizeTR(query.trim());
  if (q.length === 0) return [];

  const scored = MOCK_PLACES.map((p) => {
    const haystack = normalizeTR(`${p.name} ${p.district} ${p.city}`);
    const score = scoreMatch(haystack, q);
    return { p, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s) => s.p);
}

export function getMockPlaceById(placeId: string): MockPlace | null {
  return MOCK_PLACES.find((p) => p.placeId === placeId) ?? null;
}

function normalizeTR(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreMatch(haystack: string, needle: string): number {
  if (haystack.includes(needle)) {
    return haystack.startsWith(needle) ? 100 : 50;
  }
  const tokens = needle.split(' ').filter(Boolean);
  if (tokens.length === 0) return 0;
  const matchedTokens = tokens.filter((t) => haystack.includes(t));
  if (matchedTokens.length === tokens.length) return 30;
  if (matchedTokens.length > 0)
    return 10 * (matchedTokens.length / tokens.length);
  return 0;
}

export function placeLabel(p: MockPlace): string {
  return `${p.name}, ${p.district}/${p.city}`;
}

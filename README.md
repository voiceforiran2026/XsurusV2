# X — Sürüş & Gönderim Demo

Müşteri sunumu için Next.js 14 web demosu. Yolcu, sürücü ve admin panelleri tek uygulamada, mobile-first tasarım, B&W premium tema.

## Hızlı Başlangıç

```bash
npm install
npm run reset    # DB sil + push + zengin seed (~315 yolculuk)
npm run dev      # http://localhost:3000
```

> İlk seed `npm install` sonrası tek seferlik `npm run reset` ile yapılır. Sunum öncesi DB'yi yeniden seed etmek için **Demo paneli** üzerinden "Senaryoyu Sıfırla" da kullanılabilir.

## Demo Hesapları

| Rol | E-posta | Parola |
|---|---|---|
| Süper Admin | `admin@x.com` | `admin123` |
| Yolcu | `yolcu@x.com` | `yolcu123` |
| Sürücü | `surucu@x.com` | `surucu123` |
| 4 ek sürücü | `driver1-4@x.com` | `demo123` |
| 8 ek yolcu | `rider1-8@x.com` | `demo123` |

## 🎬 Demo Paneli

Sunum sırasında en altta sağda görünen **floating "Demo" butonuna** veya `Ctrl+Shift+D` tuşuna basın:

- 3 ana hesap arasında **tek tıkla** geçiş (parolasız)
- "Senaryoyu Sıfırla" → DB'yi sil + tekrar seed et (zengin veri için)
- Aktif olan hesap işaretli görünür

## Sunum Akışı

Demo aşağıdaki senaryoyu kesintisiz destekler. **3 sekme** açın:

1. **Sekme 1 — Admin** (`admin@x.com`)
   - `/admin` → 8 KPI kartı + aylık trend + saatlik dağılım + gelir donutu
   - `/admin/havuz` → para havuzu görseli (770k+ ₺ inflow, 3 alt kova)
2. **Sekme 2 — Yolcu** (`yolcu@x.com`) — `/yolcu`
3. **Sekme 3 — Sürücü** (`surucu@x.com`) — `/surucu` (Online toggle aktif)

### Senaryo akışı

| Adım | Sekme | İşlem | Beklenen |
|---|---|---|---|
| 1 | Yolcu | Ride seç, Taksim → Kadıköy autocomplete, "Hizmet Bul" | Talep oluştur, "Sürücü aranıyor…" ekranı |
| 2 | Sürücü | Modal otomatik açılır (pulse animasyon, 3 stat kartı) | Cross-tab broadcast ✅ |
| 3 | Sürücü | "Onayla" | "Yolculuğu Başlat" butonu |
| 4 | Yolcu | Otomatik geçiş "Sürücü onayladı" | Sürücü adı + plaka görünür |
| 5 | Sürücü | "Yolculuğu Başlat" → "Yolculuğu Bitir" | COMPLETED |
| 6 | Yolcu | **ChipGainBurst animasyonu** (sayaç + 12 partikül) | +X ₺ chip kazandın |
| 7 | Admin | Refresh KPI'lar, havuz büyür | money flow animasyonu (havuza akış) |
| 8 | Admin | `/admin/havuz` → "Şoför Ödemelerini Dağıt" | confirm dialog → 5 sürücüye 578k+ ₺ aktarım, money flow out animasyonu |

## Mimari

| Katman | Teknoloji |
|---|---|
| Framework | Next.js 14 App Router + TypeScript |
| Stil | Tailwind CSS + shadcn primitives (B&W tema) |
| Animasyon | Framer Motion |
| Grafik | Recharts (B&W custom tema) |
| DB | SQLite + Prisma |
| State | Zustand |
| Real-time | **BroadcastChannel API** (sekmeler arası), 3sn polling fallback |
| Auth | iron-session (httpOnly cookie, 7 gün) |
| Form | react-hook-form + zod |
| Harita | Mock + Google Places (env'de anahtar varsa) |

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu (3000) |
| `npm run build` | Üretim derlemesi |
| `npm start` | Üretim sunucusu |
| `npm test` | Vitest unit testleri (**82+ test**) |
| `npm run test:e2e` | Playwright (kurulum gerekirse: `npx playwright install`) |
| `npm run seed` | DB'ye seed (mevcut DB'ye eklemez — `reset` tercih edin) |
| **`npm run reset`** | **DB sil + push + seed** (sunum öncesi önerilir) |
| `npm run db:studio` | Prisma Studio (DB inceleme) |

## Ortam Değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayın (Prisma için ek olarak `.env`):

```env
DATABASE_URL="file:./dev.db"
SESSION_PASSWORD="32+ karakterli rastgele dize"
NEXT_PUBLIC_GOOGLE_MAPS_KEY=""   # Opsiyonel — yoksa mock fallback devreye girer
NEXT_PUBLIC_DEMO_MODE="true"     # Demo paneli + reset endpoint
```

## Klasör Yapısı

```
src/
├── app/                        Next.js App Router
│   ├── (auth)/                 /giris, /kayit-ol — split layout
│   ├── (rider)/yolcu/          Yolcu sayfaları (mobile frame)
│   ├── (driver)/surucu/        Sürücü sayfaları (mobile frame)
│   ├── (admin)/admin/          Admin sayfaları (sidebar layout)
│   └── api/                    REST endpoint'leri
├── components/
│   ├── ui/                     shadcn primitives
│   ├── layout/                 TopNav, Footer, AppShell, MobileFrame, ...
│   ├── marketing/              Hero, ServiceSelector, Stats, FAQ, ...
│   ├── ride/                   Map, autocomplete, fare, status flow, payment
│   ├── driver/                 OnlineToggle, IncomingRideModal, ActiveRide
│   ├── admin/                  KPI, charts, tables, PoolVisualizer
│   ├── payment/                3D card, chip wallet, AddCardForm
│   ├── animations/             ChipGainBurst, MoneyFlowAnim
│   └── common/                 EmptyState, Skeleton, ErrorBoundary, DemoQuickSwitch
├── lib/                        pricing, pool, chip, geo, places, auth, broadcast
├── stores/                     Zustand: auth, ride, driver
├── hooks/                      useBroadcastEvent, usePollingFallback
└── types/                      domain literal types
```

## Test Kapsamı

**82 unit test geçer:**

| Suite | Adet | Kapsam |
|---|---|---|
| `pricing.test.ts` | 17 | RIDE/GO fiyat, settle dağılım, chip ödeme, **havuz invariant 100 farklı ücrette** |
| `pool.test.ts` | 8 | Ledger üretimi, **invariant 200 farklı ücrette** |
| `cards.test.ts` | 21 | Brand detect (Visa/MC/Amex/Troy), Luhn, expiry, mask |
| `chip.test.ts` | 8 | Earn/spend snapshot, lifetime sayaçları |
| `places.test.ts` | 9 | TR fuzzy search, normalize |
| `geo.test.ts` | 5 | Haversine + road factor |
| `auth.test.ts` | 4 | Role helpers |
| `smoke.test.ts` | 10 | format, cn, domain types |

**Finansal invariant doğrulanır:**
- `driverEarning + systemCommission + chipReward === finalFare` (yuvarlama farkı sistem komisyonuna)
- `lifetimeEarned == sum(earns)`, `lifetimeSpent == sum(spends)`
- `RIDE_INFLOW == DRIVER_PAYOUT + CHIP_RESERVE + COMMISSION`
- `driver.paidBalance + driver.unpaidBalance == driver.totalEarnings`

## Sorun Giderme

- **Prisma `Environment variable not found: DATABASE_URL`:** Hem `.env` hem `.env.local` olduğundan emin olun. Prisma CLI sadece `.env`'i okur.
- **`npm run dev` 3000 portu meşgul:** Next.js otomatik 3001'e kayar.
- **Demo paneli görünmüyor:** `NEXT_PUBLIC_DEMO_MODE="true"` ayarlı mı?
- **Google Maps yüklenmedi:** Anahtar boşsa otomatik mock fallback'e düşer; sunumda fark edilmez.
- **Aktif yolculuk yok ama "Bekleyen ödeme" 0:** Bir yolcu+sürücü turunda yeni veri oluşur. Hızlı reset için Demo paneli → "Senaryoyu Sıfırla".

## Vercel'a Deploy

Proje Vercel için hazır. **GitHub repo'sunu Vercel'a bağlayın** ve aşağıdaki Environment Variables'ı tanımlayın:

| Anahtar | Değer | Açıklama |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | Build zamanı için (runtime'da otomatik `/tmp/x-surus.db`'ye kopyalanır) |
| `SESSION_PASSWORD` | 32+ karakterli rastgele dize | iron-session imzalama. **Yeni üretin**, repo'daki demo değeri kullanmayın |
| `GOOGLE_PLACES_KEY` | (opsiyonel) Google Places API key | Boşsa mock fallback devreye girer |
| `NEXT_PUBLIC_DEMO_MODE` | `true` | Demo paneli + reset endpoint'i açar |

**Build Command:** `npm run vercel-build` (Vercel otomatik tanır)
**Output:** Next.js (otomatik tespit)

### SQLite + Vercel notu

SQLite Vercel'ın serverless lambda'larında **sadece-okuma** durumda gelir. Build sırasında `prisma/dev.db` seed'lenir, lambda'ya bundle edilir, runtime cold start'ta `/tmp/x-surus.db`'ye kopyalanır → yazma çalışır. **Yazılan veriler lambda instance ömrü kadar yaşar**, cold start'ta seed'e döner. Demo için yeterli.

Production yazma kalıcılığı için: Turso (libSQL) veya Postgres (Neon/Vercel Postgres) → `prisma/schema.prisma`'da provider değiştirip `DATABASE_URL`'i güncelleyin.

## Sunum Kontrol Listesi

Sunum öncesi:

- [ ] `npm run reset` çalıştırıldı, **315 yolculuk seed edildi**
- [ ] `npm run dev` çalışıyor
- [ ] 3 tarayıcı sekmesi: admin / yolcu / sürücü açık
- [ ] Sürücü çevrimiçi (panel butonundan toggle)
- [ ] `/admin/havuz` sayfasında bekleyen ~578k ₺ görünür
- [ ] Demo paneli (`Ctrl+Shift+D`) çalışır

Sunum sonrası başka demo için:

- [ ] Demo paneli → "Senaryoyu Sıfırla"

---

**Geliştirilen fazlar:** 0-9 (PLAN.md'de detaylı). Tüm kabul kriterleri sağlandı.

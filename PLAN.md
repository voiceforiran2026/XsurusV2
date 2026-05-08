# X — Sürüş & Gönderim Web Demosu | PLAN.md

> **Sürüm:** 1.0
> **Tarih:** 2026-05-06
> **Hedef:** Müşteri sunumunda kullanılacak, satış odaklı, "wow" hissiyatı veren, mobile-first Next.js demosu.
> **Ana ilkeler:** Plana sadakat • Faz bazlı ilerleme • Her fazda test • Sıfır kırık özellik

---

## 1. Yönetici Özeti

X, hem yolcu taşıma (Ride) hem de gönderi (Go) hizmeti sunan bir mobilite platformudur. Bu demo:

- 3 sabit hesap (admin, yolcu, sürücü) ile uçtan uca senaryo yürütür
- Aynı tarayıcıda farklı sekmelerde açık üç hesap arasında **gerçek zamanlı hissiyatla** çalışır
- Ana iş akışı: **Yolcu talep → Sürücü onay → Yolculuk → Tamamlanma → Chip kazanımı → Admin KPI'larında güncelleme → Havuz dağıtımı**
- Tek bir komutla seed edilir, sıfır API anahtarı olmadan bile **demo mode**'da çalışır (Google Maps anahtarı varsa otomatik yükseltir)

**Başarı kriteri:** Sunum senaryosu refresh, console hatası, kırık görsel olmadan akıcı çalışır.

---

## 2. Teknoloji Kararları ve Alternatifler

| Katman | Tercih | Karar gerekçesi / öneri |
|---|---|---|
| Framework | **Next.js 14 App Router + TypeScript** | Onaylandı |
| Styling | **Tailwind CSS + shadcn/ui** (`new-york` stili) | `new-york` daha temiz/minimal — referansla birebir uyumlu |
| Animasyonlar | **Framer Motion** | Onaylandı |
| Grafikler | **Recharts** | Onaylandı; tema rengini siyah-beyaza zorlamak için ortak Chart wrapper yazılacak |
| Harita | **Google Maps JavaScript API + Places Autocomplete** | Onaylandı, **fakat:** API anahtarı yoksa demo çökmesin diye **Leaflet + OpenStreetMap fallback**'i (önceden yüklü TR şehir veriseti ile) hazırlanacak. Sunum makinesinde anahtar olduğu varsayılır; safe path her durumda korunur. |
| Konum arama | Google Places Autocomplete + curated TR mock dataset | API anahtarı varsa Google, yoksa kurated mock (50+ TR adresi) ile çalışır |
| State | **Zustand** + persist middleware | Onaylandı |
| Veri | **SQLite + Prisma** | Taşınabilir, sıfır kurulum; sunum laptop'unda dosya olarak gider |
| Real-time | **BroadcastChannel API + 3sn polling fallback** | **Önemli öneri:** Socket.io yerine browser-native `BroadcastChannel` kullanmak demo için **çok daha iyi**: aynı makinedeki sekmeler arasında 0 ms gecikmeyle sync, sıfır altyapı, sıfır port çakışması. Sunum tek laptopta yapılacağı için ideal. Polling endpoint'i de mevcut, böylece kıyafet farklı tarayıcıda açılırsa bile çalışır. |
| Auth | **Iron-session** (cookie-based, JWT-free) | Demo için hafif, prod'a geçiş kolay |
| Test | **Vitest** (unit) + **Playwright** (E2E kritik akışlar) | Vitest hızlı; Playwright sunum-kritik senaryoları doğrular |
| Form | **react-hook-form + zod** | Onaylandı |
| İkonlar | **Lucide React** | Onaylandı |
| i18n | next-intl iskeleti (TR-only ship) | Üstte `TR` switcher görünür ama demo'da TR-only; "EN yakında" rozeti |

**Ek demo araçları:**
- `<DemoQuickSwitch />` — sadece dev'de görünen, sunucuda gizli, presenter'ın hesaplar arası 1 tıkla geçmesini sağlayan floating panel (`Ctrl+Shift+D` ile aç/kapa)
- Console'a kasten istisna sızdırmamak için root error boundary

---

## 3. Klasör Yapısı

```
x-surus/
├── PLAN.md
├── README.md                           # Sunum kurulum talimatları
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── .env.example                        # GOOGLE_MAPS_KEY=, DATABASE_URL=
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                         # npm run seed
├── public/
│   ├── images/                         # car, scooter, hero illüstrasyonları
│   └── icons/
├── tests/
│   ├── unit/                           # Vitest
│   │   ├── pricing.test.ts
│   │   ├── chip.test.ts
│   │   ├── pool.test.ts
│   │   └── stores.test.ts
│   └── e2e/                            # Playwright
│       └── happy-path.spec.ts          # Yolcu→Sürücü→Admin senaryosu
└── src/
    ├── app/
    │   ├── (marketing)/                # Public sayfa grubu
    │   │   ├── layout.tsx              # TopNav + Footer
    │   │   ├── page.tsx                # Ana sayfa (hero + service selector + stats)
    │   │   ├── hizmetler/page.tsx
    │   │   ├── nasil-calisir/page.tsx
    │   │   ├── kariyer/page.tsx
    │   │   ├── kurumsal/page.tsx
    │   │   └── yardim/page.tsx
    │   ├── (auth)/
    │   │   ├── giris/page.tsx
    │   │   └── kayit-ol/page.tsx
    │   ├── (rider)/yolcu/
    │   │   ├── layout.tsx              # RiderShell + bottom nav
    │   │   ├── page.tsx                # Talep oluşturma (harita + 2 alan)
    │   │   ├── arama/page.tsx          # "Sürücü aranıyor..." + canlı durum
    │   │   ├── yolculuklarim/page.tsx
    │   │   ├── cuzdan/page.tsx
    │   │   ├── kart-ekle/page.tsx      # 3D animasyonlu kart
    │   │   └── profil/page.tsx
    │   ├── (driver)/surucu/
    │   │   ├── layout.tsx              # DriverShell + bottom nav
    │   │   ├── page.tsx                # Online toggle + harita + gelen talepler
    │   │   ├── aktif/page.tsx          # Aktif yolculuk yönetimi
    │   │   ├── kazanc/page.tsx
    │   │   ├── yolculuklarim/page.tsx
    │   │   └── profil/page.tsx
    │   ├── (admin)/admin/
    │   │   ├── layout.tsx              # AdminShell + sidebar
    │   │   ├── page.tsx                # Dashboard (KPI + grafikler)
    │   │   ├── yolculuklar/page.tsx
    │   │   ├── suruculer/page.tsx
    │   │   ├── yolcular/page.tsx
    │   │   ├── havuz/page.tsx          # Para havuzu görselleştirme
    │   │   ├── finans/page.tsx
    │   │   └── ayarlar/page.tsx
    │   ├── api/
    │   │   ├── auth/[...]
    │   │   ├── rides/[...]
    │   │   ├── me/[...]
    │   │   ├── driver/[...]
    │   │   ├── admin/[...]
    │   │   └── places/[...]
    │   ├── globals.css
    │   ├── layout.tsx                  # Root: ThemeProvider + Toaster + DemoQuickSwitch
    │   └── not-found.tsx
    ├── components/
    │   ├── ui/                         # shadcn primitives (button, card, dialog, ...)
    │   ├── layout/                     # TopNav, Footer, RiderBottomNav, DriverBottomNav, AdminSidebar
    │   ├── marketing/                  # Hero, ServiceSelectorCard, StatsStrip, FeatureGrid, FaqAccordion, CareerSection, AppDownloadSection
    │   ├── ride/                       # MapPicker, AddressAutocomplete, FareEstimateCard, RequestSummary, RideStatusFlow, RouteMiniMap
    │   ├── driver/                     # OnlineToggle, IncomingRideModal, ActiveRideCard, EarningsSummary
    │   ├── admin/                      # KpiCard, MonthlyTrendChart, HourlyDistributionChart, RevenueDonut, RidesTable, PoolVisualizer, PayoutButton, FilterBar
    │   ├── payment/                    # CreditCard3D, AddCardForm, ChipBalanceCard, ChipTransactionList
    │   ├── animations/                 # ChipGainBurst, MoneyFlowAnim, PulseRing, ConfettiOnce
    │   ├── common/                     # EmptyState, LoadingSkeleton, ErrorBoundary, DemoQuickSwitch
    │   └── icons/                      # XLogo, customs
    ├── lib/
    │   ├── auth/                       # iron-session config, getCurrentUser
    │   ├── db.ts                       # Prisma client singleton
    │   ├── pricing.ts                  # Saf hesap fonksiyonları (test edilebilir)
    │   ├── pool.ts                     # Havuz akışı saf fonksiyonları
    │   ├── chip.ts                     # Chip kazanım/harcama
    │   ├── geo.ts                      # Haversine, polyline encode
    │   ├── places.ts                   # Google + mock fallback adapter
    │   ├── broadcast.ts                # BroadcastChannel wrapper (SSR-safe)
    │   ├── api.ts                      # fetch wrapper, error handling
    │   └── format.ts                   # TL, tarih, mesafe formatters (TR locale)
    ├── stores/
    │   ├── useAuthStore.ts
    │   ├── useRideStore.ts
    │   ├── useDriverStore.ts
    │   ├── useNotificationStore.ts
    │   └── useBroadcastStore.ts
    ├── hooks/
    │   ├── useBroadcastEvent.ts
    │   ├── usePollingFallback.ts
    │   ├── useGoogleMaps.ts
    │   └── useReducedMotion.ts
    ├── types/
    │   ├── domain.ts                   # Ride, User, ChipTx, ...
    │   └── api.ts                      # Request/Response zod şemaları
    └── styles/
        └── tokens.css                  # CSS değişkenleri (renk, spacing, motion)
```

---

## 4. Tasarım Sistemi (B&W Premium)

### Renkler (Tailwind tokenları)
- `bg-canvas` → `#0A0A0A` (siyah arka plan)
- `bg-surface` → `#FFFFFF` (kart yüzey)
- `bg-surface-dark` → `#141414` (koyu kart)
- `border-subtle` → `#E5E5E5` / `#1F1F1F`
- `text-primary` → `#000000` / `#FAFAFA`
- `text-muted` → `#737373`
- `accent` → siyahın kendisi; vurgu gerekirse `#1A1A1A` veya beyaz invert

### Tipografi
- Font: **Inter** (Google Fonts) + Türkçe glyph desteği için subset `latin-ext`
- Heading scale: 56 / 40 / 32 / 24 / 20 / 16 (tracking: -0.02em)
- Body: 16/24, secondary 14/20

### Spasyon ve şekil
- `rounded-2xl` (16px) standart kart; CTA'lar `rounded-full`
- `shadow-soft`: `0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)`
- Grid: 4/8 spacing

### Hareket dili
- Default easing: `cubic-bezier(0.16, 1, 0.3, 1)` (smooth-out)
- Sayfa girişi: 200ms fade + 8px translateY
- Hover'lar: 150ms
- Önemli olaylar (chip kazanımı, havuz hareketi): spring + parlama
- `prefers-reduced-motion` saygısı: tüm büyük animasyonlar kapalı duruma düşer

### Mobile-first kuralları
- Tüm public sayfalar 375px viewport'ta mükemmel; max-w-`xl` desktop'ta merkez
- Yolcu/sürücü sayfaları **her zaman** mobil mock frame içinde değil, gerçek mobil layout — desktop'ta bile dar viewport gibi davranır (max-w-md, ortalanmış, ama gölgeli mobil çerçeve seçeneği toggle ile)
- Admin paneli desktop-first, tablet'e responsive

---

## 5. Veritabanı Şeması (Prisma)

> **Not (2026-05-06):** SQLite, Prisma'da `enum` desteklemediği için tüm enum-benzeri alanlar **`String` + TypeScript literal type** olarak tanımlanır. Geçerli değerler `src/types/domain.ts`'te `as const` literal union'lar olarak tutulur ve zod ile API sınırında doğrulanır.

```prisma
generator client { provider = "prisma-client-js" }
datasource db   { provider = "sqlite"; url = env("DATABASE_URL") }

// Enum-benzeri alanlar TypeScript tarafında literal union olarak:
//   Role         = 'ADMIN' | 'RIDER' | 'DRIVER'
//   ServiceType  = 'RIDE' | 'GO'
//   RideStatus   = 'PENDING' | 'ACCEPTED' | 'EN_ROUTE_TO_PICKUP' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
//   PaymentMethod= 'CARD' | 'CHIP'
//   ChipTxType   = 'EARN_FROM_RIDE' | 'SPEND_ON_RIDE' | 'ADJUSTMENT'
//   LedgerType   = 'RIDE_INFLOW' | 'DRIVER_PAYOUT' | 'CHIP_RESERVE' | 'COMMISSION' | 'CHIP_REDEMPTION' | 'PAYOUT_SETTLEMENT'

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  passwordHash  String
  fullName      String
  phone         String?
  role          String         // 'ADMIN' | 'RIDER' | 'DRIVER'
  language      String         @default("tr")
  avatarUrl     String?
  createdAt     DateTime       @default(now())
  riderRides    Ride[]         @relation("rider")
  driverRides   Ride[]         @relation("driver")
  cards         PaymentCard[]
  chipBalance   ChipBalance?
  chipTxs       ChipTransaction[]
  driverProfile DriverProfile?
  riderProfile  RiderProfile?
  notifications Notification[]
}

model DriverProfile {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  vehicleModel  String
  plateNumber   String
  rating        Float    @default(5.0)
  isOnline      Boolean  @default(false)
  totalEarnings Float    @default(0)   // tüm zamanların
  unpaidBalance Float    @default(0)   // havuzda biriken (henüz ödenmemiş)
  paidBalance   Float    @default(0)
  totalRides    Int      @default(0)
  currentLat    Float?
  currentLng    Float?
  lastSeenAt    DateTime @default(now())
}

model RiderProfile {
  id         String @id @default(cuid())
  userId     String @unique
  user       User   @relation(fields: [userId], references: [id])
  totalRides Int    @default(0)
  totalSpent Float  @default(0)
  rating     Float  @default(5.0)
}

model Ride {
  id               String        @id @default(cuid())
  serviceType      String        // 'RIDE' | 'GO'
  status           String        @default("PENDING") // RideStatus
  riderId          String
  rider            User          @relation("rider", fields: [riderId], references: [id])
  driverId         String?
  driver           User?         @relation("driver", fields: [driverId], references: [id])
  pickupAddress    String
  pickupLat        Float
  pickupLng        Float
  dropoffAddress   String
  dropoffLat       Float
  dropoffLng       Float
  distanceKm       Float
  estimatedFare    Float
  finalFare        Float?
  driverEarning    Float?
  systemCommission Float?
  chipReward       Float?
  paymentMethod    String        @default("CARD") // PaymentMethod
  requestedAt      DateTime      @default(now())
  acceptedAt       DateTime?
  startedAt        DateTime?
  completedAt      DateTime?
  cancelledAt      DateTime?
  cancelReason     String?
  rating           Int?
  @@index([status])
  @@index([riderId])
  @@index([driverId])
  @@index([requestedAt])
}

model PaymentCard {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  cardholderName String
  last4          String
  brand          String
  expiryMonth    Int
  expiryYear     Int
  isDefault      Boolean  @default(false)
  createdAt      DateTime @default(now())
}

model ChipBalance {
  id              String @id @default(cuid())
  userId          String @unique
  user            User   @relation(fields: [userId], references: [id])
  balance         Float  @default(0)
  lifetimeEarned  Float  @default(0)
  lifetimeSpent   Float  @default(0)
}

model ChipTransaction {
  id          String      @id @default(cuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  amount      Float
  type        String      // ChipTxType
  rideId      String?
  description String
  createdAt   DateTime    @default(now())
  @@index([userId])
}

model PoolLedger {
  id          String     @id @default(cuid())
  type        String     // LedgerType
  amount      Float
  rideId      String?
  driverId    String?
  description String
  createdAt   DateTime   @default(now())
  @@index([type])
  @@index([createdAt])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      String
  title     String
  body      String
  data      String?  // JSON
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  @@index([userId, read])
}

model AppSetting {
  key   String @id
  value String
}
```

---

## 6. Fiyatlandırma ve Para Modeli (sabitler — `lib/pricing.ts`)

```ts
const PRICING = {
  RIDE: { base: 25, perKm: 12 },   // ₺
  GO:   { base: 25, perKm: 12 },   // RIDE ile aynı (kullanıcı kararı 2026-05-06)
  driverShare:      0.75,
  systemCommission: 0.15,
  chipReward:       0.10,         // yolcuya bonus (₺ değeri)
};
// 1 chip = 1 ₺ (basitlik için)
// Toplam yolculuk → %75 sürücü + %15 sistem + %10 chip = %100
// Chip ile ödeme aktif: yolcu sonraki yolculukta bakiyesini kullanabilir
```

**Havuz akışı (her tamamlanan yolculukta):**
1. `RIDE_INFLOW` ledger kaydı (+ finalFare)
2. `DRIVER_PAYOUT` ledger kaydı (- driverEarning) ile sürücünün `unpaidBalance` artar
3. `CHIP_RESERVE` ledger kaydı (- chipReward); yolcunun chip bakiyesi + bu miktar
4. Net komisyon = `RIDE_INFLOW - DRIVER_PAYOUT - CHIP_RESERVE` = `COMMISSION`

**"Şoför Ödemelerini Dağıt" butonu:**
- Tüm sürücülerin `unpaidBalance` → `paidBalance` taşır
- Her sürücü için `DRIVER_PAYOUT` ledger satırı (settled flag)
- Animasyon: havuzdan paralar akar, sürücü kartlarındaki sayaç artar

---

## 7. Rota Haritası

| Rota | Tip | Açıklama |
|---|---|---|
| `/` | public | Ana sayfa (hero + Ride/Go selector + stats) |
| `/hizmetler` | public | X Ride / X Go detay |
| `/nasil-calisir` | public | 3 adımlı süreç |
| `/kariyer` | public | Açık pozisyonlar |
| `/kurumsal` | public | Kurumsal çözümler |
| `/yardim` | public | FAQ accordion |
| `/giris` | public | Login |
| `/kayit-ol` | public | Register (görsel + demo hesapları yönlendirme) |
| `/yolcu` | rider | Talep oluşturma |
| `/yolcu/arama` | rider | "Sürücü aranıyor..." (canlı status) |
| `/yolcu/yolculuklarim` | rider | Geçmiş + aktif |
| `/yolcu/cuzdan` | rider | Chip + kartlar |
| `/yolcu/kart-ekle` | rider | 3D kart ekleme |
| `/yolcu/profil` | rider | Profil |
| `/surucu` | driver | Online toggle + gelen talepler |
| `/surucu/aktif` | driver | Aktif yolculuk |
| `/surucu/kazanc` | driver | Kazanç paneli |
| `/surucu/yolculuklarim` | driver | Geçmiş |
| `/surucu/profil` | driver | Profil |
| `/admin` | admin | KPI dashboard |
| `/admin/yolculuklar` | admin | Filtrelenebilir tablo |
| `/admin/suruculer` | admin | Tablo |
| `/admin/yolcular` | admin | Tablo |
| `/admin/havuz` | admin | **Para havuzu görselleştirme** |
| `/admin/finans` | admin | Finansal raporlar |
| `/admin/ayarlar` | admin | App settings |

---

## 8. API Sözleşmesi

| Endpoint | Method | Yetki | Amaç |
|---|---|---|---|
| `/api/auth/login` | POST | public | email+password → cookie session |
| `/api/auth/logout` | POST | any | session yok et |
| `/api/auth/me` | GET | any | mevcut kullanıcı |
| `/api/auth/register` | POST | public | demo: hesap yaratmadan giriş yönlendirir |
| `/api/places/autocomplete?q=` | GET | any | Google proxy / mock fallback |
| `/api/places/details?placeId=` | GET | any | Lat/lng döner |
| `/api/rides/quote` | POST | rider | from/to → distance + fare tahmini |
| `/api/rides` | POST | rider | yeni talep (PENDING) → broadcast `ride:new` |
| `/api/rides/pending` | GET | driver | bekleyen taleplerin listesi (polling fallback) |
| `/api/rides/:id` | GET | role-based | detay |
| `/api/rides/:id/accept` | POST | driver | ACCEPTED → broadcast `ride:accepted` |
| `/api/rides/:id/start` | POST | driver | IN_PROGRESS |
| `/api/rides/:id/complete` | POST | driver | COMPLETED + finansal sonuçlandırma + chip + havuz → broadcast `ride:completed` |
| `/api/rides/:id/cancel` | POST | rider/driver | CANCELLED |
| `/api/me/rides` | GET | rider/driver | rol bazlı geçmiş |
| `/api/me/cards` | GET/POST | any | kart listele/ekle (mock — gerçek pan saklamaz) |
| `/api/me/cards/:id` | DELETE | any | sil |
| `/api/me/chip` | GET | any | bakiye + tx listesi |
| `/api/me/notifications` | GET | any | bildirimler |
| `/api/driver/online` | GET/POST | driver | online durumu |
| `/api/admin/kpis` | GET | admin | dashboard KPI'ları |
| `/api/admin/charts/monthly` | GET | admin | aylık trend |
| `/api/admin/charts/hourly` | GET | admin | saatlik dağılım |
| `/api/admin/charts/distribution` | GET | admin | gelir dağılımı (donut) |
| `/api/admin/pool` | GET | admin | havuz durumu |
| `/api/admin/pool/payout` | POST | admin | sürücü ödemelerini dağıt → broadcast `pool:payout` |

Tüm endpoint'ler `zod` ile valide edilir; başarısız → tutarlı `{ error, code, fields? }` formatı.

---

## 9. State Yönetimi

| Store | Sorumluluk |
|---|---|
| `useAuthStore` | currentUser, login/logout, role-based redirects |
| `useRideStore` | aktif/son talep edilen yolculuk durumu (rider context) |
| `useDriverStore` | sürücünün online toggle'ı, gelen talep, aktif yolculuk |
| `useNotificationStore` | toast queue, badge sayısı |
| `useBroadcastStore` | sekmeler arası event hub (BroadcastChannel `x-surus`) |

**Kritik desen:** Hiçbir UI state'i sunucuyla **tek kaynak** kabul edilmez. Her state Zustand'da tutulur, mutasyondan sonra fetch ile doğrulanır. BroadcastChannel mesajı geldiğinde ilgili query invalidate edilir.

---

## 10. Real-time Hissiyatı (BroadcastChannel)

Aynı tarayıcıda 3 sekme açık (admin, yolcu, sürücü) senaryosu için:

```ts
// lib/broadcast.ts
const channel = new BroadcastChannel('x-surus');
type Event =
  | { type: 'ride:new';        rideId: string; serviceType: 'RIDE' | 'GO' }
  | { type: 'ride:accepted';   rideId: string; driverId: string }
  | { type: 'ride:started';    rideId: string }
  | { type: 'ride:completed';  rideId: string; chipReward: number }
  | { type: 'ride:cancelled';  rideId: string }
  | { type: 'pool:payout';     totalAmount: number }
  | { type: 'driver:online';   driverId: string; isOnline: boolean };
```

API endpoint'leri sunucuda mutate ettikten **sonra** client tarafında ilgili event broadcast edilir. Diğer sekmeler:
- Yolcu sekmesi `ride:accepted` aldığında "arama" sayfasından "yolda" durumuna geçer
- Sürücü sekmesi `ride:new` aldığında pulse animasyonlu modal açar
- Admin sekmesi `ride:completed` aldığında KPI'ları yeniden çeker (parlama efekti ile)

**Polling fallback:** `usePollingFallback(endpoint, 3000)` — BroadcastChannel desteklenmezse devreye girer.

---

## 11. Test Stratejisi

### Unit (Vitest)
- `pricing.test.ts` — RIDE/GO kombinasyonları, sınır mesafeler, yuvarlama
- `chip.test.ts` — kazanım, harcama, lifetime sayaçları
- `pool.test.ts` — havuz akışı: inflow → driver payout → chip reserve → commission **toplam = inflow** kontrolü
- `geo.test.ts` — haversine
- `stores.test.ts` — Zustand transitions

### E2E (Playwright) — sunum-kritik happy path
1. Admin olarak giriş, KPI'ları yakala
2. Yolcuya geç (storage state), yolculuk talep et
3. Sürücüye geç, gelen talebi onayla, başlat, bitir
4. Yolcuya dön, chip kazanımının düştüğünü doğrula
5. Admin'e dön, KPI'nın arttığını doğrula
6. "Şoför Ödemelerini Dağıt" tıkla, havuzun sıfırlandığını doğrula

### Component testleri
- `CreditCard3D` — yazınca güncellenir, "CVV" odağında döner
- `IncomingRideModal` — onayla → başarı; pas geç → tekrar listeye
- `KpiCard` — animasyonlu sayaç doğru hedefe ulaşır

### Akış kuralı
- **Her faz başında** `npm test` ve `npm run test:e2e:smoke` (sadece kritik path) yeşil olmalı
- **Her faz sonunda** o fazın kabul testleri eklenip yeşil bırakılır

---

## 12. Seed Verisi (`prisma/seed.ts`)

3 ana kullanıcı + zengin geçmiş:
- **Admin:** `admin@x.com` / `admin123`
- **Yolcu:** `yolcu@x.com` / `yolcu123` — 12 geçmiş yolculuk, 240 chip
- **Sürücü:** `surucu@x.com` / `surucu123` — Mercedes E-Class, plaka `34 X 0001`, 28 geçmiş yolculuk
- **Ek:** 4 yardımcı sürücü (admin tablolarını dolu göstermek için), 8 yardımcı yolcu

**Yolculuk dağılımı (son 90 gün):**
- ~220 yolculuk (yardımcı kullanıcılar arası)
- Saat dağılımı: 07-10 ve 17-20 zirve (gerçekçi)
- Haftaiçi/sonu dengeli (cumartesi gece zirve)
- %85 RIDE, %15 GO
- Lokasyonlar: İstanbul/Ankara/İzmir mahalle adresleri (curated dataset, 50+ koordinat)

**Çıktı amacı:**
- Aylık trend grafiği görsel zengin
- Saatlik bar chart belirgin tepe noktalarına sahip
- Donut chart anlamlı yüzdeler gösterir
- Tablolarda 200+ satır var, sayfalama meaningful

---

## 13. Faz Bazlı Geliştirme Planı

Her faz için: **Kapsam → Kabul kriteri → Test eki → Çıkış kontrolü**.

### Faz 0 — Proje Kurulumu, Tasarım Sistemi, Layout
**Kapsam:**
- Next.js 14 + TS + Tailwind + shadcn/ui (`new-york`) kurulumu
- Inter fontu, color tokens, motion tokens, `globals.css`
- Prisma + SQLite + ilk migration (boş şema)
- iron-session, lib/db, lib/format, lib/api iskelet
- TopNav, Footer, Container, AppShell, EmptyState, LoadingSkeleton, ErrorBoundary
- Vitest + Playwright kurulumu, smoke test
- README.md (sunum kurulum talimatları)
- `.env.example`

**Kabul kriteri:**
- `npm run dev` çalışır, ana sayfa boş hero + nav görünür
- `npm test` yeşil (smoke), `npm run lint` yeşil, `npm run build` yeşil
- Tasarım tokenleri `globals.css`'te live ve görsel olarak doğrulanmış (B&W, Inter, rounded-2xl)

### Faz 1 — Auth + Boş Dashboard'lar
**Kapsam:**
- Prisma schema'nın User/Role/Profile bölümleri + migration
- Seed: 3 ana kullanıcı (henüz yolculuk yok)
- `/giris` formu (zod + react-hook-form)
- `/kayit-ol` görsel formu (POST mock — başarılı dönüş + giriş yönlendirme)
- iron-session entegrasyonu, role-based middleware
- 3 boş dashboard iskeleti: `/yolcu`, `/surucu`, `/admin`
- Logout
- `useAuthStore` + role-based redirects

**Kabul kriteri:**
- 3 hesapla giriş başarılı, doğru dashboard'a yönlenir
- Yanlış parola → form hatası
- Login yapmadan korumalı sayfaya gitmek `/giris`'e yönlendirir
- Test: `auth.test.ts` (login happy + invalid + role redirect)

### Faz 2 — Public Marketing Sayfaları
**Kapsam:**
- Ana sayfa: hero (büyük başlık + arka plan görseli), `<ServiceSelectorCard>` (Ride/Go tabs, Nereden/Nereye, Hizmet Bul CTA), `<StatsStrip>`
- `/nasil-calisir` (3 adım kart)
- `/hizmetler` (X Ride + X Go detay kartları)
- `/kariyer` (referans görseldeki layout, açık pozisyonlar dummy)
- `/kurumsal` (basit içerik)
- `/yardim` (FAQ accordion)
- Footer (X logo, sosyal, store badges, link sütunları)
- Mikrointeraksiyonlar: nav hover, CTA hover, accordion açılış

**Kabul kriteri:**
- 6 public sayfa referans görselle birebir uyumlu
- 375px viewport'ta hiçbir overflow/kayma yok
- Lighthouse mobil performans > 85
- Erişilebilirlik: keyboard nav, focus rings, accordion ARIA

### Faz 3 — Yolcu Akışı (Talep + Quote + Places)
**Kapsam:**
- `lib/places.ts` adapter (Google + curated mock fallback)
- `<AddressAutocomplete>` (debounce, Lucide pin icon, klavye nav)
- `<MapPicker>` (harita üzerinde tıklayarak pin)
- `lib/pricing.ts` saf fonksiyonlar
- `/api/rides/quote` endpoint
- `/yolcu` ana sayfası: harita (üst), iki autocomplete + ücret kartı (alt)
- "Hizmet Bul" → POST `/api/rides` → `/yolcu/arama` (ride status flow)
- `<RideStatusFlow>` görsel (PENDING → ACCEPTED → IN_PROGRESS → COMPLETED)

**Kabul kriteri:**
- Adres ara → seç → lat/lng dolu → mesafe + ücret canlı
- Quote API <100ms (mock path), <500ms (Google path)
- Talep oluştu → DB'de PENDING kaydı, BroadcastChannel `ride:new` yayınlandı
- Test: `pricing.test.ts`, `places.test.ts`, `ride-quote.api.test.ts`

### Faz 4 — Sürücü Akışı
**Kapsam:**
- `<OnlineToggle>` (büyük, animasyonlu, broadcast `driver:online`)
- `<IncomingRideModal>` — `ride:new` event'inde modal açılır (yolcu, alış-varış, mesafe, tahmini kazanç)
- Onayla → `/api/rides/:id/accept` → `/surucu/aktif`
- Pas geç → modal kapanır, tekrar listeye
- `/surucu/aktif`: rota mini harita, "Yolculuğu Başlat" → "Yolculuğu Bitir"
- `/surucu/kazanc` (boş — Faz 6'da dolacak)

**Kabul kriteri:**
- Yolcu sekmesinden talep oluştu → sürücü sekmesinde 100ms içinde modal açıldı
- Onayla → yolcu sekmesi otomatik "Sürücü onayladı" durumuna geçti
- Test: E2E happy path adım 2-3

### Faz 5 — Ödeme: 3D Kart + Chip Cüzdanı
**Kapsam:**
- `<CreditCard3D>` — Framer Motion ile 3D flip, canlı yazı güncelleme, brand detection (Visa/Mastercard) ilk rakamlardan
- `<AddCardForm>` — react-hook-form + zod, Luhn doğrulaması (mock)
- `/yolcu/kart-ekle` sayfası
- `/yolcu/cuzdan` — chip bakiyesi büyük rakam, kart listesi, transaction listesi
- `lib/chip.ts` saf fonksiyonlar
- `/api/me/cards` CRUD, `/api/me/chip`

**Kabul kriteri:**
- Kart yazılırken canlı görünüyor, CVV alanına geçince dönüyor
- Kart ekle → liste güncelleniyor, default flag çalışıyor
- Test: `<CreditCard3D>` testi, `chip.test.ts`

### Faz 6 — Yolculuk Yaşam Döngüsü ve Finansal Sonuçlandırma
**Kapsam:**
- `/api/rides/:id/complete` — finalFare → driverEarning + commission + chipReward bölünür, ledger satırları yazılır, sürücü unpaidBalance artar, yolcu chipBalance artar
- Yolcu sekmesinde `<ChipGainBurst>` animasyonu (sayaç artışı + parlama)
- `/yolcu/yolculuklarim` listesi (rota mini map, ücret, chip kazanımı)
- `/surucu/yolculuklarim` listesi
- `/surucu/kazanc` paneli (bugün/hafta/ay)
- Test: `pool.test.ts` — bir tamamlanan yolculuk → 3 ledger satırı, `inflow == driverEarning + chipReserve + commission`

**Kabul kriteri:**
- Sürücü "Yolculuğu Bitir" → 1 saniye içinde yolcu sekmesinde chip animasyonu
- Tüm ledger satırları doğru
- Yolcu/sürücü geçmiş listeleri DB ile uyumlu

### Faz 7 — Admin Paneli (KPI + Grafikler)
**Kapsam:**
- `<KpiCard>` (animasyonlu sayaç) — 7 KPI
- `<MonthlyTrendChart>` (LineChart, 3 line: gelir/yolculuk/aktif kullanıcı)
- `<HourlyDistributionChart>` (BarChart)
- `<RevenueDonut>` (PieChart, %75/%15/%10 + net)
- `<RidesTable>` filtre + sayfalama + drawer detay
- `<DriversTable>`, `<RidersTable>`
- `<AdminSidebar>` + responsive
- Tüm grafikler B&W tema (sadece griler ve siyah)

**Kabul kriteri:**
- Tüm grafikler boş değil (Faz 9'da seed dolacak ama Faz 7'de yeterli veri olmalı — bu yüzden Faz 7 başında ek seed komutu çalıştırılır)
- KPI'lar başlangıçta 0'dan animasyonla hedefe gider
- Tabloda filtreleme/sayfalama çalışır

### Faz 8 — Para Havuzu Görselleştirme + Dağıtım
**Kapsam:**
- `/admin/havuz` sayfası
- `<PoolVisualizer>` — havuz büyük görsel:
  - Toplam havuz (büyük rakam, sayaç animasyonlu)
  - Alt 3 kova: Şoför Hak Edişleri / Chip Karşılığı / Sistem Komisyonu
  - Her yolculuk tamamlandığında "money flow" animasyonu (Lucide `Banknote` ikonları havuza akar)
- `<PayoutButton>` "Şoför Ödemelerini Dağıt" — confirm dialog → POST `/api/admin/pool/payout`
- Animasyon: havuzdan paralar akar, sürücü kartlarına yerleşir, sayaç sıfırlanır
- Ledger sayfası: tüm hareketler tablo

**Kabul kriteri:**
- Yeni yolculuk tamamlanınca havuz animasyonu tetiklenir
- Payout butonu → unpaidBalance toplamı → 0, ilgili sürücülerin paidBalance artar, ledger'da DRIVER_PAYOUT satırları
- Test: `pool-payout.api.test.ts`

### Faz 9 — Seed, Sunum Modu, Son Rötuş
**Kapsam:**
- Zengin seed (220+ yolculuk, son 90 gün, gerçekçi dağılım)
- `<DemoQuickSwitch>` floating panel: 3 hesap arası tek tıkla geçiş, "Senaryoyu sıfırla" butonu (DB'yi seed'e geri al)
- "Sunum modu" toggle: imleci büyütür, animasyonları biraz yavaşlatır
- Tüm error boundary'ler, NotFound sayfası
- Loading skeleton'lar her sayfada
- Lighthouse, Erişilebilirlik kontrolleri
- Final E2E: tam happy-path senaryosu yeşil
- README'de sunum komutları

**Kabul kriteri:**
- E2E happy-path %100 yeşil (3 ardışık çalıştırma)
- Sunum senaryosu manuel test → 0 console hatası, 0 kırık görsel, 0 refresh ihtiyacı
- `npm run reset` → veritabanı seed durumuna döner
- README'deki sunum kontrol listesi tamamen tikli

---

## 14. Riskler ve Azaltma

| Risk | Olasılık | Etki | Azaltma |
|---|---|---|---|
| Google Maps API anahtarı yok / rate limit | Orta | Yüksek | Curated mock dataset fallback (50+ TR adresi) |
| Sunum sırasında tarayıcı sekme kısıtlaması | Düşük | Orta | BroadcastChannel + polling fallback |
| Animasyonlar düşük performansta takılır | Düşük | Orta | `prefers-reduced-motion` saygısı, GPU-friendly transform-only |
| Para hesabında yuvarlama hatası | Orta | Çok yüksek | Saf fonksiyonlar + unit test, finansal değerler `Math.round(x*100)/100` |
| Seed verisi grafikte düz/anlamsız | Orta | Orta | Saatlik dağılım için sinüs dalgası bazlı generator |
| Kullanıcı sekmeler arası karışır | Düşük | Düşük | Top bar'da rol rozeti (büyük), DemoQuickSwitch panel |

---

## 15. Çıktı ve Teslim

- `npm run dev` — geliştirme
- `npm run seed` — veritabanını seed durumuna sıfırla
- `npm run reset` — DB sil + seed
- `npm test` — Vitest
- `npm run test:e2e` — Playwright
- `npm run build && npm start` — prod build
- `README.md` — sunum kurulum + senaryo + sorun giderme

---

## 16. Onaylanan Kararlar (2026-05-06)

1. **Google Maps anahtarı:** Sunum makinesinde olacak. Mock fallback yine de hazır tutulacak (savunma amaçlı).
2. **Fiyatlandırma:** RIDE ve GO aynı: **25₺ + 12₺/km**. Dağılım %75 / %15 / %10.
3. **Chip ile ödeme aktif** — yolcu sonraki yolculukta chip bakiyesini kullanabilir.
4. **Mobil çerçeve aktif** — desktop'ta yolcu/sürücü ekranları cihaz çerçevesi içinde gösterilir.

Plan tamamen onaylı. **Faz 0** başladı.

---

**Plan sonu.**

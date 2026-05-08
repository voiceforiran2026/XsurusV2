// Hem prisma/seed.ts (CLI) hem /api/demo/reset (runtime) tarafından kullanılır.
// Dev sunucu açıkken DB'yi silmek yerine tabloları temizleyip yeniden doldurur.

import bcrypt from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';
import { MOCK_PLACES, type MockPlace, placeLabel } from './places-mock';
import { haversineKm } from './geo';
import { calculateFare, roundTL } from './pricing';
import { buildSettlement } from './pool';

const HOURS_WEIGHT = [
  0.3, 0.2, 0.15, 0.1, 0.15, 0.3,
  0.6, 0.9, 1.4, 1.5, 1.2, 1.0,
  1.1, 1.2, 1.0, 0.9, 1.0, 1.4,
  1.6, 1.5, 1.3, 1.1, 0.8, 0.5,
];

const ADDITIONAL_DRIVERS = [
  { fullName: 'Ahmet Yılmaz', email: 'driver1@x.com', phone: '+90 555 234 56 78', vehicleModel: 'Toyota Corolla', plateNumber: '34 X 0023', rating: 4.9 },
  { fullName: 'Mehmet Öz', email: 'driver2@x.com', phone: '+90 555 345 67 89', vehicleModel: 'Renault Megane', plateNumber: '34 X 0341', rating: 4.7 },
  { fullName: 'Ali Kara', email: 'driver3@x.com', phone: '+90 555 456 78 90', vehicleModel: 'Honda Civic', plateNumber: '34 X 0852', rating: 4.8 },
  { fullName: 'Hasan Demir', email: 'driver4@x.com', phone: '+90 555 567 89 01', vehicleModel: 'Volkswagen Passat', plateNumber: '34 X 0917', rating: 4.9 },
];

const ADDITIONAL_RIDERS = [
  { fullName: 'Ayşe Şahin', email: 'rider1@x.com', phone: '+90 555 100 00 01' },
  { fullName: 'Fatma Kaya', email: 'rider2@x.com', phone: '+90 555 100 00 02' },
  { fullName: 'Zeynep Çelik', email: 'rider3@x.com', phone: '+90 555 100 00 03' },
  { fullName: 'Emre Polat', email: 'rider4@x.com', phone: '+90 555 100 00 04' },
  { fullName: 'Selin Aksoy', email: 'rider5@x.com', phone: '+90 555 100 00 05' },
  { fullName: 'Burak Doğan', email: 'rider6@x.com', phone: '+90 555 100 00 06' },
  { fullName: 'Esra Yıldız', email: 'rider7@x.com', phone: '+90 555 100 00 07' },
  { fullName: 'Cem Aslan', email: 'rider8@x.com', phone: '+90 555 100 00 08' },
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sampleHour(): number {
  const total = HOURS_WEIGHT.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < HOURS_WEIGHT.length; i++) {
    r -= HOURS_WEIGHT[i];
    if (r <= 0) return i;
  }
  return 23;
}
function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 12)}-${Date.now().toString(36).slice(-6)}`;
}

interface RideRow {
  id: string;
  serviceType: string;
  status: string;
  riderId: string;
  driverId: string | null;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  distanceKm: number;
  estimatedFare: number;
  finalFare: number | null;
  driverEarning: number | null;
  systemCommission: number | null;
  chipReward: number | null;
  paymentMethod: string;
  requestedAt: Date;
  acceptedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
}

async function clearAll(db: PrismaClient): Promise<void> {
  // FK bağımlılıklarına göre sırasıyla temizle
  await db.$transaction([
    db.chipTransaction.deleteMany(),
    db.poolLedger.deleteMany(),
    db.notification.deleteMany(),
    db.paymentCard.deleteMany(),
    db.chipBalance.deleteMany(),
    db.ride.deleteMany(),
    db.driverProfile.deleteMany(),
    db.riderProfile.deleteMany(),
    db.user.deleteMany(),
    db.appSetting.deleteMany(),
  ]);
}

async function seedUsers(db: PrismaClient, log: (s: string) => void): Promise<void> {
  log('🌱 Kullanıcılar...');

  await db.user.create({
    data: {
      email: 'admin@x.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      fullName: 'Süper Admin',
      phone: '+90 555 000 00 00',
      role: 'ADMIN',
    },
  });
  log('  ✓ admin@x.com');

  await db.user.create({
    data: {
      email: 'yolcu@x.com',
      passwordHash: await bcrypt.hash('yolcu123', 10),
      fullName: 'Demo Yolcu',
      phone: '+90 555 111 22 33',
      role: 'RIDER',
      riderProfile: { create: {} },
    },
  });
  log('  ✓ yolcu@x.com');

  await db.user.create({
    data: {
      email: 'surucu@x.com',
      passwordHash: await bcrypt.hash('surucu123', 10),
      fullName: 'Mehmet Sürücü',
      phone: '+90 555 333 44 55',
      role: 'DRIVER',
      driverProfile: {
        create: { vehicleModel: 'Mercedes E-Class', plateNumber: '34 X 0001' },
      },
    },
  });
  log('  ✓ surucu@x.com');

  for (const d of ADDITIONAL_DRIVERS) {
    await db.user.create({
      data: {
        email: d.email,
        passwordHash: await bcrypt.hash('demo123', 10),
        fullName: d.fullName,
        phone: d.phone,
        role: 'DRIVER',
        driverProfile: {
          create: {
            vehicleModel: d.vehicleModel,
            plateNumber: d.plateNumber,
            rating: d.rating,
          },
        },
      },
    });
    log(`  ✓ ${d.email}`);
  }

  for (const r of ADDITIONAL_RIDERS) {
    await db.user.create({
      data: {
        email: r.email,
        passwordHash: await bcrypt.hash('demo123', 10),
        fullName: r.fullName,
        phone: r.phone,
        role: 'RIDER',
        riderProfile: { create: { rating: 4.5 + Math.random() * 0.5 } },
      },
    });
    log(`  ✓ ${r.email}`);
  }
}

async function seedRichRides(db: PrismaClient, log: (s: string) => void): Promise<void> {
  log('🚖 Geçmiş yolculuklar...');

  const drivers = await db.user.findMany({ where: { role: 'DRIVER' }, select: { id: true } });
  const riders = await db.user.findMany({ where: { role: 'RIDER' }, select: { id: true } });
  if (drivers.length === 0 || riders.length === 0) {
    log('  ⚠ atlanıyor');
    return;
  }

  const places: MockPlace[] = MOCK_PLACES;
  const rides: RideRow[] = [];
  const ledgers: Array<{
    type: string;
    amount: number;
    rideId: string;
    driverId: string;
    description: string;
    createdAt: Date;
  }> = [];
  const chipTxs: Array<{
    userId: string;
    amount: number;
    type: string;
    rideId: string;
    description: string;
    createdAt: Date;
  }> = [];

  const driverStats: Record<string, { earnings: number; rides: number }> = {};
  const riderStats: Record<
    string,
    { spent: number; rides: number; chip: number }
  > = {};

  const now = new Date();
  for (let dayOffset = 90; dayOffset >= 1; dayOffset--) {
    const day = new Date(now);
    day.setDate(now.getDate() - dayOffset);
    day.setHours(0, 0, 0, 0);

    const dow = day.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const dayCount = isWeekend ? randInt(3, 6) : randInt(2, 4);

    for (let i = 0; i < dayCount; i++) {
      const hour = sampleHour();
      const minute = randInt(0, 59);
      const requestedAt = new Date(day);
      requestedAt.setHours(hour, minute, 0, 0);

      const driver = pick(drivers);
      const rider = pick(riders);
      let p1 = pick(places);
      let p2 = pick(places);
      let safety = 5;
      while (p1.placeId === p2.placeId && safety > 0) {
        p2 = pick(places);
        safety--;
      }

      const distKm = roundTL(haversineKm(p1, p2) * 1.3);
      if (distKm < 0.5) continue;

      const serviceType = Math.random() < 0.85 ? 'RIDE' : 'GO';
      const fare = calculateFare(serviceType as 'RIDE' | 'GO', distKm);
      const id = randomId('ride');

      const status = Math.random() < 0.94 ? 'COMPLETED' : 'CANCELLED';

      const acceptedAt = new Date(requestedAt.getTime() + randInt(30, 120) * 1000);
      const startedAt =
        status === 'COMPLETED'
          ? new Date(acceptedAt.getTime() + randInt(120, 600) * 1000)
          : null;
      const completedAt =
        status === 'COMPLETED' && startedAt
          ? new Date(startedAt.getTime() + Math.max(180, distKm * 2 * 60) * 1000)
          : null;
      const cancelledAt =
        status === 'CANCELLED'
          ? new Date(requestedAt.getTime() + randInt(30, 180) * 1000)
          : null;

      const acceptedBeforeCancel =
        status === 'CANCELLED' && cancelledAt
          ? cancelledAt.getTime() >= acceptedAt.getTime()
          : true;

      const row: RideRow = {
        id,
        serviceType,
        status,
        riderId: rider.id,
        driverId: status === 'CANCELLED' && Math.random() < 0.4 ? null : driver.id,
        pickupAddress: placeLabel(p1),
        pickupLat: p1.lat,
        pickupLng: p1.lng,
        dropoffAddress: placeLabel(p2),
        dropoffLat: p2.lat,
        dropoffLng: p2.lng,
        distanceKm: distKm,
        estimatedFare: fare,
        finalFare: status === 'COMPLETED' ? fare : null,
        driverEarning: null,
        systemCommission: null,
        chipReward: null,
        paymentMethod: Math.random() < 0.85 ? 'CARD' : 'CHIP',
        requestedAt,
        acceptedAt: acceptedBeforeCancel ? acceptedAt : null,
        startedAt,
        completedAt,
        cancelledAt,
        cancelReason: status === 'CANCELLED' ? 'Yolcu vazgeçti' : null,
      };

      if (status === 'COMPLETED') {
        const settle = buildSettlement(fare, id);
        row.driverEarning = settle.driverEarning;
        row.systemCommission = settle.systemCommission;
        row.chipReward = settle.chipReward;

        for (const e of settle.ledger) {
          ledgers.push({
            type: e.type,
            amount: e.amount,
            rideId: id,
            driverId: driver.id,
            description: e.description,
            createdAt: completedAt!,
          });
        }
        chipTxs.push({
          userId: rider.id,
          amount: settle.chipReward,
          type: 'EARN_FROM_RIDE',
          rideId: id,
          description: 'Yolculuk kazanımı',
          createdAt: completedAt!,
        });

        driverStats[driver.id] ??= { earnings: 0, rides: 0 };
        driverStats[driver.id].earnings += settle.driverEarning;
        driverStats[driver.id].rides += 1;

        riderStats[rider.id] ??= { spent: 0, rides: 0, chip: 0 };
        riderStats[rider.id].spent += fare;
        riderStats[rider.id].rides += 1;
        riderStats[rider.id].chip += settle.chipReward;
      }

      rides.push(row);
    }
  }

  log(`  ${rides.length} yolculuk üretildi.`);

  const BATCH = 100;
  for (let i = 0; i < rides.length; i += BATCH) {
    await db.ride.createMany({ data: rides.slice(i, i + BATCH) });
  }
  for (let i = 0; i < ledgers.length; i += BATCH) {
    await db.poolLedger.createMany({ data: ledgers.slice(i, i + BATCH) });
  }
  for (let i = 0; i < chipTxs.length; i += BATCH) {
    await db.chipTransaction.createMany({ data: chipTxs.slice(i, i + BATCH) });
  }

  for (const [driverId, stats] of Object.entries(driverStats)) {
    const earnings = roundTL(stats.earnings);
    await db.driverProfile.update({
      where: { userId: driverId },
      data: {
        totalEarnings: { increment: earnings },
        unpaidBalance: { increment: earnings },
        totalRides: { increment: stats.rides },
      },
    });
  }
  const allDrivers = await db.driverProfile.findMany();
  for (let i = 0; i < Math.min(2, allDrivers.length); i++) {
    await db.driverProfile.update({
      where: { id: allDrivers[i].id },
      data: { isOnline: true },
    });
  }

  for (const [riderId, stats] of Object.entries(riderStats)) {
    const spent = roundTL(stats.spent);
    const chip = roundTL(stats.chip);
    await db.riderProfile.upsert({
      where: { userId: riderId },
      update: {
        totalRides: { increment: stats.rides },
        totalSpent: { increment: spent },
      },
      create: {
        userId: riderId,
        totalRides: stats.rides,
        totalSpent: spent,
      },
    });
    await db.chipBalance.upsert({
      where: { userId: riderId },
      update: {
        balance: { increment: chip },
        lifetimeEarned: { increment: chip },
      },
      create: {
        userId: riderId,
        balance: chip,
        lifetimeEarned: chip,
      },
    });
  }

  log(`  ${ledgers.length} ledger satırı, ${chipTxs.length} chip tx eklendi.`);
}

/**
 * Demo yolcusunun chip bakiyesini sunum-dostu bir seviyede sabitler.
 * Seed döngüsü 9000₺+ üretebiliyor (yardımcı yolculara dağıtım nedeniyle de
 * yolcu@x.com'a fazla denk geliyor); sunumda "Chip ile öde 9k+" göze batıyor.
 * Bu fonksiyon eski tx'leri silip toplamı 300₺ olan 3 sentetik kazanım yazar.
 */
async function pinDemoRiderChip(db: PrismaClient): Promise<void> {
  const TARGET_BALANCE = 300;
  const demoRider = await db.user.findUnique({
    where: { email: 'yolcu@x.com' },
    select: { id: true },
  });
  if (!demoRider) return;

  // Eski chip kazanım tx'lerini temizle (ride finansal alanları aynen kalır)
  await db.chipTransaction.deleteMany({ where: { userId: demoRider.id } });

  // 3 sentetik kazanım — toplamı 300₺
  const recent = [
    { amount: 120.5, daysAgo: 2 },
    { amount: 95.3, daysAgo: 7 },
    { amount: 84.2, daysAgo: 14 },
  ];
  const total = recent.reduce((s, r) => s + r.amount, 0); // = 300

  const now = new Date();
  for (const r of recent) {
    const date = new Date(now);
    date.setDate(now.getDate() - r.daysAgo);
    await db.chipTransaction.create({
      data: {
        userId: demoRider.id,
        amount: r.amount,
        type: 'EARN_FROM_RIDE',
        description: 'Yolculuk kazanımı',
        createdAt: date,
      },
    });
  }

  await db.chipBalance.upsert({
    where: { userId: demoRider.id },
    update: {
      balance: total,
      lifetimeEarned: total,
      lifetimeSpent: 0,
    },
    create: {
      userId: demoRider.id,
      balance: total,
      lifetimeEarned: total,
      lifetimeSpent: 0,
    },
  });
}

export interface ResetSummary {
  rides: number;
  ledgers: number;
  chipTxs: number;
  drivers: number;
  riders: number;
}

/**
 * DB'yi temizler ve seed eder. Dev sunucu açıkken çalışır;
 * dosya silmek yerine deleteMany kullanır (file-lock yok).
 */
export async function resetAndSeed(
  db: PrismaClient,
  log: (s: string) => void = () => {},
): Promise<ResetSummary> {
  log('🧹 Tablolar temizleniyor...');
  await clearAll(db);
  // Seed sırası: kullanıcılar → yolculuklar → demo yolcunun chipini sabitle
  await seedUsers(db, log);
  await seedRichRides(db, log);
  await pinDemoRiderChip(db);
  log('  ✓ Demo yolcu chip bakiyesi 300₺ olarak sabitlendi.');

  const [rides, ledgers, chipTxs, drivers, riders] = await Promise.all([
    db.ride.count(),
    db.poolLedger.count(),
    db.chipTransaction.count(),
    db.user.count({ where: { role: 'DRIVER' } }),
    db.user.count({ where: { role: 'RIDER' } }),
  ]);
  log('✅ Reset tamamlandı.');
  return { rides, ledgers, chipTxs, drivers, riders };
}

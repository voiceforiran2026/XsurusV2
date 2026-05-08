import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { buildSettlement } from '@/lib/pool';
import { roundTL, applyChipPayment } from '@/lib/pricing';

// Faz 6: Yolculuk tamamlanır → finansal sonuçlandırma:
//   - Ride: COMPLETED + finansal alanlar
//   - PoolLedger: 4 satır (RIDE_INFLOW, DRIVER_PAYOUT, CHIP_RESERVE, COMMISSION)
//   - DriverProfile: unpaidBalance + totalEarnings + totalRides
//   - ChipBalance: yolcuya chip kazanım (balance + lifetimeEarned)
//   - ChipTransaction: EARN_FROM_RIDE satırı
//   - RiderProfile: totalRides + totalSpent
// Hepsi tek transaction içinde, atomik.
export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'DRIVER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const ride = await db.ride.findUnique({ where: { id: params.id } });
  if (!ride) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
  if (ride.driverId !== user.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }
  if (ride.status !== 'IN_PROGRESS') {
    return NextResponse.json(
      { error: 'Yolculuk bitirilemez (durum uygun değil)' },
      { status: 409 },
    );
  }

  const finalFare = roundTL(ride.estimatedFare);
  const settlement = buildSettlement(finalFare, ride.id);
  const { driverEarning, systemCommission, chipReward } = settlement;

  // Chip ile ödeme: yolcunun bakiyesinden ne kadar düşeceğini hesapla
  let chipUsed = 0;
  if (ride.paymentMethod === 'CHIP') {
    const balance = await db.chipBalance.findUnique({
      where: { userId: ride.riderId },
      select: { balance: true },
    });
    const available = balance?.balance ?? 0;
    chipUsed = applyChipPayment(finalFare, available).chipUsed;
  }

  const completed = await db.$transaction(async (tx) => {
    const updatedRide = await tx.ride.update({
      where: { id: ride.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        finalFare,
        driverEarning,
        systemCommission,
        chipReward,
      },
    });

    await tx.poolLedger.createMany({
      data: settlement.ledger.map((e) => ({
        type: e.type,
        amount: e.amount,
        rideId: ride.id,
        driverId: ride.driverId,
        description: e.description,
      })),
    });

    await tx.driverProfile.update({
      where: { userId: ride.driverId! },
      data: {
        unpaidBalance: { increment: driverEarning },
        totalEarnings: { increment: driverEarning },
        totalRides: { increment: 1 },
      },
    });

    await tx.chipBalance.upsert({
      where: { userId: ride.riderId },
      update: {
        balance: { increment: chipReward },
        lifetimeEarned: { increment: chipReward },
      },
      create: {
        userId: ride.riderId,
        balance: chipReward,
        lifetimeEarned: chipReward,
        lifetimeSpent: 0,
      },
    });

    await tx.chipTransaction.create({
      data: {
        userId: ride.riderId,
        amount: chipReward,
        type: 'EARN_FROM_RIDE',
        rideId: ride.id,
        description: 'Yolculuk kazanımı',
      },
    });

    // Chip ile ödeme kullanıldıysa bakiyeden düş + harcama tx + ledger
    if (chipUsed > 0) {
      await tx.chipBalance.update({
        where: { userId: ride.riderId },
        data: {
          balance: { decrement: chipUsed },
          lifetimeSpent: { increment: chipUsed },
        },
      });
      await tx.chipTransaction.create({
        data: {
          userId: ride.riderId,
          amount: -chipUsed,
          type: 'SPEND_ON_RIDE',
          rideId: ride.id,
          description: 'Yolculukta chip kullanımı',
        },
      });
      await tx.poolLedger.create({
        data: {
          type: 'CHIP_REDEMPTION',
          amount: chipUsed,
          rideId: ride.id,
          driverId: ride.driverId,
          description: `Chip ile ödeme #${ride.id.slice(-6)}`,
        },
      });
    }

    await tx.riderProfile.upsert({
      where: { userId: ride.riderId },
      update: {
        totalRides: { increment: 1 },
        totalSpent: { increment: finalFare },
      },
      create: {
        userId: ride.riderId,
        totalRides: 1,
        totalSpent: finalFare,
      },
    });

    return updatedRide;
  });

  return NextResponse.json({ ride: completed, chipUsed });
}

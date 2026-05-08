import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'DRIVER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const profile = await db.driverProfile.findUnique({
    where: { userId: user.id },
    select: { isOnline: true },
  });

  if (!profile?.isOnline) {
    return NextResponse.json({ rides: [] });
  }

  const rides = await db.ride.findMany({
    where: { status: 'PENDING', driverId: null },
    orderBy: { requestedAt: 'asc' },
    take: 10,
    include: {
      rider: { select: { id: true, fullName: true } },
    },
  });

  return NextResponse.json({ rides });
}

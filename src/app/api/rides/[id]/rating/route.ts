import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

const PostSchema = z.object({
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional().nullable(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const ride = await db.ride.findUnique({
    where: { id: params.id },
    select: { id: true, riderId: true, driverId: true, status: true },
  });
  if (!ride) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
  if (ride.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'Sadece tamamlanan yolculuk puanlanabilir' }, { status: 400 });
  }

  // Sadece rider veya driver puanlayabilir
  if (ride.riderId !== user.id && ride.driverId !== user.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }
  const rateeId = ride.riderId === user.id ? ride.driverId : ride.riderId;
  if (!rateeId) {
    return NextResponse.json({ error: 'Karşı taraf bulunamadı' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Puan 1-5 arası olmalı' }, { status: 400 });
  }

  // Aynı ride için aynı kullanıcı tekrar puanlamasın
  const existing = await db.rideRating.findUnique({
    where: { rideId_raterId: { rideId: ride.id, raterId: user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: 'Zaten puanladınız' }, { status: 409 });
  }

  await db.rideRating.create({
    data: {
      rideId: ride.id,
      raterId: user.id,
      rateeId,
      score: parsed.data.score,
      comment: parsed.data.comment?.trim() || null,
    },
  });

  // Sürücü ortalama rating'i güncelle (sadece sürücü puanlandıysa)
  if (rateeId === ride.driverId) {
    const ratings = await db.rideRating.findMany({
      where: { rateeId, score: { gte: 1, lte: 5 } },
      select: { score: true },
    });
    if (ratings.length > 0) {
      const avg = ratings.reduce((s, r) => s + r.score, 0) / ratings.length;
      await db.driverProfile.update({
        where: { userId: rateeId },
        data: { rating: Math.round(avg * 100) / 100 },
      });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const myRating = await db.rideRating.findUnique({
    where: { rideId_raterId: { rideId: params.id, raterId: user.id } },
  });

  return NextResponse.json({ rated: !!myRating, rating: myRating });
}

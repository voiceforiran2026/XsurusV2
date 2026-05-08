import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

const PostSchema = z.object({
  body: z.string().min(1).max(500),
});

async function authorizeRide(rideId: string, userId: string) {
  const ride = await db.ride.findUnique({
    where: { id: rideId },
    select: { id: true, riderId: true, driverId: true },
  });
  if (!ride) return null;
  if (ride.riderId !== userId && ride.driverId !== userId) return null;
  return ride;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const ride = await authorizeRide(params.id, user.id);
  if (!ride) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

  const messages = await db.chatMessage.findMany({
    where: { rideId: params.id },
    orderBy: { sentAt: 'asc' },
    take: 200,
    select: { id: true, senderId: true, body: true, sentAt: true, readAt: true },
  });

  return NextResponse.json({ messages });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const ride = await authorizeRide(params.id, user.id);
  if (!ride) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Mesaj geçersiz' }, { status: 400 });
  }

  const message = await db.chatMessage.create({
    data: {
      rideId: params.id,
      senderId: user.id,
      body: parsed.data.body.trim(),
    },
    select: { id: true, senderId: true, body: true, sentAt: true, readAt: true },
  });

  // Karşı tarafa hafif bildirim oluştur (DB'ye yazıyoruz, listener UI'da çalar)
  const otherUserId = ride.riderId === user.id ? ride.driverId : ride.riderId;
  if (otherUserId) {
    await db.notification.create({
      data: {
        userId: otherUserId,
        type: 'CHAT_MESSAGE',
        title: 'Yeni Mesaj',
        body: parsed.data.body.trim().slice(0, 80),
        data: JSON.stringify({ rideId: params.id, messageId: message.id }),
      },
    });
  }

  return NextResponse.json({ message });
}

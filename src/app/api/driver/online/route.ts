import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'DRIVER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  const profile = await db.driverProfile.findUnique({
    where: { userId: user.id },
    select: { isOnline: true, lastSeenAt: true },
  });
  return NextResponse.json({
    isOnline: profile?.isOnline ?? false,
    lastSeenAt: profile?.lastSeenAt,
  });
}

const schema = z.object({
  isOnline: z.boolean(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'DRIVER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'isOnline gerekli' }, { status: 400 });
  }

  await db.driverProfile.update({
    where: { userId: user.id },
    data: {
      isOnline: parsed.data.isOnline,
      lastSeenAt: new Date(),
    },
  });

  return NextResponse.json({ isOnline: parsed.data.isOnline });
}

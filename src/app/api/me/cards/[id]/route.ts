import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const card = await db.paymentCard.findUnique({ where: { id: params.id } });
  if (!card || card.userId !== user.id) {
    return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
  }

  await db.$transaction(async (tx) => {
    await tx.paymentCard.delete({ where: { id: params.id } });
    if (card.isDefault) {
      // En son eklenen kartı default yap
      const next = await tx.paymentCard.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
      if (next) {
        await tx.paymentCard.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  let body: { isDefault?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const card = await db.paymentCard.findUnique({ where: { id: params.id } });
  if (!card || card.userId !== user.id) {
    return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
  }

  if (body.isDefault === true) {
    await db.$transaction(async (tx) => {
      await tx.paymentCard.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
      await tx.paymentCard.update({
        where: { id: params.id },
        data: { isDefault: true },
      });
    });
  }

  return NextResponse.json({ ok: true });
}

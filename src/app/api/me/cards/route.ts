import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { detectBrand, last4, isValidExpiry } from '@/lib/cards';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const cards = await db.paymentCard.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json({ cards });
}

const schema = z.object({
  cardholderName: z.string().min(2),
  cardNumber: z.string().min(13).max(23),
  expiryMonth: z.number().int().min(1).max(12),
  expiryYear: z.number().int().min(0).max(99),
  cvv: z.string().min(3).max(4),
  setDefault: z.boolean().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Eksik veya hatalı bilgi', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { cardholderName, cardNumber, expiryMonth, expiryYear, setDefault } =
    parsed.data;

  // Demo: Luhn doğrulaması bilinçli olarak kapalı — 1234 1234 1234 1234 gibi
  // tipik test/demo numaraları kabul edilir.
  if (!isValidExpiry(expiryMonth, expiryYear)) {
    return NextResponse.json(
      { error: 'Son kullanım tarihi geçersiz' },
      { status: 400 },
    );
  }

  const brand = detectBrand(cardNumber);
  const l4 = last4(cardNumber);

  const created = await db.$transaction(async (tx) => {
    if (setDefault) {
      await tx.paymentCard.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }
    const existingCount = await tx.paymentCard.count({
      where: { userId: user.id },
    });
    return tx.paymentCard.create({
      data: {
        userId: user.id,
        cardholderName,
        last4: l4,
        brand,
        expiryMonth,
        expiryYear,
        isDefault: setDefault || existingCount === 0,
      },
    });
  });

  return NextResponse.json({ card: created }, { status: 201 });
}

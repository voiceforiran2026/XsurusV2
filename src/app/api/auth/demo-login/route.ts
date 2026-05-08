import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import type { Role } from '@/types/domain';

const schema = z.object({
  role: z.enum(['admin', 'rider', 'driver']),
});

const ROLE_TO_EMAIL = {
  admin: 'admin@x.com',
  rider: 'yolcu@x.com',
  driver: 'surucu@x.com',
} as const;

// Demo: parolasız hesap geçişi. Yalnızca demo modunda aktif.
export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    return NextResponse.json({ error: 'Demo modu kapalı' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Rol gerekli' }, { status: 400 });
  }

  const email = ROLE_TO_EMAIL[parsed.data.role];
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'Demo hesabı bulunamadı' }, { status: 404 });
  }

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.role = user.role as Role;
  await session.save();

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });
}

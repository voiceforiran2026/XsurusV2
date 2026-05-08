import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/passwords';
import { getSession } from '@/lib/auth/session';
import type { Role } from '@/types/domain';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Geçerli bir e-posta ve parola girin' },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!user) {
    return NextResponse.json(
      { error: 'E-posta veya parola hatalı' },
      { status: 401 },
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: 'E-posta veya parola hatalı' },
      { status: 401 },
    );
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
      avatarUrl: user.avatarUrl,
    },
  });
}

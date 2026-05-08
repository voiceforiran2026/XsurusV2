import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(6),
  acceptTerms: z.literal(true),
});

// Demo: gerçek kullanıcı yaratmıyoruz, sadece formu doğrulayıp
// "Demo hesaplarla giriş yapın" bilgisi döndürüyoruz.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) fields[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json(
      { error: 'Lütfen alanları kontrol edin', fields },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    demo: true,
    message:
      'Kayıt başarılı! Demo için lütfen mevcut hesaplardan biriyle giriş yapın.',
  });
}

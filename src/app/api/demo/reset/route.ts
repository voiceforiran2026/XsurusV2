import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resetAndSeed } from '@/lib/demo-seed';

export const maxDuration = 60; // Vercel limit (sadece dev için no-op)

// Demo: DB'yi temizler ve seed eder. Dev sunucu açıkken file-lock yaşamamak
// için child_process + fs.rmSync yerine mevcut Prisma client üzerinden
// deleteMany + createMany kullanır.
export async function POST() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    return NextResponse.json({ error: 'Demo modu kapalı' }, { status: 404 });
  }

  try {
    const summary = await resetAndSeed(db);
    return NextResponse.json({ ok: true, ...summary });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { error: 'Reset başarısız', detail: msg },
      { status: 500 },
    );
  }
}

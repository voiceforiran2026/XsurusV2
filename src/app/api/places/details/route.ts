import { NextResponse } from 'next/server';
import { getPlaceDetail } from '@/lib/places';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const placeId = (url.searchParams.get('placeId') ?? '').trim();
  if (!placeId) return NextResponse.json({ error: 'placeId gerekli' }, { status: 400 });

  const detail = await getPlaceDetail(placeId);
  if (!detail) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

  return NextResponse.json(detail);
}

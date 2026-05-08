import { NextResponse } from 'next/server';
import { searchPlaces } from '@/lib/places';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  if (q.length < 1) return NextResponse.json({ results: [] });

  const results = await searchPlaces(q);
  return NextResponse.json({ results });
}

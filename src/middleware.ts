import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'x-surus-session';

const PROTECTED_PREFIXES = ['/yolcu', '/surucu', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/giris';
    url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/yolcu/:path*', '/surucu/:path*', '/admin/:path*'],
};

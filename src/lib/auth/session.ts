import 'server-only';
import { cookies } from 'next/headers';
import { getIronSession, type SessionOptions } from 'iron-session';
import type { Role } from '@/types/domain';

export interface SessionData {
  userId?: string;
  email?: string;
  role?: Role;
}

const sessionPassword = process.env.SESSION_PASSWORD;
if (!sessionPassword || sessionPassword.length < 32) {
  throw new Error(
    'SESSION_PASSWORD ortam değişkeni en az 32 karakter olmalı (.env)',
  );
}

export const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: 'x-surus-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 gün
  },
};

export function getSession() {
  return getIronSession<SessionData>(cookies(), sessionOptions);
}

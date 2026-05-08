import { PrismaClient } from '@prisma/client';
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function resolveDatabaseUrl(): string | undefined {
  if (process.env.VERCEL === '1') {
    const tmpDb = '/tmp/x-surus.db';
    if (!existsSync(tmpDb)) {
      const bundled = join(process.cwd(), 'prisma', 'dev.db');
      if (existsSync(bundled)) {
        try {
          copyFileSync(bundled, tmpDb);
        } catch {
        }
      }
    }
    return `file:${tmpDb}`;
  }
  return process.env.DATABASE_URL;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const datasourceUrl = resolveDatabaseUrl();

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    ...(datasourceUrl ? { datasourceUrl } : {}),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

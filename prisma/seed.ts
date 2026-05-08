import { PrismaClient } from '@prisma/client';
import { resetAndSeed } from '../src/lib/demo-seed';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seed başlıyor...\n');
  const summary = await resetAndSeed(db, console.log);
  console.log('\nÖzet:', summary);
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

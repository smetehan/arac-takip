import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis;

function makePrisma() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  // Turso (libsql:// veya wss://) ise adapter kullan
  // Lokal dosya (file:./...) ise direkt Prisma kullan
  if (url && (url.startsWith('libsql://') || url.startsWith('wss://') || url.startsWith('https://'))) {
    const libsql = createClient({ url, authToken });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter });
  }

  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? makePrisma();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

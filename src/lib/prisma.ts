import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://ensueno:aX2DKbHldtM0xuC1eApi@76.13.113.31:5434/ensuenodb?sslmode=disable';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pg = require('pg');

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// Always validate the cached instance has the expected models.
// If a stale instance exists (e.g. from a failed init without adapter), recreate.
function getOrCreatePrisma(): PrismaClient {
  if (globalForPrisma.prisma) {
    // Validate the cached instance has the shipping models
    const cached = globalForPrisma.prisma as any;
    if (typeof cached.shippingRate?.findFirst === 'function') {
      return globalForPrisma.prisma;
    }
    // Stale instance without adapter — discard it
    console.warn('[prisma.ts] Stale PrismaClient detected, recreating with PrismaPg adapter...');
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getOrCreatePrisma();

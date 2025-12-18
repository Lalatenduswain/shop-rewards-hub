/**
 * Prisma Client Factory
 * Applies RLS and encryption middleware
 */

import { PrismaClient } from '@prisma/client';

import { createEncryptionMiddleware } from './middleware/encryption';
import { createTenantIsolationMiddleware } from './middleware/tenant-rls';

// Singleton instance
let prisma: PrismaClient | null = null;

/**
 * Get or create Prisma client with all middleware applied
 */
export function getPrismaClient(): PrismaClient {
  if (prisma) {
    return prisma;
  }

  prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

  // Apply middleware in order:
  // 1. Tenant isolation (RLS) - must be first to enforce multi-tenancy
  // 2. Encryption - encrypts/decrypts sensitive fields
  prisma.$use(createTenantIsolationMiddleware());
  prisma.$use(createEncryptionMiddleware());

  return prisma;
}

/**
 * Disconnect Prisma client
 */
export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

/**
 * Default export for convenience
 */
export default getPrismaClient();

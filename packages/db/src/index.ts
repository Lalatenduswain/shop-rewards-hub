/**
 * @shop-rewards/db - Database package
 * Prisma client with RLS and encryption middleware
 */

// Re-export Prisma client
export * from '@prisma/client';

// Export client factory
export { getPrismaClient, disconnectPrisma, default as prisma } from './client';

// Export middleware
export {
  createTenantIsolationMiddleware,
  tenantContext,
  withTenantContext,
  getCurrentTenantContext,
  getTenantContextOrNull,
  type TenantContext,
} from './middleware/tenant-rls';

export {
  createEncryptionMiddleware,
  encrypt,
  decrypt,
  encryptValue,
  decryptValue,
  isEncrypted,
} from './middleware/encryption';

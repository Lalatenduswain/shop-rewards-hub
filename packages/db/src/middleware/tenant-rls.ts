/**
 * Row-Level Security (RLS) Middleware
 * Automatically enforces tenant isolation via shopId filtering
 * Uses AsyncLocalStorage for tenant context propagation
 */

import { Prisma } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  userId: string;
  shopId: string | null;
  roles: string[];
  isSuperAdmin: boolean;
}

// AsyncLocalStorage for tenant context
export const tenantContext = new AsyncLocalStorage<TenantContext>();

// Models that require tenant isolation
const TENANT_SCOPED_MODELS = [
  'Shop',
  'User',
  'Receipt',
  'Voucher',
  'Campaign',
  'Redemption',
  'Ad',
  'AuditLog',
  'GdprConsent',
  'ShopConfig',
  'Department',
  'Role', // Tenant-specific roles
] as const;

/**
 * Create RLS middleware that auto-injects shopId filter
 */
export function createTenantIsolationMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const context = tenantContext.getStore();

    // Skip middleware if no context (e.g., seeding, migrations, system operations)
    if (!context) {
      console.warn(
        '[RLS] No tenant context found. Running without isolation. This should only happen during migrations/seeding.'
      );
      return next(params);
    }

    // Super admins bypass RLS for cross-tenant operations
    if (context.isSuperAdmin) {
      return next(params);
    }

    // Only apply to tenant-scoped models
    if (!TENANT_SCOPED_MODELS.includes(params.model as any)) {
      return next(params);
    }

    // Special handling for User model (email must be unique per tenant)
    if (params.model === 'User' && !context.shopId) {
      // Users without shopId (should be super_admin only) can't access regular user data
      if (params.action !== 'create') {
        // Allow super_admin user creation without shopId, but block reads
        throw new Error(
          'TENANT_REQUIRED: User must belong to a shop to access user data. Super admins should specify shopId or bypass RLS.'
        );
      }
    }

    // For non-super-admin users, ensure shopId exists
    if (!context.shopId && params.model !== 'Shop') {
      throw new Error(
        `TENANT_REQUIRED: User ${context.userId} has no shopId. Cannot access ${params.model}.`
      );
    }

    // Inject shopId filter based on action
    switch (params.action) {
      case 'findUnique':
      case 'findFirst':
      case 'findMany':
      case 'findFirstOrThrow':
      case 'findUniqueOrThrow':
      case 'count':
      case 'aggregate':
      case 'groupBy':
        // Add shopId to where clause
        params.args.where = {
          ...params.args.where,
          shopId: context.shopId,
        };
        break;

      case 'create':
        // Auto-inject shopId
        params.args.data = {
          ...params.args.data,
          shopId: context.shopId,
        };
        break;

      case 'createMany':
        // Auto-inject shopId for all records
        if (Array.isArray(params.args.data)) {
          params.args.data = params.args.data.map((item: any) => ({
            ...item,
            shopId: context.shopId,
          }));
        } else {
          params.args.data.shopId = context.shopId;
        }
        break;

      case 'update':
      case 'updateMany':
      case 'delete':
      case 'deleteMany':
        // Ensure operation only affects records from current tenant
        params.args.where = {
          ...params.args.where,
          shopId: context.shopId,
        };
        break;

      case 'upsert':
        // Add shopId to where, create, and update
        params.args.where = {
          ...params.args.where,
          shopId: context.shopId,
        };
        params.args.create = {
          ...params.args.create,
          shopId: context.shopId,
        };
        // Update doesn't need shopId injection (can't change tenant)
        break;

      default:
        // Pass through for other operations
        break;
    }

    const result = await next(params);

    // Security audit: Log sensitive operations
    if (['create', 'update', 'delete'].includes(params.action)) {
      console.log(
        `[RLS] Tenant ${context.shopId} | User ${context.userId} | ${params.action} ${params.model}`
      );
    }

    return result;
  };
}

/**
 * Helper to run code within a tenant context
 */
export async function withTenantContext<T>(
  context: TenantContext,
  fn: () => Promise<T>
): Promise<T> {
  return tenantContext.run(context, fn);
}

/**
 * Get current tenant context (throws if not set)
 */
export function getCurrentTenantContext(): TenantContext {
  const context = tenantContext.getStore();
  if (!context) {
    throw new Error('TENANT_CONTEXT_MISSING: No tenant context available');
  }
  return context;
}

/**
 * Get current tenant context (returns null if not set)
 */
export function getTenantContextOrNull(): TenantContext | null {
  return tenantContext.getStore() || null;
}

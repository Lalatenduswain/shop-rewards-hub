/**
 * Tenant Filtering Utilities
 *
 * Automatically applies tenant scoping to database queries based on user role.
 * Super admins see all data, shop admins see only their shop's data.
 */

import { TRPCError } from '@trpc/server';
import type { Session } from '../trpc';

export interface TenantFilter {
  shopId?: string;
}

/**
 * Apply automatic tenant filtering based on user session
 *
 * @param session - User session from tRPC context
 * @returns Prisma filter object for tenant scoping
 * @throws TRPCError if shop admin has no shopId
 *
 * @example
 * // Super admin - no filter (see everything)
 * applyTenantFilter(superAdminSession) // returns {}
 *
 * // Shop admin - filtered by shopId
 * applyTenantFilter(shopAdminSession) // returns { shopId: "shop-123" }
 */
export function applyTenantFilter(session: Session): TenantFilter {
  // Super admins can see all data across all shops
  if (session.isSuperAdmin) {
    return {};
  }

  // Shop admins must have a shopId
  if (!session.shopId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Shop admin must be associated with a shop',
    });
  }

  // Return filter to scope queries to this shop only
  return { shopId: session.shopId };
}

/**
 * Validate that a resource belongs to the user's shop
 *
 * @param session - User session from tRPC context
 * @param resourceShopId - The shopId of the resource being accessed
 * @throws TRPCError if shop admin tries to access another shop's resource
 *
 * @example
 * const user = await db.user.findUnique({ where: { id } });
 * validateTenantAccess(ctx.session, user.shopId);
 */
export function validateTenantAccess(
  session: Session,
  resourceShopId: string | null
): void {
  // Super admins can access any resource
  if (session.isSuperAdmin) {
    return;
  }

  // Shop admins can only access their own shop's resources
  if (session.shopId !== resourceShopId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have permission to access this resource',
    });
  }
}

/**
 * Create optional tenant filter for super admin queries
 * Allows super admins to optionally filter by shop
 *
 * @param session - User session from tRPC context
 * @param requestedShopId - Optional shopId filter requested by super admin
 * @returns Prisma filter object
 *
 * @example
 * // Super admin viewing specific shop
 * optionalTenantFilter(session, "shop-123") // returns { shopId: "shop-123" }
 *
 * // Super admin viewing all shops
 * optionalTenantFilter(session, undefined) // returns {}
 *
 * // Shop admin (ignores requestedShopId parameter)
 * optionalTenantFilter(session, "shop-456") // returns { shopId: session.shopId }
 */
export function optionalTenantFilter(
  session: Session,
  requestedShopId?: string
): TenantFilter {
  // Super admins can choose to filter by specific shop or see all
  if (session.isSuperAdmin) {
    return requestedShopId ? { shopId: requestedShopId } : {};
  }

  // Shop admins always get their own shop filter
  return applyTenantFilter(session);
}

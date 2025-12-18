/**
 * Permission Utilities
 *
 * Enhanced permission checking middleware and utilities for RBAC.
 * Works with the existing RBACService to enforce permissions at the tRPC layer.
 */

import { TRPCError } from '@trpc/server';
import type { Session } from '../trpc';
import { protectedProcedure } from '../trpc';
import { RBACService } from '../services/rbac';

/**
 * Create a tRPC middleware that requires a specific permission
 * Super admins bypass all permission checks
 *
 * @param module - Permission module (e.g., 'users', 'shops', 'receipts')
 * @param action - Permission action (e.g., 'create', 'update', 'delete', 'approve')
 * @returns tRPC procedure with permission enforcement
 *
 * @example
 * const createUserProcedure = requirePermission('users', 'create');
 *
 * export const usersRouter = createTRPCRouter({
 *   create: createUserProcedure
 *     .input(createUserSchema)
 *     .mutation(async ({ ctx, input }) => {
 *       // User has 'users:create' permission
 *     })
 * });
 */
export const requirePermission = (module: string, action: string) =>
  protectedProcedure.use(async ({ ctx, next }) => {
    // Super admins bypass all permission checks
    if (ctx.session.isSuperAdmin) {
      return next({ ctx });
    }

    // Check if user has the required permission
    const hasPermission = await RBACService.userHasPermission(
      ctx.db,
      ctx.session.userId,
      module,
      action
    );

    if (!hasPermission) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Missing required permission: ${module}:${action}`,
      });
    }

    return next({ ctx });
  });

/**
 * Check if a user has a specific permission
 * Helper function for programmatic permission checks
 *
 * @param session - User session from tRPC context
 * @param db - Prisma client instance
 * @param module - Permission module
 * @param action - Permission action
 * @returns Whether user has the permission
 *
 * @example
 * if (await hasPermission(ctx.session, ctx.db, 'users', 'delete')) {
 *   // Show delete button
 * }
 */
export async function hasPermission(
  session: Session,
  db: any,
  module: string,
  action: string
): Promise<boolean> {
  // Super admins have all permissions
  if (session.isSuperAdmin) {
    return true;
  }

  return await RBACService.userHasPermission(db, session.userId, module, action);
}

/**
 * Require any of multiple permissions (OR logic)
 * User needs at least one of the specified permissions
 *
 * @param permissions - Array of [module, action] tuples
 * @returns tRPC procedure with permission enforcement
 *
 * @example
 * const viewReceiptsProcedure = requireAnyPermission([
 *   ['receipts', 'view'],
 *   ['receipts', 'approve'],
 * ]);
 */
export const requireAnyPermission = (permissions: Array<[string, string]>) =>
  protectedProcedure.use(async ({ ctx, next }) => {
    // Super admins bypass all permission checks
    if (ctx.session.isSuperAdmin) {
      return next({ ctx });
    }

    // Check if user has any of the required permissions
    const hasAnyPermission = await Promise.all(
      permissions.map(([module, action]) =>
        RBACService.userHasPermission(ctx.db, ctx.session.userId, module, action)
      )
    );

    if (!hasAnyPermission.some((has) => has)) {
      const permissionStrings = permissions
        .map(([module, action]) => `${module}:${action}`)
        .join(', ');
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Missing required permissions (need any of): ${permissionStrings}`,
      });
    }

    return next({ ctx });
  });

/**
 * Require all of multiple permissions (AND logic)
 * User needs all of the specified permissions
 *
 * @param permissions - Array of [module, action] tuples
 * @returns tRPC procedure with permission enforcement
 *
 * @example
 * const approveHighValueProcedure = requireAllPermissions([
 *   ['redemptions', 'approve'],
 *   ['redemptions', 'approve_high_value'],
 * ]);
 */
export const requireAllPermissions = (permissions: Array<[string, string]>) =>
  protectedProcedure.use(async ({ ctx, next }) => {
    // Super admins bypass all permission checks
    if (ctx.session.isSuperAdmin) {
      return next({ ctx });
    }

    // Check if user has all of the required permissions
    const hasAllPermissions = await Promise.all(
      permissions.map(([module, action]) =>
        RBACService.userHasPermission(ctx.db, ctx.session.userId, module, action)
      )
    );

    if (!hasAllPermissions.every((has) => has)) {
      const permissionStrings = permissions
        .map(([module, action]) => `${module}:${action}`)
        .join(', ');
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Missing required permissions (need all of): ${permissionStrings}`,
      });
    }

    return next({ ctx });
  });

/**
 * Get all permissions for a user
 * Useful for frontend permission checking and UI rendering
 *
 * @param session - User session from tRPC context
 * @param db - Prisma client instance
 * @returns Array of permission strings in format 'module:action'
 *
 * @example
 * const permissions = await getUserPermissions(ctx.session, ctx.db);
 * // Returns: ['users:create', 'users:update', 'receipts:view', ...]
 */
export async function getUserPermissions(
  session: Session,
  db: any
): Promise<string[]> {
  // Super admins have all permissions
  if (session.isSuperAdmin) {
    return ['*:*']; // Wildcard for all permissions
  }

  // Get all user roles with their permissions
  const userRoles = await db.userRole.findMany({
    where: { userId: session.userId },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  // Extract unique permissions
  const permissionSet = new Set<string>();

  for (const userRole of userRoles) {
    for (const rolePermission of userRole.role.rolePermissions) {
      const permission = rolePermission.permission;
      permissionSet.add(`${permission.module}:${permission.action}`);
    }
  }

  return Array.from(permissionSet);
}

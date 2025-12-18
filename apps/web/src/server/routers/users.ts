/**
 * Users tRPC Router
 *
 * Handles user management operations with tenant scoping and RBAC permissions.
 * Super admins can manage users across all shops.
 * Shop admins can only manage users in their own shop.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, superAdminProcedure } from '../trpc';
import { requirePermission } from '../lib/permissions';
import {
  applyTenantFilter,
  validateTenantAccess,
  optionalTenantFilter,
} from '../lib/tenant-filter';
import { createAuditLog, sanitizeForAudit } from '../lib/audit';
import { hash, compare } from 'bcrypt';

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  roleIds: z.array(z.string()).optional(),
  shopId: z.string().optional(), // For super admins creating shop-level users
  isSuperAdmin: z.boolean().optional().default(false),
});

const updateUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  locked: z.boolean().optional(),
});

const assignRoleSchema = z.object({
  userId: z.string(),
  roleId: z.string(),
});

const listUsersSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  roleId: z.string().optional(),
  shopId: z.string().optional(), // For super admins to filter by shop
});

export const usersRouter = createTRPCRouter({
  /**
   * List users with pagination and filtering
   * Tenant-scoped: Shop admins see only their shop's users
   */
  list: protectedProcedure
    .input(listUsersSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, roleId, shopId } = input;
      const skip = (page - 1) * limit;

      // Apply tenant filtering
      const tenantFilter = optionalTenantFilter(ctx.session, shopId);

      // Build where clause
      const where: any = {
        ...tenantFilter,
        deletedAt: null, // Exclude soft-deleted users
      };

      // Search filter
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Role filter
      if (roleId) {
        where.roles = {
          some: {
            roleId,
          },
        };
      }

      // Fetch users
      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            shop: {
              select: {
                id: true,
                name: true,
              },
            },
            roles: {
              include: {
                role: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            _count: {
              select: {
                sessions: true,
              },
            },
          },
        }),
        ctx.db.user.count({ where }),
      ]);

      return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  /**
   * Get user by ID with full details
   * Validates tenant access
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        include: {
          shop: true,
          roles: {
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
          },
          sessions: {
            where: {
              expiresAt: {
                gte: new Date(),
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 5,
          },
          _count: {
            select: {
              auditLogs: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Validate tenant access
      validateTenantAccess(ctx.session, user.shopId);

      return user;
    }),

  /**
   * Create new user
   * Requires 'users:create' permission
   */
  create: requirePermission('users', 'create')
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, name, password, roleIds, shopId, isSuperAdmin } = input;

      // Determine target shopId
      let targetShopId: string | null = null;

      if (isSuperAdmin) {
        // Only super admins can create other super admins
        if (!ctx.session.isSuperAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only super admins can create super admin accounts',
          });
        }
        // Super admin accounts have no shopId
        targetShopId = null;
      } else {
        // For shop-level users
        if (ctx.session.isSuperAdmin) {
          // Super admin can specify shopId or create platform-level user
          targetShopId = shopId || null;
        } else {
          // Shop admin can only create users in their own shop
          targetShopId = ctx.session.shopId;
        }
      }

      // Check if email already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A user with this email already exists',
        });
      }

      // Hash password
      const passwordHash = await hash(password, 10);

      // Create user
      const user = await ctx.db.user.create({
        data: {
          email,
          name,
          passwordHash,
          isSuperAdmin: isSuperAdmin || false,
          shopId: targetShopId,
        },
      });

      // Assign roles if provided
      if (roleIds && roleIds.length > 0) {
        await ctx.db.userRole.createMany({
          data: roleIds.map((roleId) => ({
            userId: user.id,
            roleId,
          })),
        });
      }

      // Create audit log
      await createAuditLog(ctx.db, ctx.session, {
        action: 'CREATE',
        resource: 'user',
        resourceId: user.id,
        changesAfter: sanitizeForAudit({
          email: user.email,
          name: user.name,
          isSuperAdmin: user.isSuperAdmin,
          shopId: user.shopId,
        }),
      });

      return user;
    }),

  /**
   * Update user details
   * Requires 'users:update' permission
   */
  update: requirePermission('users', 'update')
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      // Get existing user
      const existingUser = await ctx.db.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Validate tenant access
      validateTenantAccess(ctx.session, existingUser.shopId);

      // Prevent shop admins from modifying super admins
      if (existingUser.isSuperAdmin && !ctx.session.isSuperAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot modify super admin accounts',
        });
      }

      // Check email uniqueness if email is being changed
      if (updates.email && updates.email !== existingUser.email) {
        const emailExists = await ctx.db.user.findUnique({
          where: { email: updates.email },
        });

        if (emailExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A user with this email already exists',
          });
        }
      }

      // Update user
      const user = await ctx.db.user.update({
        where: { id },
        data: updates,
      });

      // Create audit log
      await createAuditLog(ctx.db, ctx.session, {
        action: 'UPDATE',
        resource: 'user',
        resourceId: user.id,
        changesBefore: sanitizeForAudit(existingUser),
        changesAfter: sanitizeForAudit(user),
      });

      return user;
    }),

  /**
   * Soft delete user
   * Requires 'users:delete' permission
   */
  delete: requirePermission('users', 'delete')
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Validate tenant access
      validateTenantAccess(ctx.session, user.shopId);

      // Prevent shop admins from deleting super admins
      if (user.isSuperAdmin && !ctx.session.isSuperAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete super admin accounts',
        });
      }

      // Prevent self-deletion
      if (user.id === ctx.session.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete your own account',
        });
      }

      // Soft delete
      const deletedUser = await ctx.db.user.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      // Revoke all active sessions
      await ctx.db.session.updateMany({
        where: {
          userId: input.id,
          expiresAt: {
            gte: new Date(),
          },
        },
        data: {
          expiresAt: new Date(), // Expire immediately
        },
      });

      // Create audit log
      await createAuditLog(ctx.db, ctx.session, {
        action: 'DELETE',
        resource: 'user',
        resourceId: input.id,
        changesBefore: sanitizeForAudit(user),
      });

      return deletedUser;
    }),

  /**
   * Assign role to user
   * Requires 'users:manage_roles' permission
   */
  assignRole: requirePermission('users', 'manage_roles')
    .input(assignRoleSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, roleId } = input;

      // Validate user exists and tenant access
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      validateTenantAccess(ctx.session, user.shopId);

      // Validate role exists
      const role = await ctx.db.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Role not found',
        });
      }

      // Check if assignment already exists
      const existing = await ctx.db.userRole.findFirst({
        where: {
          userId,
          roleId,
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already has this role',
        });
      }

      // Create assignment
      const userRole = await ctx.db.userRole.create({
        data: {
          userId,
          roleId,
        },
      });

      // Create audit log
      await createAuditLog(ctx.db, ctx.session, {
        action: 'ASSIGN_ROLE',
        resource: 'user',
        resourceId: userId,
        metadata: {
          roleId,
          roleName: role.name,
        },
      });

      return userRole;
    }),

  /**
   * Remove role from user
   * Requires 'users:manage_roles' permission
   */
  removeRole: requirePermission('users', 'manage_roles')
    .input(assignRoleSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, roleId } = input;

      // Validate user exists and tenant access
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      validateTenantAccess(ctx.session, user.shopId);

      // Find assignment
      const userRole = await ctx.db.userRole.findFirst({
        where: {
          userId,
          roleId,
        },
        include: {
          role: true,
        },
      });

      if (!userRole) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User does not have this role',
        });
      }

      // Delete assignment
      await ctx.db.userRole.delete({
        where: {
          id: userRole.id,
        },
      });

      // Create audit log
      await createAuditLog(ctx.db, ctx.session, {
        action: 'REMOVE_ROLE',
        resource: 'user',
        resourceId: userId,
        metadata: {
          roleId,
          roleName: userRole.role.name,
        },
      });

      return { success: true };
    }),

  /**
   * Toggle user locked status
   * Super admin only
   */
  toggleStatus: superAdminProcedure
    .input(z.object({ id: z.string(), locked: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: input.id },
        data: { locked: input.locked },
      });

      // Create audit log
      await createAuditLog(ctx.db, ctx.session, {
        action: input.locked ? 'SUSPEND' : 'ACTIVATE',
        resource: 'user',
        resourceId: input.id,
        metadata: {
          locked: input.locked,
        },
      });

      return user;
    }),

  /**
   * Reset user password
   * Requires 'users:reset_password' permission
   */
  resetPassword: requirePermission('users', 'reset_password')
    .input(z.object({ id: z.string(), newPassword: z.string().min(8) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Validate tenant access
      validateTenantAccess(ctx.session, user.shopId);

      // Hash new password
      const passwordHash = await hash(input.newPassword, 10);

      // Update password
      await ctx.db.user.update({
        where: { id: input.id },
        data: { passwordHash },
      });

      // Create audit log
      await createAuditLog(ctx.db, ctx.session, {
        action: 'RESET_PASSWORD',
        resource: 'user',
        resourceId: input.id,
        metadata: {
          targetIsSuperAdmin: user.isSuperAdmin,
        },
        isSuspicious: user.isSuperAdmin, // Flag password resets on super admin accounts
      });

      return { success: true };
    }),
});

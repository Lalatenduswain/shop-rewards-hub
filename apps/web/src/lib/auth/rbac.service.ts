/**
 * RBAC Service
 *
 * Handles role-based access control (RBAC) operations.
 * Provides permission checking, user permission retrieval, and role validation.
 */

import 'server-only';
import { prisma } from '@shop-rewards/db';
import {
  hasPermission as checkPermission,
  isSuperAdminRole,
  getRolePermissions as getDefaultRolePermissions,
} from '@shop-rewards/shared/constants';

/**
 * Get all permissions for a user
 *
 * @param userId - User ID
 * @returns Array of permission strings (e.g., ["shops:read", "users:create"])
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  console.log('[RBAC Service] Fetching permissions for user:', userId);

  // Fetch user with their roles and permissions
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    console.warn('[RBAC Service] User not found:', userId);
    return [];
  }

  // Collect all unique permissions from all roles
  const permissionsSet = new Set<string>();

  for (const userRole of user.roles) {
    const role = userRole.role;

    for (const rolePermission of role.permissions) {
      const permission = rolePermission.permission;
      const permissionString = `${permission.module}:${permission.action}`;
      permissionsSet.add(permissionString);
    }
  }

  const permissions = Array.from(permissionsSet);

  console.log('[RBAC Service] User permissions:', {
    userId,
    permissionCount: permissions.length,
    isSuperAdmin: isSuperAdminRole(permissions),
  });

  return permissions;
}

/**
 * Check if user has a specific permission
 *
 * @param userId - User ID
 * @param module - Permission module (e.g., "shops")
 * @param action - Permission action (e.g., "read")
 * @returns True if user has permission
 */
export async function userHasPermission(
  userId: string,
  module: string,
  action: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  const hasAccess = checkPermission(permissions, module, action);

  console.log('[RBAC Service] Permission check:', {
    userId,
    module,
    action,
    hasAccess,
  });

  return hasAccess;
}

/**
 * Check if user is super admin
 *
 * @param userId - User ID
 * @returns True if user is super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return isSuperAdminRole(permissions);
}

/**
 * Get user roles
 *
 * @param userId - User ID
 * @returns Array of role names
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  console.log('[RBAC Service] Fetching roles for user:', userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    console.warn('[RBAC Service] User not found:', userId);
    return [];
  }

  const roleNames = user.roles.map((userRole) => userRole.role.name);

  console.log('[RBAC Service] User roles:', {
    userId,
    roles: roleNames,
  });

  return roleNames;
}

/**
 * Assign role to user
 *
 * @param userId - User ID
 * @param roleName - Role name to assign
 * @param shopId - Shop ID (null for global roles like super_admin)
 * @returns True if role assigned successfully
 */
export async function assignRoleToUser(
  userId: string,
  roleName: string,
  shopId: string | null = null
): Promise<boolean> {
  console.log('[RBAC Service] Assigning role to user:', {
    userId,
    roleName,
    shopId,
  });

  try {
    // Find the role
    const role = await prisma.role.findFirst({
      where: {
        name: roleName,
        shopId,
      },
    });

    if (!role) {
      console.error('[RBAC Service] Role not found:', roleName);
      return false;
    }

    // Check if user already has this role
    const existingUserRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
    });

    if (existingUserRole) {
      console.warn('[RBAC Service] User already has role:', roleName);
      return true;
    }

    // Assign role
    await prisma.userRole.create({
      data: {
        userId,
        roleId: role.id,
      },
    });

    console.log('[RBAC Service] Role assigned successfully:', {
      userId,
      roleName,
    });

    return true;
  } catch (error) {
    console.error('[RBAC Service] Error assigning role:', error);
    return false;
  }
}

/**
 * Remove role from user
 *
 * @param userId - User ID
 * @param roleName - Role name to remove
 * @param shopId - Shop ID (null for global roles)
 * @returns True if role removed successfully
 */
export async function removeRoleFromUser(
  userId: string,
  roleName: string,
  shopId: string | null = null
): Promise<boolean> {
  console.log('[RBAC Service] Removing role from user:', {
    userId,
    roleName,
    shopId,
  });

  try {
    // Find the role
    const role = await prisma.role.findFirst({
      where: {
        name: roleName,
        shopId,
      },
    });

    if (!role) {
      console.error('[RBAC Service] Role not found:', roleName);
      return false;
    }

    // Remove user role
    await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
    });

    console.log('[RBAC Service] Role removed successfully:', {
      userId,
      roleName,
    });

    return true;
  } catch (error) {
    console.error('[RBAC Service] Error removing role:', error);
    return false;
  }
}

/**
 * Create custom role
 *
 * @param name - Role name
 * @param description - Role description
 * @param permissions - Array of permission strings
 * @param shopId - Shop ID (null for global roles)
 * @returns Created role ID or null on failure
 */
export async function createCustomRole(
  name: string,
  description: string,
  permissions: string[],
  shopId: string | null = null
): Promise<string | null> {
  console.log('[RBAC Service] Creating custom role:', {
    name,
    shopId,
    permissionCount: permissions.length,
  });

  try {
    // Create role
    const role = await prisma.role.create({
      data: {
        name,
        displayName: name,
        description,
        shopId,
        isSystemRole: false,
      },
    });

    // Assign permissions to role
    for (const permissionString of permissions) {
      const [module, action] = permissionString.split(':');

      if (!module || !action) {
        console.warn('[RBAC Service] Invalid permission format:', permissionString);
        continue;
      }

      // Find or create permission
      let permission = await prisma.permission.findFirst({
        where: { module, action },
      });

      if (!permission) {
        permission = await prisma.permission.create({
          data: {
            module,
            action,
            description: `${module} ${action}`,
          },
        });
      }

      // Link permission to role
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }

    console.log('[RBAC Service] Custom role created:', {
      roleId: role.id,
      name,
    });

    return role.id;
  } catch (error) {
    console.error('[RBAC Service] Error creating custom role:', error);
    return null;
  }
}

/**
 * Require permission middleware helper
 * Used in tRPC middleware to check permissions
 *
 * @param userId - User ID from context
 * @param module - Permission module
 * @param action - Permission action
 * @throws Error if user lacks permission
 */
export async function requirePermission(
  userId: string,
  module: string,
  action: string
): Promise<void> {
  const hasAccess = await userHasPermission(userId, module, action);

  if (!hasAccess) {
    console.error('[RBAC Service] Permission denied:', {
      userId,
      module,
      action,
    });

    throw new Error(
      `PERMISSION_DENIED: Missing ${module}:${action} permission`
    );
  }
}

/**
 * Batch permission check
 * Check if user has ALL required permissions
 *
 * @param userId - User ID
 * @param requiredPermissions - Array of [module, action] tuples
 * @returns True if user has all permissions
 */
export async function hasAllPermissions(
  userId: string,
  requiredPermissions: Array<[string, string]>
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);

  for (const [module, action] of requiredPermissions) {
    if (!checkPermission(userPermissions, module, action)) {
      return false;
    }
  }

  return true;
}

/**
 * Batch permission check
 * Check if user has ANY of the required permissions
 *
 * @param userId - User ID
 * @param requiredPermissions - Array of [module, action] tuples
 * @returns True if user has at least one permission
 */
export async function hasAnyPermission(
  userId: string,
  requiredPermissions: Array<[string, string]>
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);

  for (const [module, action] of requiredPermissions) {
    if (checkPermission(userPermissions, module, action)) {
      return true;
    }
  }

  return false;
}

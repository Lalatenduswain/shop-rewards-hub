/**
 * Permission and Role Seed Script
 *
 * Seeds the database with all system permissions and default roles.
 * This should be run after migrations to set up RBAC system.
 */

import { PrismaClient } from '@prisma/client';
import {
  PERMISSIONS,
  DEFAULT_ROLES,
  type Permission as PermissionDefinition,
  type RoleDefinition,
} from '@shop-rewards/shared/constants/roles';

const prisma = new PrismaClient();

/**
 * Seed all system permissions
 */
async function seedPermissions(): Promise<void> {
  console.log('[Seed] Seeding permissions...');

  let createdCount = 0;
  let updatedCount = 0;

  for (const permission of PERMISSIONS) {
    const existing = await prisma.permission.findFirst({
      where: {
        module: permission.module,
        action: permission.action,
      },
    });

    if (existing) {
      // Update description if changed
      if (existing.description !== permission.description) {
        await prisma.permission.update({
          where: { id: existing.id },
          data: { description: permission.description },
        });
        updatedCount++;
      }
    } else {
      // Create new permission
      await prisma.permission.create({
        data: {
          module: permission.module,
          action: permission.action,
          description: permission.description,
        },
      });
      createdCount++;
    }
  }

  console.log('[Seed] Permissions seeded:', {
    total: PERMISSIONS.length,
    created: createdCount,
    updated: updatedCount,
    skipped: PERMISSIONS.length - createdCount - updatedCount,
  });
}

/**
 * Seed default roles with permissions
 */
async function seedRoles(): Promise<void> {
  console.log('[Seed] Seeding default roles...');

  let createdCount = 0;
  let updatedCount = 0;

  for (const roleDefinition of DEFAULT_ROLES) {
    const existing = await prisma.role.findFirst({
      where: {
        name: roleDefinition.name,
        shopId: roleDefinition.isGlobal ? null : undefined,
        isDefault: true,
      },
    });

    let role;

    if (existing) {
      // Update description if changed
      if (existing.description !== roleDefinition.description) {
        role = await prisma.role.update({
          where: { id: existing.id },
          data: {
            description: roleDefinition.description,
          },
        });
        updatedCount++;
      } else {
        role = existing;
      }
    } else {
      // Create new role
      role = await prisma.role.create({
        data: {
          name: roleDefinition.name,
          description: roleDefinition.description,
          shopId: roleDefinition.isGlobal ? null : undefined,
          isDefault: true,
        },
      });
      createdCount++;
    }

    // Sync permissions for this role
    await syncRolePermissions(role.id, roleDefinition.permissions);
  }

  console.log('[Seed] Default roles seeded:', {
    total: DEFAULT_ROLES.length,
    created: createdCount,
    updated: updatedCount,
    skipped: DEFAULT_ROLES.length - createdCount - updatedCount,
  });
}

/**
 * Sync permissions for a role
 * Removes old permissions and adds new ones
 */
async function syncRolePermissions(
  roleId: string,
  permissionStrings: string[]
): Promise<void> {
  // Handle wildcard permission (super_admin)
  if (permissionStrings.includes('*:*')) {
    console.log('[Seed] Role has wildcard permission (*:*), skipping sync');

    // Delete all existing role permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Find or create wildcard permission
    let wildcardPermission = await prisma.permission.findFirst({
      where: {
        module: '*',
        action: '*',
      },
    });

    if (!wildcardPermission) {
      wildcardPermission = await prisma.permission.create({
        data: {
          module: '*',
          action: '*',
          description: 'Wildcard permission - grants all access',
        },
      });
    }

    // Add wildcard permission to role
    await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId: wildcardPermission.id,
      },
    });

    return;
  }

  // Get all current permissions for this role
  const currentRolePermissions = await prisma.rolePermission.findMany({
    where: { roleId },
    include: { permission: true },
  });

  const currentPermissionStrings = currentRolePermissions.map(
    (rp) => `${rp.permission.module}:${rp.permission.action}`
  );

  // Find permissions to add (in new list but not in current)
  const toAdd = permissionStrings.filter(
    (p) => !currentPermissionStrings.includes(p)
  );

  // Find permissions to remove (in current but not in new list)
  const toRemove = currentPermissionStrings.filter(
    (p) => !permissionStrings.includes(p)
  );

  // Remove old permissions
  for (const permString of toRemove) {
    const [module, action] = permString.split(':');
    const permission = await prisma.permission.findFirst({
      where: { module, action },
    });

    if (permission) {
      await prisma.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId: permission.id,
        },
      });
    }
  }

  // Add new permissions
  for (const permString of toAdd) {
    const [module, action] = permString.split(':');

    if (!module || !action) {
      console.warn('[Seed] Invalid permission format:', permString);
      continue;
    }

    let permission = await prisma.permission.findFirst({
      where: { module, action },
    });

    if (!permission) {
      console.warn('[Seed] Permission not found:', permString);
      continue;
    }

    await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId: permission.id,
      },
    });
  }

  if (toAdd.length > 0 || toRemove.length > 0) {
    console.log('[Seed] Synced role permissions:', {
      roleId,
      added: toAdd.length,
      removed: toRemove.length,
    });
  }
}

/**
 * Main seed function
 */
async function main() {
  console.log('[Seed] Starting RBAC seed...');

  try {
    // Seed permissions first
    await seedPermissions();

    // Then seed roles with permissions
    await seedRoles();

    console.log('[Seed] ✓ RBAC seed completed successfully');
  } catch (error) {
    console.error('[Seed] ✗ RBAC seed failed:', error);
    throw error;
  }
}

// Run seed
main()
  .catch((error) => {
    console.error('[Seed] Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Export for use in other seed scripts
export { seedPermissions, seedRoles };

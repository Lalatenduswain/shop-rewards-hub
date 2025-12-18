/**
 * Database seeding script
 * Seeds initial roles, permissions, and super admin user
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

const PERMISSIONS = [
  // Shop management
  { module: 'shops', action: 'create', description: 'Create new shop (super admin only)' },
  { module: 'shops', action: 'read', description: 'View shop details' },
  { module: 'shops', action: 'update', description: 'Update shop settings' },
  { module: 'shops', action: 'delete', description: 'Delete shop (super admin only)' },
  { module: 'shops', action: 'approve', description: 'Approve pending shop enrollments' },
  // User management
  { module: 'users', action: 'create', description: 'Create new users' },
  { module: 'users', action: 'read', description: 'View user list' },
  { module: 'users', action: 'update', description: 'Update user details' },
  { module: 'users', action: 'delete', description: 'Delete users' },
  { module: 'users', action: 'force_logout', description: 'Force user logout' },
  // Voucher management
  { module: 'vouchers', action: 'create', description: 'Create vouchers' },
  { module: 'vouchers', action: 'read', description: 'View vouchers' },
  { module: 'vouchers', action: 'update', description: 'Update vouchers' },
  { module: 'vouchers', action: 'delete', description: 'Delete vouchers' },
  { module: 'vouchers', action: 'approve', description: 'Approve voucher generation' },
  // Receipt management
  { module: 'receipts', action: 'create', description: 'Upload receipts' },
  { module: 'receipts', action: 'read', description: 'View all receipts' },
  { module: 'receipts', action: 'read_own', description: 'View own receipts only' },
  { module: 'receipts', action: 'delete', description: 'Delete receipts' },
  // Redemption management
  { module: 'redemptions', action: 'create', description: 'Create redemptions' },
  { module: 'redemptions', action: 'read', description: 'View all redemptions' },
  { module: 'redemptions', action: 'read_own', description: 'View own redemptions only' },
  { module: 'redemptions', action: 'approve', description: 'Approve redemptions' },
  // Ad management
  { module: 'ads', action: 'create', description: 'Create ads' },
  { module: 'ads', action: 'read', description: 'View ads' },
  { module: 'ads', action: 'update', description: 'Update ads' },
  { module: 'ads', action: 'delete', description: 'Delete ads' },
  { module: 'ads', action: 'view_analytics', description: 'View ad analytics' },
  // Analytics
  { module: 'analytics', action: 'view_dashboard', description: 'View analytics dashboard' },
  { module: 'analytics', action: 'export', description: 'Export analytics data' },
  // Audit logs
  { module: 'audit', action: 'read', description: 'View audit logs' },
  { module: 'audit', action: 'read_all_tenants', description: 'View audit logs across tenants' },
  // System
  { module: 'system', action: 'configure', description: 'Configure system settings' },
];

const ROLES = [
  {
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Platform-wide administrator with access to all tenants',
    isSystemRole: true,
    shopId: null,
    permissions: ['*:*'], // All permissions
  },
  {
    name: 'admin',
    displayName: 'Shop Administrator',
    description: 'Shop owner with full control over their shop',
    isSystemRole: true,
    shopId: null,
    permissions: [
      'shops:read',
      'shops:update',
      'users:create',
      'users:read',
      'users:update',
      'users:delete',
      'users:force_logout',
      'vouchers:create',
      'vouchers:read',
      'vouchers:update',
      'vouchers:delete',
      'vouchers:approve',
      'receipts:read',
      'receipts:delete',
      'redemptions:read',
      'redemptions:approve',
      'ads:create',
      'ads:read',
      'ads:update',
      'ads:delete',
      'ads:view_analytics',
      'analytics:view_dashboard',
      'analytics:export',
      'audit:read',
    ],
  },
  {
    name: 'user',
    displayName: 'End User',
    description: 'Customer with limited access to own data',
    isSystemRole: true,
    shopId: null,
    permissions: [
      'receipts:create',
      'receipts:read_own',
      'vouchers:read',
      'redemptions:create',
      'redemptions:read_own',
    ],
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create permissions
  console.log('📝 Creating permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { module_action: { module: perm.module, action: perm.action } },
      update: {},
      create: perm,
    });
  }
  console.log(`✅ Created ${PERMISSIONS.length} permissions`);

  // 2. Create roles with permissions
  console.log('👥 Creating roles...');
  for (const roleData of ROLES) {
    // Check if role exists
    let role = await prisma.role.findFirst({
      where: {
        name: roleData.name,
        shopId: null,
      },
    });

    // Create if it doesn't exist
    if (!role) {
      role = await prisma.role.create({
        data: {
          name: roleData.name,
          displayName: roleData.displayName,
          description: roleData.description,
          isSystemRole: roleData.isSystemRole,
          shopId: roleData.shopId,
        },
      });
    }

    // Assign permissions
    if (roleData.permissions.includes('*:*')) {
      // Super admin gets all permissions
      const allPermissions = await prisma.permission.findMany();
      for (const perm of allPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: role.id, permissionId: perm.id },
          },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
      console.log(`  ✅ ${role.displayName}: ALL permissions`);
    } else {
      // Other roles get specific permissions
      for (const permStr of roleData.permissions) {
        const [module, action] = permStr.split(':');
        const perm = await prisma.permission.findUnique({
          where: { module_action: { module, action } },
        });

        if (perm) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: { roleId: role.id, permissionId: perm.id },
            },
            update: {},
            create: { roleId: role.id, permissionId: perm.id },
          });
        }
      }
      console.log(`  ✅ ${role.displayName}: ${roleData.permissions.length} permissions`);
    }
  }

  // 3. Create default super admin user (if not exists)
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@shoprewards.local';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!';

  const existingAdmin = await prisma.user.findFirst({
    where: {
      email: superAdminEmail,
      shopId: null,
    },
  });

  if (!existingAdmin) {
    console.log('👤 Creating super admin user...');
    const passwordHash = await hash(superAdminPassword, 12);
    const superAdminRole = await prisma.role.findFirst({
      where: { name: 'super_admin', shopId: null },
    });

    if (!superAdminRole) {
      throw new Error('Super admin role not found');
    }

    const adminUser = await prisma.user.create({
      data: {
        email: superAdminEmail,
        passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        name: 'Super Admin',
        isSuperAdmin: true,
        shopId: null, // Super admin has no shop
      },
    });

    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    });

    console.log(`✅ Super admin created: ${superAdminEmail}`);
    console.log(`🔑 Password: ${superAdminPassword}`);
    console.log('⚠️  IMPORTANT: Change this password after first login!');
  } else {
    console.log('ℹ️  Super admin already exists, skipping creation');
  }

  // 4. Create default security policy
  console.log('🔒 Creating default security policy...');
  await prisma.securityPolicy.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      minPasswordLength: 12,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      sessionTimeout: 3600,
      dataRetentionDays: 30,
      mfaRequired: false,
    },
  });

  console.log('✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

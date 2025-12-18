/**
 * Pre-defined roles and permissions for RBAC system
 * @module constants/roles
 */

/**
 * Permission structure: module:action
 */
export interface Permission {
  module: string;
  action: string;
  description: string;
}

/**
 * All system permissions
 */
export const PERMISSIONS: Permission[] = [
  // Shop management
  { module: 'shops', action: 'create', description: 'Create new shop' },
  { module: 'shops', action: 'read', description: 'View shop details' },
  { module: 'shops', action: 'update', description: 'Update shop information' },
  { module: 'shops', action: 'delete', description: 'Delete shop' },
  { module: 'shops', action: 'approve', description: 'Approve shop enrollment' },
  { module: 'shops', action: 'suspend', description: 'Suspend shop' },

  // User management
  { module: 'users', action: 'create', description: 'Create new user' },
  { module: 'users', action: 'read', description: 'View user details' },
  { module: 'users', action: 'read_all', description: 'View all users across tenants' },
  { module: 'users', action: 'update', description: 'Update user information' },
  { module: 'users', action: 'delete', description: 'Delete user' },
  { module: 'users', action: 'assign_roles', description: 'Assign roles to users' },

  // Receipt management
  { module: 'receipts', action: 'create', description: 'Upload receipt' },
  { module: 'receipts', action: 'read', description: 'View receipts' },
  { module: 'receipts', action: 'read_own', description: 'View own receipts only' },
  { module: 'receipts', action: 'update', description: 'Update receipt details' },
  { module: 'receipts', action: 'delete', description: 'Delete receipt' },
  { module: 'receipts', action: 'verify', description: 'Verify receipt authenticity' },
  { module: 'receipts', action: 'reject', description: 'Reject receipt' },

  // Voucher management
  { module: 'vouchers', action: 'create', description: 'Create voucher' },
  { module: 'vouchers', action: 'read', description: 'View vouchers' },
  { module: 'vouchers', action: 'update', description: 'Update voucher' },
  { module: 'vouchers', action: 'delete', description: 'Delete voucher' },
  { module: 'vouchers', action: 'approve', description: 'Approve voucher' },
  { module: 'vouchers', action: 'redeem', description: 'Redeem voucher' },

  // Campaign management
  { module: 'campaigns', action: 'create', description: 'Create campaign' },
  { module: 'campaigns', action: 'read', description: 'View campaigns' },
  { module: 'campaigns', action: 'update', description: 'Update campaign' },
  { module: 'campaigns', action: 'delete', description: 'Delete campaign' },
  { module: 'campaigns', action: 'activate', description: 'Activate campaign' },
  { module: 'campaigns', action: 'pause', description: 'Pause campaign' },

  // Ad management
  { module: 'ads', action: 'create', description: 'Create ad' },
  { module: 'ads', action: 'read', description: 'View ads' },
  { module: 'ads', action: 'update', description: 'Update ad' },
  { module: 'ads', action: 'delete', description: 'Delete ad' },
  { module: 'ads', action: 'approve', description: 'Approve ad' },
  { module: 'ads', action: 'view_analytics', description: 'View ad analytics' },

  // Analytics
  { module: 'analytics', action: 'view', description: 'View analytics dashboard' },
  { module: 'analytics', action: 'view_all', description: 'View all tenants analytics' },
  { module: 'analytics', action: 'export', description: 'Export analytics data' },

  // RBAC management
  { module: 'roles', action: 'create', description: 'Create roles' },
  { module: 'roles', action: 'read', description: 'View roles' },
  { module: 'roles', action: 'update', description: 'Update roles' },
  { module: 'roles', action: 'delete', description: 'Delete roles' },

  // System configuration
  { module: 'config', action: 'read', description: 'View system config' },
  { module: 'config', action: 'update', description: 'Update system config' },
  { module: 'config', action: 'manage_integrations', description: 'Manage integrations' },

  // Audit logs
  { module: 'audit', action: 'read', description: 'View audit logs' },
  { module: 'audit', action: 'read_all', description: 'View all audit logs across tenants' },
  { module: 'audit', action: 'export', description: 'Export audit logs' },

  // GDPR
  { module: 'gdpr', action: 'export_data', description: 'Export user data' },
  { module: 'gdpr', action: 'delete_data', description: 'Delete user data' },
  { module: 'gdpr', action: 'manage_consents', description: 'Manage GDPR consents' },

  // Billing
  { module: 'billing', action: 'view', description: 'View billing information' },
  { module: 'billing', action: 'manage', description: 'Manage billing settings' },
  { module: 'billing', action: 'view_all', description: 'View all tenants billing' },
];

/**
 * Role definition
 */
export interface RoleDefinition {
  name: string;
  description: string;
  permissions: string[];
  isGlobal: boolean; // If true, shopId is null
  isDefault: boolean; // If true, automatically seeded
}

/**
 * Pre-defined roles
 */
export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    name: 'super_admin',
    description: 'Super administrator with full system access',
    permissions: ['*:*'], // Wildcard for all permissions
    isGlobal: true,
    isDefault: true,
  },
  {
    name: 'admin',
    description: 'Shop administrator with full shop management access',
    permissions: [
      'shops:read',
      'shops:update',
      'users:create',
      'users:read',
      'users:update',
      'users:delete',
      'users:assign_roles',
      'receipts:read',
      'receipts:verify',
      'receipts:reject',
      'vouchers:create',
      'vouchers:read',
      'vouchers:update',
      'vouchers:delete',
      'vouchers:approve',
      'campaigns:create',
      'campaigns:read',
      'campaigns:update',
      'campaigns:delete',
      'campaigns:activate',
      'campaigns:pause',
      'ads:create',
      'ads:read',
      'ads:update',
      'ads:delete',
      'ads:view_analytics',
      'analytics:view',
      'analytics:export',
      'roles:create',
      'roles:read',
      'roles:update',
      'roles:delete',
      'config:read',
      'config:update',
      'audit:read',
      'audit:export',
      'gdpr:export_data',
      'gdpr:delete_data',
      'gdpr:manage_consents',
      'billing:view',
      'billing:manage',
    ],
    isGlobal: false,
    isDefault: true,
  },
  {
    name: 'user',
    description: 'End user with basic access',
    permissions: [
      'receipts:create',
      'receipts:read_own',
      'vouchers:read',
      'vouchers:redeem',
      'gdpr:export_data',
    ],
    isGlobal: false,
    isDefault: true,
  },
];

/**
 * Helper function to check if a user has a specific permission
 */
export function hasPermission(
  userPermissions: string[],
  module: string,
  action: string
): boolean {
  // Check for wildcard permission (super_admin)
  if (userPermissions.includes('*:*')) {
    return true;
  }

  // Check for module wildcard (e.g., 'shops:*')
  if (userPermissions.includes(`${module}:*`)) {
    return true;
  }

  // Check for exact permission match
  return userPermissions.includes(`${module}:${action}`);
}

/**
 * Helper function to get permission string
 */
export function getPermissionString(module: string, action: string): string {
  return `${module}:${action}`;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(roleName: string): string[] {
  const role = DEFAULT_ROLES.find((r) => r.name === roleName);
  return role?.permissions || [];
}

/**
 * Check if a role is a super admin
 */
export function isSuperAdminRole(permissions: string[]): boolean {
  return permissions.includes('*:*');
}

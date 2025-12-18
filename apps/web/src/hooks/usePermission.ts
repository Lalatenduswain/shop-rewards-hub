'use client';

/**
 * Permission Hook
 *
 * Check if the current user has a specific permission.
 * Used for conditional rendering and feature gating in the UI.
 */

import { useAuth } from '@/contexts/AuthContext';

/**
 * Check if user has a specific permission
 *
 * @param module - Permission module (e.g., 'users', 'shops', 'receipts')
 * @param action - Permission action (e.g., 'create', 'update', 'delete')
 * @returns Whether user has the permission
 *
 * @example
 * function UserList() {
 *   const canCreate = usePermission('users', 'create');
 *   const canDelete = usePermission('users', 'delete');
 *
 *   return (
 *     <div>
 *       {canCreate && <button>Create User</button>}
 *       {canDelete && <button>Delete User</button>}
 *     </div>
 *   );
 * }
 */
export function usePermission(module: string, action: string): boolean {
  const { user } = useAuth();

  // Not authenticated - no permissions
  if (!user) {
    return false;
  }

  // Super admins have all permissions
  if (user.isSuperAdmin) {
    return true;
  }

  // Check if user has the specific permission
  const permissionString = `${module}:${action}`;
  return user.permissions.includes(permissionString);
}

/**
 * Check if user has any of the specified permissions (OR logic)
 *
 * @param permissions - Array of [module, action] tuples
 * @returns Whether user has at least one permission
 *
 * @example
 * const canViewReceipts = useAnyPermission([
 *   ['receipts', 'view'],
 *   ['receipts', 'approve'],
 * ]);
 */
export function useAnyPermission(
  permissions: Array<[string, string]>
): boolean {
  const { user } = useAuth();

  if (!user) {
    return false;
  }

  if (user.isSuperAdmin) {
    return true;
  }

  return permissions.some(([module, action]) => {
    const permissionString = `${module}:${action}`;
    return user.permissions.includes(permissionString);
  });
}

/**
 * Check if user has all of the specified permissions (AND logic)
 *
 * @param permissions - Array of [module, action] tuples
 * @returns Whether user has all permissions
 *
 * @example
 * const canApproveHighValue = useAllPermissions([
 *   ['redemptions', 'approve'],
 *   ['redemptions', 'approve_high_value'],
 * ]);
 */
export function useAllPermissions(
  permissions: Array<[string, string]>
): boolean {
  const { user } = useAuth();

  if (!user) {
    return false;
  }

  if (user.isSuperAdmin) {
    return true;
  }

  return permissions.every(([module, action]) => {
    const permissionString = `${module}:${action}`;
    return user.permissions.includes(permissionString);
  });
}

/**
 * Check if user is a super admin
 *
 * @returns Whether user is a super admin
 *
 * @example
 * const isSuperAdmin = useIsSuperAdmin();
 *
 * if (isSuperAdmin) {
 *   // Show super admin features
 * }
 */
export function useIsSuperAdmin(): boolean {
  const { user } = useAuth();
  return user?.isSuperAdmin || false;
}

/**
 * Get all user permissions as an array
 *
 * @returns Array of permission strings in format 'module:action'
 *
 * @example
 * const permissions = useUserPermissions();
 * console.log(permissions); // ['users:create', 'users:update', ...]
 */
export function useUserPermissions(): string[] {
  const { user } = useAuth();

  if (!user) {
    return [];
  }

  if (user.isSuperAdmin) {
    return ['*:*']; // Wildcard for all permissions
  }

  return user.permissions;
}

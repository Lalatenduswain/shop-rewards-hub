'use client';

/**
 * Require Permission Component
 *
 * Conditional rendering wrapper for permission-based features.
 * Only renders children if user has the required permission.
 */

import { usePermission } from '@/hooks/usePermission';

interface RequirePermissionProps {
  module: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RequirePermission({
  module,
  action,
  children,
  fallback = null,
}: RequirePermissionProps) {
  const hasPermission = usePermission(module, action);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

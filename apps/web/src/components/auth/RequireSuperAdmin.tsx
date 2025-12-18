'use client';

/**
 * Require Super Admin Component
 *
 * Conditional rendering wrapper for super admin only features.
 * Only renders children if user is a super admin.
 */

import { useIsSuperAdmin } from '@/hooks/usePermission';

interface RequireSuperAdminProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RequireSuperAdmin({
  children,
  fallback = null,
}: RequireSuperAdminProps) {
  const isSuperAdmin = useIsSuperAdmin();

  if (!isSuperAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

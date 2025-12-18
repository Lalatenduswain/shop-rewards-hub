/**
 * Admin Section Layout
 *
 * Wraps all admin pages with the AdminLayout component.
 * This provides the sidebar, header, and authentication protection.
 */

import AdminLayout from '@/components/admin/layout/AdminLayout';

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}

/**
 * Audit Logging Utilities
 *
 * Creates comprehensive audit trails for all mutations and sensitive operations.
 * Tracks who did what, when, and what changed.
 */

import type { PrismaClient } from '@shop-rewards/db';
import type { Session } from '../trpc';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'APPROVE'
  | 'REJECT'
  | 'SUSPEND'
  | 'ACTIVATE'
  | 'LOCK'
  | 'UNLOCK'
  | 'ASSIGN_ROLE'
  | 'REMOVE_ROLE'
  | 'RESET_PASSWORD'
  | 'VERIFY'
  | 'FLAG';

export type AuditResource =
  | 'user'
  | 'shop'
  | 'receipt'
  | 'voucher'
  | 'redemption'
  | 'role'
  | 'permission'
  | 'session'
  | 'config';

export interface AuditLogData {
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  changesBefore?: Record<string, unknown>;
  changesAfter?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  isSuspicious?: boolean;
}

/**
 * Create an audit log entry
 *
 * @param db - Prisma client instance
 * @param session - User session from tRPC context
 * @param data - Audit log data
 * @returns Created audit log entry
 *
 * @example
 * await createAuditLog(db, ctx.session, {
 *   action: 'UPDATE',
 *   resource: 'user',
 *   resourceId: userId,
 *   changesBefore: { email: 'old@example.com' },
 *   changesAfter: { email: 'new@example.com' },
 * });
 */
export async function createAuditLog(
  db: PrismaClient,
  session: Session,
  data: AuditLogData
) {
  const {
    action,
    resource,
    resourceId,
    changesBefore,
    changesAfter,
    metadata,
    ipAddress,
    userAgent,
    isSuspicious = false,
  } = data;

  return await db.auditLog.create({
    data: {
      userId: session.userId,
      shopId: session.shopId || null,
      action,
      resource,
      resourceId,
      changesBefore: (changesBefore as any) || null,
      changesAfter: (changesAfter as any) || null,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      isSuspicious,
    },
  });
}

/**
 * Create diff object for audit logs
 * Compares before and after states to track what changed
 *
 * @param before - Object state before change
 * @param after - Object state after change
 * @returns Object containing only changed fields
 *
 * @example
 * const changes = createDiff(
 *   { name: 'John', email: 'old@example.com', age: 30 },
 *   { name: 'John', email: 'new@example.com', age: 31 }
 * );
 * // Returns: { email: { before: 'old@example.com', after: 'new@example.com' }, age: { before: 30, after: 31 } }
 */
export function createDiff(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): Record<string, { before: unknown; after: unknown }> {
  const diff: Record<string, { before: unknown; after: unknown }> = {};

  // Find changed fields
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    if (before[key] !== after[key]) {
      diff[key] = {
        before: before[key],
        after: after[key],
      };
    }
  }

  return diff;
}

/**
 * Detect suspicious activity patterns
 * Analyzes audit logs to identify potential security issues
 *
 * @param action - Audit action being performed
 * @param metadata - Additional context about the action
 * @returns Whether the action should be flagged as suspicious
 *
 * @example
 * const suspicious = detectSuspiciousActivity('DELETE', { count: 50 });
 * // Returns true for bulk deletes
 */
export function detectSuspiciousActivity(
  action: AuditAction,
  metadata?: Record<string, unknown>
): boolean {
  // Flag bulk delete operations
  if (action === 'DELETE' && metadata?.count && (metadata.count as number) > 10) {
    return true;
  }

  // Flag high-value voucher redemptions
  if (
    action === 'APPROVE' &&
    metadata?.voucherValue &&
    (metadata.voucherValue as number) > 1000
  ) {
    return true;
  }

  // Flag password reset attempts on super admin accounts
  if (
    action === 'RESET_PASSWORD' &&
    metadata?.targetIsSuperAdmin &&
    metadata.targetIsSuperAdmin === true
  ) {
    return true;
  }

  // Flag account suspensions
  if (action === 'SUSPEND') {
    return true;
  }

  return false;
}

/**
 * Sanitize sensitive data before logging
 * Removes passwords, tokens, and other secrets from audit logs
 *
 * @param data - Data to sanitize
 * @returns Sanitized data safe for logging
 *
 * @example
 * const sanitized = sanitizeForAudit({
 *   email: 'user@example.com',
 *   password: 'secret123',
 *   apiKey: 'key-abc123',
 * });
 * // Returns: { email: 'user@example.com', password: '[REDACTED]', apiKey: '[REDACTED]' }
 */
export function sanitizeForAudit(
  data: Record<string, unknown>
): Record<string, unknown> {
  const sanitized = { ...data };

  const sensitiveFields = [
    'password',
    'passwordHash',
    'apiKey',
    'accessToken',
    'refreshToken',
    'mfaSecret',
    'resetToken',
  ];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

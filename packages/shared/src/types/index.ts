/**
 * Shared TypeScript types and interfaces
 * @module types
 */

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * API error response
 */
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

/**
 * API success response
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: Record<string, unknown>;
}

/**
 * File upload metadata
 */
export interface FileMetadata {
  filename: string;
  mimeType: string;
  size: number;
  hash: string;
  uploadedAt: Date;
  uploadedBy: string;
}

/**
 * Tenant context (for RLS)
 */
export interface TenantContext {
  userId: string;
  shopId: string | null;
  roles: string[];
  isSuperAdmin: boolean;
  sessionId: string;
}

/**
 * Audit log entry
 */
export interface AuditEntry {
  userId: string | null;
  shopId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  changesBefore: Record<string, unknown> | null;
  changesAfter: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  isSuspicious: boolean;
  timestamp: Date;
}

/**
 * Session data
 */
export interface SessionData {
  userId: string;
  shopId: string | null;
  roles: string[];
  isSuperAdmin: boolean;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * WebSocket event types
 */
export type WebSocketEvent =
  | { type: 'SECURITY_ALERT'; payload: { message: string; severity: 'low' | 'medium' | 'high' } }
  | { type: 'VOUCHER_REDEEMED'; payload: { voucherId: string; amount: number } }
  | { type: 'RECEIPT_PROCESSED'; payload: { receiptId: string; status: string } }
  | { type: 'NEW_REGISTRATION'; payload: { shopId: string; shopName: string } };

/**
 * Queue message types
 */
export interface QueueMessage<T = unknown> {
  id: string;
  timestamp: Date;
  payload: T;
  retryCount: number;
  maxRetries: number;
}

/**
 * MinIO bucket configuration
 */
export interface BucketConfig {
  name: string;
  region?: string;
  versioning?: boolean;
  encryption?: boolean;
  lifecycleDays?: number;
}

/**
 * Integration configuration (generic)
 */
export interface IntegrationConfig {
  provider: string;
  enabled: boolean;
  config: Record<string, unknown>;
  testConnection?: boolean;
}

/**
 * Analytics data point
 */
export interface AnalyticsDataPoint {
  timestamp: Date;
  metric: string;
  value: number;
  dimensions: Record<string, string>;
}

/**
 * Billing usage data
 */
export interface BillingUsage {
  shopId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    receipts: number;
    vouchers: number;
    redemptions: number;
    storage: number; // in bytes
    apiCalls: number;
  };
  cost: {
    base: number;
    overages: number;
    total: number;
    currency: string;
  };
}

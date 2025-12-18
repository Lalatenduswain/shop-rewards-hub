/**
 * Centralized export of all constants
 * @module constants
 */

export * from './roles';

/**
 * System-wide constants
 */

// File upload limits
export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
} as const;

// Session configuration
export const SESSION_CONFIG = {
  ACCESS_TOKEN_TTL: 15 * 60, // 15 minutes in seconds
  REFRESH_TOKEN_TTL: 7 * 24 * 60 * 60, // 7 days in seconds
  MFA_TOKEN_LENGTH: 6,
} as const;

// Rate limiting
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: {
    maxRequests: 5,
    windowSeconds: 10 * 60, // 10 minutes
  },
  API_REQUESTS: {
    maxRequests: 100,
    windowSeconds: 60, // 1 minute
  },
  RECEIPT_UPLOAD: {
    maxRequests: 10,
    windowSeconds: 60 * 60, // 1 hour
  },
  VOUCHER_REDEMPTION: {
    maxRequests: 3,
    windowSeconds: 60, // 1 minute
  },
} as const;

// GDPR configuration
export const GDPR_CONFIG = {
  DEFAULT_RETENTION_DAYS: 30,
  MIN_RETENTION_DAYS: 1,
  MAX_RETENTION_DAYS: 365,
  AUTO_DELETE_CRON: '0 2 * * *', // Daily at 2 AM
} as const;

// OCR configuration
export const OCR_CONFIG = {
  MIN_CONFIDENCE_SCORE: 85,
  FRAUD_THRESHOLD_SCORE: 70,
  OLLAMA_MODEL: 'llava',
  TIMEOUT_SECONDS: 30,
} as const;

// Voucher configuration
export const VOUCHER_CONFIG = {
  MIN_CODE_LENGTH: 6,
  MAX_CODE_LENGTH: 20,
  DEFAULT_VALIDITY_DAYS: 30,
  QR_CODE_SIZE: 256, // pixels
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
} as const;

// MinIO bucket naming
export const STORAGE_CONFIG = {
  BUCKET_PREFIX: 'tenant',
  RECEIPT_SUFFIX: 'receipts',
  AD_SUFFIX: 'ads',
  LOGO_SUFFIX: 'logos',
  LIFECYCLE_DAYS: 30,
} as const;

// Valkey key patterns
export const CACHE_KEYS = {
  SESSION: (shopId: string | null, sessionId: string) =>
    shopId ? `tenant:${shopId}:session:${sessionId}` : `session:${sessionId}`,
  RATE_LIMIT: (shopId: string, userId: string, endpoint: string) =>
    `tenant:${shopId}:ratelimit:user:${userId}:${endpoint}`,
  VOUCHER: (shopId: string, code: string) =>
    `tenant:${shopId}:voucher:${code}`,
} as const;

// RabbitMQ routing keys
export const ROUTING_KEYS = {
  RECEIPT_UPLOADED: 'receipt.uploaded',
  RECEIPT_OCR_COMPLETED: 'receipt.ocr.completed',
  RECEIPT_VERIFIED: 'receipt.verified',
  VOUCHER_GENERATED: 'voucher.generated',
  VOUCHER_REDEEMED: 'voucher.redeemed',
  NOTIFICATION_EMAIL: 'notification.email.*',
  NOTIFICATION_SMS: 'notification.sms.*',
  NOTIFICATION_PUSH: 'notification.push.*',
  AD_VIEWED: 'ad.viewed',
  AD_CLICKED: 'ad.clicked',
  BILLING_WEBHOOK: 'billing.webhook.*',
  GDPR_SCHEDULE: 'gdpr.schedule',
} as const;

// Queue names
export const QUEUES = {
  RECEIPTS_OCR: 'receipts.ocr',
  RECEIPTS_PROCESSING: 'receipts.processing',
  VOUCHERS_GENERATION: 'vouchers.generation',
  NOTIFICATIONS_EMAIL: 'notifications.email',
  NOTIFICATIONS_SMS: 'notifications.sms',
  NOTIFICATIONS_PUSH: 'notifications.push',
  ANALYTICS_IMPRESSIONS: 'analytics.impressions',
  BILLING_WEBHOOKS: 'billing.webhooks',
  BILLING_SUBSCRIPTIONS: 'billing.subscriptions',
  GDPR_AUTO_DELETE: 'gdpr.auto-delete',
} as const;

// Error codes
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TENANT_NOT_FOUND: 'TENANT_NOT_FOUND',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  MFA_REQUIRED: 'MFA_REQUIRED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  VOUCHER_INVALID: 'VOUCHER_INVALID',
  VOUCHER_EXPIRED: 'VOUCHER_EXPIRED',
  VOUCHER_ALREADY_USED: 'VOUCHER_ALREADY_USED',
  RECEIPT_PROCESSING_FAILED: 'RECEIPT_PROCESSING_FAILED',
  OCR_FAILED: 'OCR_FAILED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

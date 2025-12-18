import { z } from 'zod';

/**
 * Voucher status enum
 */
export const voucherStatusSchema = z.enum([
  'PENDING',
  'APPROVED',
  'ACTIVE',
  'REDEEMED',
  'EXPIRED',
  'CANCELLED',
]);

export type VoucherStatus = z.infer<typeof voucherStatusSchema>;

/**
 * Discount type enum
 */
export const discountTypeSchema = z.enum([
  'PERCENTAGE',
  'FIXED_AMOUNT',
  'FREE_ITEM',
  'BUY_X_GET_Y',
]);

export type DiscountType = z.infer<typeof discountTypeSchema>;

/**
 * Create voucher schema
 */
export const createVoucherSchema = z.object({
  shopId: z.string().cuid(),
  campaignId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  receiptId: z.string().cuid().optional(),

  // Voucher details
  code: z.string()
    .min(6, 'Voucher code must be at least 6 characters')
    .max(20, 'Voucher code must be less than 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Voucher code can only contain uppercase letters, numbers, and hyphens'),

  title: z.string().min(1, 'Voucher title is required').max(100),
  description: z.string().max(500).optional(),

  // Discount configuration
  discountType: discountTypeSchema,
  discountValue: z.number().min(0, 'Discount value must be positive'),
  currency: z.string().length(3, 'Currency code must be ISO 4217').optional(),

  // Usage limits
  maxUses: z.number().int().min(1).default(1),
  maxUsesPerUser: z.number().int().min(1).default(1),
  minPurchaseAmount: z.number().min(0).optional(),

  // Validity period
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),

  // Terms
  termsAndConditions: z.string().max(2000).optional(),
  excludedCategories: z.array(z.string()).optional(),
});

export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;

/**
 * Update voucher schema
 */
export const updateVoucherSchema = createVoucherSchema.partial().extend({
  id: z.string().cuid(),
});

export type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>;

/**
 * Approve/reject voucher schema
 */
export const reviewVoucherSchema = z.object({
  voucherId: z.string().cuid(),
  status: z.enum(['APPROVED', 'ACTIVE', 'CANCELLED']),
  notes: z.string().max(500).optional(),
});

export type ReviewVoucherInput = z.infer<typeof reviewVoucherSchema>;

/**
 * Redeem voucher schema
 */
export const redeemVoucherSchema = z.object({
  code: z.string().min(6, 'Voucher code is required'),
  shopId: z.string().cuid(),
  userId: z.string().cuid(),
  purchaseAmount: z.number().min(0).optional(),
  metadata: z.object({
    location: z.string().optional(),
    cashierId: z.string().optional(),
    notes: z.string().max(500).optional(),
  }).optional(),
});

export type RedeemVoucherInput = z.infer<typeof redeemVoucherSchema>;

/**
 * Voucher query filters
 */
export const voucherFiltersSchema = z.object({
  shopId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  campaignId: z.string().cuid().optional(),
  status: voucherStatusSchema.optional(),
  discountType: discountTypeSchema.optional(),
  validOnly: z.boolean().default(false),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type VoucherFilters = z.infer<typeof voucherFiltersSchema>;

import { z } from 'zod';

/**
 * Ad status enum
 */
export const adStatusSchema = z.enum([
  'DRAFT',
  'PENDING_REVIEW',
  'APPROVED',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'REJECTED',
]);

export type AdStatus = z.infer<typeof adStatusSchema>;

/**
 * Ad placement enum
 */
export const adPlacementSchema = z.enum([
  'HOME_BANNER',
  'SIDEBAR',
  'VOUCHER_LIST',
  'RECEIPT_UPLOAD',
  'PUSH_NOTIFICATION',
]);

export type AdPlacement = z.infer<typeof adPlacementSchema>;

/**
 * Create ad schema
 */
export const createAdSchema = z.object({
  shopId: z.string().cuid(),

  // Ad content
  title: z.string().min(1, 'Ad title is required').max(100),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),

  // Targeting
  placement: adPlacementSchema,
  targetUrl: z.string().url('Invalid target URL').optional(),

  // Scheduling
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),

  // Budget & billing
  dailyBudget: z.number().min(0).optional(),
  costPerImpression: z.number().min(0).default(0.01),
  costPerClick: z.number().min(0).default(0.10),
  maxImpressions: z.number().int().min(1).optional(),
  maxClicks: z.number().int().min(1).optional(),

  // Display settings
  displayOrder: z.number().int().min(0).default(0),

  // Targeting criteria
  targetAudience: z.object({
    ageMin: z.number().int().min(13).optional(),
    ageMax: z.number().int().max(120).optional(),
    countries: z.array(z.string().length(2)).optional(),
    interests: z.array(z.string()).optional(),
  }).optional(),
});

export type CreateAdInput = z.infer<typeof createAdSchema>;

/**
 * Update ad schema
 */
export const updateAdSchema = createAdSchema.partial().extend({
  id: z.string().cuid(),
});

export type UpdateAdInput = z.infer<typeof updateAdSchema>;

/**
 * Review ad schema
 */
export const reviewAdSchema = z.object({
  adId: z.string().cuid(),
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().max(500).optional(),
});

export type ReviewAdInput = z.infer<typeof reviewAdSchema>;

/**
 * Track ad impression schema
 */
export const trackImpressionSchema = z.object({
  adId: z.string().cuid(),
  userId: z.string().cuid().optional(),
  metadata: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    referrer: z.string().optional(),
    location: z.string().optional(),
  }).optional(),
});

export type TrackImpressionInput = z.infer<typeof trackImpressionSchema>;

/**
 * Track ad click schema
 */
export const trackClickSchema = z.object({
  adId: z.string().cuid(),
  userId: z.string().cuid().optional(),
  metadata: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    referrer: z.string().optional(),
  }).optional(),
});

export type TrackClickInput = z.infer<typeof trackClickSchema>;

/**
 * Ad query filters
 */
export const adFiltersSchema = z.object({
  shopId: z.string().cuid().optional(),
  status: adStatusSchema.optional(),
  placement: adPlacementSchema.optional(),
  activeOnly: z.boolean().default(false),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type AdFilters = z.infer<typeof adFiltersSchema>;

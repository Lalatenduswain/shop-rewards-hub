import { z } from 'zod';

/**
 * Campaign type enum
 */
export const campaignTypeSchema = z.enum([
  'RECEIPT_UPLOAD',
  'REFERRAL',
  'LOYALTY',
  'SEASONAL',
  'CUSTOM',
]);

export type CampaignType = z.infer<typeof campaignTypeSchema>;

/**
 * Campaign status enum
 */
export const campaignStatusSchema = z.enum([
  'DRAFT',
  'SCHEDULED',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'CANCELLED',
]);

export type CampaignStatus = z.infer<typeof campaignStatusSchema>;

/**
 * Reward rule schema
 */
export const rewardRuleSchema = z.object({
  minAmount: z.number().min(0),
  maxAmount: z.number().min(0).optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().min(0),
  voucherValidityDays: z.number().int().min(1).max(365).default(30),
});

export type RewardRule = z.infer<typeof rewardRuleSchema>;

/**
 * Create campaign schema
 */
export const createCampaignSchema = z.object({
  shopId: z.string().cuid(),

  // Campaign details
  name: z.string().min(1, 'Campaign name is required').max(100),
  description: z.string().max(1000).optional(),
  type: campaignTypeSchema,

  // Timing
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),

  // Target audience
  targetAudience: z.object({
    ageMin: z.number().int().min(13).optional(),
    ageMax: z.number().int().max(120).optional(),
    genderPreference: z.enum(['MALE', 'FEMALE', 'OTHER', 'ALL']).default('ALL'),
    countries: z.array(z.string().length(2)).optional(),
    existingCustomersOnly: z.boolean().default(false),
  }).optional(),

  // Budget & limits
  budget: z.number().min(0).optional(),
  maxParticipants: z.number().int().min(1).optional(),
  maxRewardsPerUser: z.number().int().min(1).default(1),

  // Reward rules (tiered based on receipt amount)
  rewardRules: z.array(rewardRuleSchema).min(1, 'At least one reward rule is required'),

  // Terms
  termsAndConditions: z.string().max(5000).optional(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

/**
 * Update campaign schema
 */
export const updateCampaignSchema = createCampaignSchema.partial().extend({
  id: z.string().cuid(),
});

export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;

/**
 * Update campaign status schema
 */
export const updateCampaignStatusSchema = z.object({
  campaignId: z.string().cuid(),
  status: campaignStatusSchema,
});

export type UpdateCampaignStatusInput = z.infer<typeof updateCampaignStatusSchema>;

/**
 * Campaign query filters
 */
export const campaignFiltersSchema = z.object({
  shopId: z.string().cuid().optional(),
  type: campaignTypeSchema.optional(),
  status: campaignStatusSchema.optional(),
  activeOnly: z.boolean().default(false),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type CampaignFilters = z.infer<typeof campaignFiltersSchema>;

import { z } from 'zod';

/**
 * Shop status enum
 */
export const shopStatusSchema = z.enum([
  'PENDING_APPROVAL',
  'ACTIVE',
  'SUSPENDED',
  'CANCELLED',
]);

export type ShopStatus = z.infer<typeof shopStatusSchema>;

/**
 * Industry categories
 */
export const industrySchema = z.enum([
  'RETAIL',
  'FOOD_BEVERAGE',
  'HEALTHCARE',
  'AUTOMOTIVE',
  'BEAUTY_WELLNESS',
  'ENTERTAINMENT',
  'EDUCATION',
  'TECHNOLOGY',
  'FINANCE',
  'OTHER',
]);

export type Industry = z.infer<typeof industrySchema>;

/**
 * Slug validation (for subdomain)
 */
export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must be less than 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .regex(/^[a-z]/, 'Slug must start with a letter')
  .regex(/[a-z0-9]$/, 'Slug must end with a letter or number');

/**
 * Create shop schema
 */
export const createShopSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1, 'Shop name is required').max(100),
  description: z.string().max(500).optional(),
  industry: industrySchema,
  country: z.string().length(2, 'Country code must be ISO 3166-1 alpha-2'),
  timezone: z.string().min(1, 'Timezone is required'),
  currency: z.string().length(3, 'Currency code must be ISO 4217'),

  // Contact info
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  website: z.string().url('Invalid website URL').optional(),

  // Address
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().length(2, 'Country code must be ISO 3166-1 alpha-2'),
  }),

  // Business info
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),

  // Settings
  dataRetentionDays: z.number().int().min(1).max(365).default(30),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;

/**
 * Update shop schema
 */
export const updateShopSchema = createShopSchema.partial().extend({
  id: z.string().cuid(),
});

export type UpdateShopInput = z.infer<typeof updateShopSchema>;

/**
 * Shop config schema (key-value settings)
 */
export const shopConfigSchema = z.object({
  shopId: z.string().cuid(),
  key: z.string().min(1, 'Config key is required'),
  value: z.string(),
  isEncrypted: z.boolean().default(false),
  category: z.enum([
    'BRANDING',
    'NOTIFICATIONS',
    'INTEGRATIONS',
    'SECURITY',
    'BILLING',
    'FEATURES',
  ]),
  description: z.string().optional(),
});

export type ShopConfigInput = z.infer<typeof shopConfigSchema>;

/**
 * Approve/reject shop schema
 */
export const reviewShopSchema = z.object({
  shopId: z.string().cuid(),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
  notes: z.string().max(500).optional(),
});

export type ReviewShopInput = z.infer<typeof reviewShopSchema>;

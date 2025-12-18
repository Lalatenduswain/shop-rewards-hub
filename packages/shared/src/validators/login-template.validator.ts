/**
 * Login Template Validator
 *
 * Zod schemas for login page template configuration with complete type safety.
 * Supports hybrid global/tenant override model with field-level customization.
 */

import { z } from 'zod';

/**
 * Color Schema
 * Validates hex color codes (#RRGGBB format)
 */
export const loginTemplateColorsSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color (must be #RRGGBB)'),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color (must be #RRGGBB)'),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color (must be #RRGGBB)'),
});

export type LoginTemplateColors = z.infer<typeof loginTemplateColorsSchema>;

/**
 * Logo Schema
 * Supports URL (Base64 or HTTP) or default Company.logo
 */
export const loginTemplateLogoSchema = z.object({
  url: z.string().nullable(),
  type: z.enum(['url', 'default']),
});

export type LoginTemplateLogo = z.infer<typeof loginTemplateLogoSchema>;

/**
 * Background Schema
 * Supports URL, gradient, or solid color backgrounds
 */
export const loginTemplateBackgroundSchema = z.object({
  url: z.string().nullable(),
  type: z.enum(['url', 'gradient', 'solid']),
  gradient: z.object({
    from: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    to: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    direction: z.enum(['to-br', 'to-tr', 'to-r', 'to-bl', 'to-tl', 'to-l', 'to-b', 'to-t']),
  }).optional(),
});

export type LoginTemplateBackground = z.infer<typeof loginTemplateBackgroundSchema>;

/**
 * Stat Item Schema
 * For animated statistics display
 */
export const loginTemplateStatSchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(50),
  value: z.number().int().positive(),
  suffix: z.string().max(10).optional(),
  icon: z.enum(['Store', 'Users', 'TrendingUp', 'Shield', 'Gift', 'Star']),
  color: z.enum(['violet', 'rose', 'blue', 'emerald', 'amber', 'indigo']),
  order: z.number().int().min(0),
});

export type LoginTemplateStat = z.infer<typeof loginTemplateStatSchema>;

/**
 * Testimonial Schema
 * Customer testimonials with rating and avatar
 */
export const loginTemplateTestimonialSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  company: z.string().min(1).max(100),
  quote: z.string().min(10).max(500),
  rating: z.number().int().min(1).max(5),
  avatar: z.object({
    url: z.string().nullable(),
    initials: z.string().length(2).optional(),
  }),
  order: z.number().int().min(0),
});

export type LoginTemplateTestimonial = z.infer<typeof loginTemplateTestimonialSchema>;

/**
 * Demo Account Schema
 * Configuration for demo/test account quick login
 */
export const loginTemplateDemoAccountSchema = z.object({
  enabled: z.boolean(),
  email: z.string().email(),
  note: z.string().max(200),
});

export type LoginTemplateDemoAccount = z.infer<typeof loginTemplateDemoAccountSchema>;

/**
 * Text Content Schema
 * All customizable text fields on login page
 */
export const loginTemplateTextSchema = z.object({
  tagline: z.string().min(1).max(100),
  subTagline: z.string().max(200).optional(),
  loginButton: z.string().min(1).max(50),
  forgotPassword: z.string().min(1).max(50),
  footer: z.string().max(200),
  demoAccount: loginTemplateDemoAccountSchema.optional(),
});

export type LoginTemplateText = z.infer<typeof loginTemplateTextSchema>;

/**
 * Features Schema
 * Toggle switches for optional features
 */
export const loginTemplateFeaturesSchema = z.object({
  showTestimonials: z.boolean(),
  showStats: z.boolean(),
  showSocialLogin: z.boolean(),
  showDemoAccount: z.boolean(),
});

export type LoginTemplateFeatures = z.infer<typeof loginTemplateFeaturesSchema>;

/**
 * Metadata Schema
 * Tracking information for auditing
 */
export const loginTemplateMetadataSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string(),
  updatedBy: z.string(),
});

export type LoginTemplateMetadata = z.infer<typeof loginTemplateMetadataSchema>;

/**
 * Complete Login Template Configuration Schema
 * Full template configuration with all fields
 */
export const loginTemplateConfigSchema = z.object({
  version: z.string().default('1.0'),
  templateType: z.enum(['professional', 'minimal', 'modern', 'corporate', 'creative']),

  colors: loginTemplateColorsSchema,
  logo: loginTemplateLogoSchema,
  backgroundImage: loginTemplateBackgroundSchema,

  text: loginTemplateTextSchema,
  features: loginTemplateFeaturesSchema,

  stats: z.array(loginTemplateStatSchema).max(10).optional(),
  testimonials: z.array(loginTemplateTestimonialSchema).max(10),

  metadata: loginTemplateMetadataSchema,
});

export type LoginTemplateConfig = z.infer<typeof loginTemplateConfigSchema>;

/**
 * Partial Update Schema
 * For shop overrides - all fields optional except metadata
 */
export const updateLoginTemplateSchema = loginTemplateConfigSchema.partial().extend({
  metadata: loginTemplateMetadataSchema,
});

export type UpdateLoginTemplate = z.infer<typeof updateLoginTemplateSchema>;

/**
 * Template Type Enum
 * Available template types
 */
export const TEMPLATE_TYPES = ['professional', 'minimal', 'modern', 'corporate', 'creative'] as const;

/**
 * Template Metadata
 * Human-readable information about each template
 */
export const TEMPLATE_METADATA = {
  professional: {
    name: 'Professional',
    description: 'Two-column layout with stats, testimonials, and modern design',
    bestFor: 'SaaS platforms, B2B applications',
    features: ['Two-column layout', 'Animated stats', 'Testimonials', 'Modern aesthetic'],
  },
  minimal: {
    name: 'Minimal',
    description: 'Clean, centered form with no distractions',
    bestFor: 'Internal tools, developer platforms',
    features: ['Single-column', 'Ultra-clean', 'Minimal text', 'Fast loading'],
  },
  modern: {
    name: 'Modern',
    description: 'Full-screen with glassmorphism and vibrant gradients',
    bestFor: 'Consumer apps, creative industries, startups',
    features: ['Glassmorphism', 'Bold colors', 'Background image', 'Eye-catching'],
  },
  corporate: {
    name: 'Corporate',
    description: 'Formal enterprise look with trust indicators',
    bestFor: 'Financial services, healthcare, enterprise',
    features: ['50/50 split', 'Security badges', 'Professional', 'Trust-focused'],
  },
  creative: {
    name: 'Creative',
    description: 'Asymmetric layout with bold branding',
    bestFor: 'Agencies, retail brands, fashion',
    features: ['Unique layout', 'Brand-forward', 'Artistic', 'Memorable'],
  },
} as const;

/**
 * Default Color Schemes
 * Pre-defined color palettes for each template type
 */
export const DEFAULT_COLOR_SCHEMES: Record<typeof TEMPLATE_TYPES[number], LoginTemplateColors> = {
  professional: {
    primary: '#3b82f6',    // Blue-500
    secondary: '#1e40af',  // Blue-800
    accent: '#60a5fa',     // Blue-400
  },
  minimal: {
    primary: '#18181b',    // Zinc-900
    secondary: '#71717a',  // Zinc-500
    accent: '#a1a1aa',     // Zinc-400
  },
  modern: {
    primary: '#8b5cf6',    // Violet-500
    secondary: '#ec4899',  // Pink-500
    accent: '#06b6d4',     // Cyan-500
  },
  corporate: {
    primary: '#1e3a8a',    // Blue-900
    secondary: '#475569',  // Slate-600
    accent: '#0f172a',     // Slate-900
  },
  creative: {
    primary: '#f59e0b',    // Amber-500
    secondary: '#ec4899',  // Pink-500
    accent: '#8b5cf6',     // Violet-500
  },
};

/**
 * Validation Helper Functions
 */

/**
 * Validate hex color code
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Validate Base64 image string
 */
export function isValidBase64Image(str: string): boolean {
  return /^data:image\/(png|jpg|jpeg|svg\+xml);base64,/.test(str);
}

/**
 * Validate HTTP(S) URL
 */
export function isValidHttpUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Get default config for a template type
 */
export function getDefaultTemplateConfig(templateType: typeof TEMPLATE_TYPES[number]): Partial<LoginTemplateConfig> {
  return {
    version: '1.0',
    templateType,
    colors: DEFAULT_COLOR_SCHEMES[templateType],
    logo: {
      url: null,
      type: 'default',
    },
    backgroundImage: {
      url: null,
      type: 'gradient',
      gradient: {
        from: DEFAULT_COLOR_SCHEMES[templateType].secondary,
        to: DEFAULT_COLOR_SCHEMES[templateType].primary,
        direction: 'to-br',
      },
    },
    features: {
      showTestimonials: templateType === 'professional' || templateType === 'corporate',
      showStats: templateType === 'professional',
      showSocialLogin: false,
      showDemoAccount: true,
    },
  };
}

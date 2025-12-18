/**
 * Login Template Merge Utility
 *
 * Handles field-level merging of shop-specific overrides with global template configuration.
 * Implements the hybrid global/tenant override model with smart fallback logic.
 */

import type {
  LoginTemplateConfig,
  UpdateLoginTemplate,
} from '@shop-rewards/shared';

/**
 * Merge shop override with global template (field-level)
 *
 * Rules:
 * 1. If shop override has defined (non-undefined) value, use it
 * 2. Otherwise, use global value
 * 3. For nested objects, merge recursively
 * 4. For arrays (testimonials, stats), shop replaces global entirely
 * 5. Logo type='default' means use Company.logo
 *
 * @param global - Global template configuration
 * @param shopOverride - Shop-specific partial overrides
 * @returns Merged configuration with shop overrides applied
 */
export function mergeLoginTemplateConfig(
  global: LoginTemplateConfig,
  shopOverride: Partial<UpdateLoginTemplate>
): LoginTemplateConfig {
  return {
    version: shopOverride.version ?? global.version,
    templateType: shopOverride.templateType ?? global.templateType,

    // Colors: field-level merge
    colors: {
      primary: shopOverride.colors?.primary ?? global.colors.primary,
      secondary: shopOverride.colors?.secondary ?? global.colors.secondary,
      accent: shopOverride.colors?.accent ?? global.colors.accent,
    },

    // Logo: field-level merge
    logo: {
      url: shopOverride.logo?.url !== undefined ? shopOverride.logo.url : global.logo.url,
      type: shopOverride.logo?.type ?? global.logo.type,
    },

    // Background: field-level merge
    backgroundImage: {
      url: shopOverride.backgroundImage?.url !== undefined
        ? shopOverride.backgroundImage.url
        : global.backgroundImage.url,
      type: shopOverride.backgroundImage?.type ?? global.backgroundImage.type,
      gradient: shopOverride.backgroundImage?.gradient ?? global.backgroundImage.gradient,
    },

    // Text: field-level merge
    text: {
      tagline: shopOverride.text?.tagline ?? global.text.tagline,
      subTagline: shopOverride.text?.subTagline !== undefined
        ? shopOverride.text.subTagline
        : global.text.subTagline,
      loginButton: shopOverride.text?.loginButton ?? global.text.loginButton,
      forgotPassword: shopOverride.text?.forgotPassword ?? global.text.forgotPassword,
      footer: shopOverride.text?.footer ?? global.text.footer,
      demoAccount: shopOverride.text?.demoAccount !== undefined
        ? shopOverride.text.demoAccount
        : global.text.demoAccount,
    },

    // Features: field-level merge
    features: {
      showTestimonials: shopOverride.features?.showTestimonials ?? global.features.showTestimonials,
      showStats: shopOverride.features?.showStats ?? global.features.showStats,
      showSocialLogin: shopOverride.features?.showSocialLogin ?? global.features.showSocialLogin,
      showDemoAccount: shopOverride.features?.showDemoAccount ?? global.features.showDemoAccount,
    },

    // Stats: REPLACE entirely (not merge)
    // If shop has stats array, use it completely; otherwise use global
    stats: shopOverride.stats !== undefined ? shopOverride.stats : global.stats,

    // Testimonials: REPLACE entirely (not merge)
    // If shop has testimonials, use them completely; otherwise use global
    testimonials: shopOverride.testimonials !== undefined && shopOverride.testimonials.length > 0
      ? shopOverride.testimonials
      : global.testimonials,

    // Metadata: use shop override metadata (tracks who made changes)
    metadata: shopOverride.metadata ?? global.metadata,
  };
}

/**
 * Get list of overridden fields for UI indicators
 *
 * Returns array of field paths that shop has overridden from global template.
 * Useful for showing "Using global" vs "Custom" indicators in admin UI.
 *
 * @param global - Global template configuration
 * @param shopOverride - Shop-specific partial overrides
 * @returns Array of overridden field paths (e.g., ['templateType', 'colors.primary', 'logo'])
 */
export function getOverriddenFields(
  global: LoginTemplateConfig,
  shopOverride: Partial<UpdateLoginTemplate>
): string[] {
  const overridden: string[] = [];

  // Check top-level fields
  if (shopOverride.version !== undefined && shopOverride.version !== global.version) {
    overridden.push('version');
  }
  if (shopOverride.templateType !== undefined && shopOverride.templateType !== global.templateType) {
    overridden.push('templateType');
  }

  // Check color fields
  if (shopOverride.colors?.primary !== undefined && shopOverride.colors.primary !== global.colors.primary) {
    overridden.push('colors.primary');
  }
  if (shopOverride.colors?.secondary !== undefined && shopOverride.colors.secondary !== global.colors.secondary) {
    overridden.push('colors.secondary');
  }
  if (shopOverride.colors?.accent !== undefined && shopOverride.colors.accent !== global.colors.accent) {
    overridden.push('colors.accent');
  }

  // Check logo
  if (shopOverride.logo?.url !== undefined && shopOverride.logo.url !== global.logo.url) {
    overridden.push('logo.url');
  }
  if (shopOverride.logo?.type !== undefined && shopOverride.logo.type !== global.logo.type) {
    overridden.push('logo.type');
  }

  // Check background
  if (shopOverride.backgroundImage?.url !== undefined &&
      shopOverride.backgroundImage.url !== global.backgroundImage.url) {
    overridden.push('backgroundImage.url');
  }
  if (shopOverride.backgroundImage?.type !== undefined &&
      shopOverride.backgroundImage.type !== global.backgroundImage.type) {
    overridden.push('backgroundImage.type');
  }

  // Check text fields
  if (shopOverride.text?.tagline !== undefined && shopOverride.text.tagline !== global.text.tagline) {
    overridden.push('text.tagline');
  }
  if (shopOverride.text?.subTagline !== undefined && shopOverride.text.subTagline !== global.text.subTagline) {
    overridden.push('text.subTagline');
  }
  if (shopOverride.text?.loginButton !== undefined && shopOverride.text.loginButton !== global.text.loginButton) {
    overridden.push('text.loginButton');
  }
  if (shopOverride.text?.forgotPassword !== undefined &&
      shopOverride.text.forgotPassword !== global.text.forgotPassword) {
    overridden.push('text.forgotPassword');
  }
  if (shopOverride.text?.footer !== undefined && shopOverride.text.footer !== global.text.footer) {
    overridden.push('text.footer');
  }

  // Check features
  if (shopOverride.features?.showTestimonials !== undefined &&
      shopOverride.features.showTestimonials !== global.features.showTestimonials) {
    overridden.push('features.showTestimonials');
  }
  if (shopOverride.features?.showStats !== undefined &&
      shopOverride.features.showStats !== global.features.showStats) {
    overridden.push('features.showStats');
  }
  if (shopOverride.features?.showSocialLogin !== undefined &&
      shopOverride.features.showSocialLogin !== global.features.showSocialLogin) {
    overridden.push('features.showSocialLogin');
  }
  if (shopOverride.features?.showDemoAccount !== undefined &&
      shopOverride.features.showDemoAccount !== global.features.showDemoAccount) {
    overridden.push('features.showDemoAccount');
  }

  // Check stats array
  if (shopOverride.stats !== undefined) {
    overridden.push('stats');
  }

  // Check testimonials array
  if (shopOverride.testimonials !== undefined && shopOverride.testimonials.length > 0) {
    overridden.push('testimonials');
  }

  return overridden;
}

/**
 * Check if a specific field is overridden
 *
 * @param fieldPath - Dot-notation field path (e.g., 'colors.primary', 'text.tagline')
 * @param overriddenFields - Array of overridden field paths from getOverriddenFields()
 * @returns true if field is overridden, false if using global value
 */
export function isFieldOverridden(fieldPath: string, overriddenFields: string[]): boolean {
  return overriddenFields.includes(fieldPath);
}

/**
 * Get summary statistics of overrides
 *
 * @param global - Global template configuration
 * @param shopOverride - Shop-specific partial overrides
 * @returns Object with counts of overridden vs global fields
 */
export function getOverrideSummary(
  global: LoginTemplateConfig,
  shopOverride: Partial<UpdateLoginTemplate>
): {
  totalFields: number;
  overriddenCount: number;
  globalCount: number;
  overridePercentage: number;
} {
  const overriddenFields = getOverriddenFields(global, shopOverride);

  // Count total customizable fields
  const totalFields = 20; // Approximate count of user-customizable fields

  const overriddenCount = overriddenFields.length;
  const globalCount = totalFields - overriddenCount;
  const overridePercentage = Math.round((overriddenCount / totalFields) * 100);

  return {
    totalFields,
    overriddenCount,
    globalCount,
    overridePercentage,
  };
}

/**
 * Create a clean shop override object with only overridden fields
 *
 * Removes fields that match global values to minimize storage.
 * Useful for optimizing shop overrides before saving to database.
 *
 * @param global - Global template configuration
 * @param shopConfig - Full shop configuration
 * @returns Minimal shop override with only changed fields
 */
export function createMinimalOverride(
  global: LoginTemplateConfig,
  shopConfig: LoginTemplateConfig
): Partial<UpdateLoginTemplate> {
  const override: Partial<UpdateLoginTemplate> = {
    metadata: shopConfig.metadata, // Always include metadata
  };

  // Only include fields that differ from global
  if (shopConfig.templateType !== global.templateType) {
    override.templateType = shopConfig.templateType;
  }

  // Colors
  const hasColorOverrides =
    shopConfig.colors.primary !== global.colors.primary ||
    shopConfig.colors.secondary !== global.colors.secondary ||
    shopConfig.colors.accent !== global.colors.accent;

  if (hasColorOverrides) {
    override.colors = {};
    if (shopConfig.colors.primary !== global.colors.primary) {
      override.colors.primary = shopConfig.colors.primary;
    }
    if (shopConfig.colors.secondary !== global.colors.secondary) {
      override.colors.secondary = shopConfig.colors.secondary;
    }
    if (shopConfig.colors.accent !== global.colors.accent) {
      override.colors.accent = shopConfig.colors.accent;
    }
  }

  // Logo
  if (shopConfig.logo.url !== global.logo.url || shopConfig.logo.type !== global.logo.type) {
    override.logo = shopConfig.logo;
  }

  // Background
  if (JSON.stringify(shopConfig.backgroundImage) !== JSON.stringify(global.backgroundImage)) {
    override.backgroundImage = shopConfig.backgroundImage;
  }

  // Text
  if (JSON.stringify(shopConfig.text) !== JSON.stringify(global.text)) {
    override.text = shopConfig.text;
  }

  // Features
  if (JSON.stringify(shopConfig.features) !== JSON.stringify(global.features)) {
    override.features = shopConfig.features;
  }

  // Stats (always override if present)
  if (shopConfig.stats && shopConfig.stats.length > 0) {
    override.stats = shopConfig.stats;
  }

  // Testimonials (always override if present)
  if (shopConfig.testimonials && shopConfig.testimonials.length > 0) {
    override.testimonials = shopConfig.testimonials;
  }

  return override;
}

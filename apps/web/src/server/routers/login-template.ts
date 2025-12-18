/**
 * Login Template tRPC Router
 *
 * Handles login page template configuration with hybrid global/tenant override model.
 * Supports field-level customization with Valkey caching for performance.
 *
 * Endpoints:
 * - getTemplate (public): Get template for login page (with cache, merge, fallback)
 * - getGlobalTemplate: Get raw global template (admin only)
 * - getShopOverride: Get raw shop override (shop admin only)
 * - saveGlobalTemplate: Save global template (super admin only)
 * - saveShopOverride: Save shop-specific overrides (shop admin only)
 * - resetShopOverride: Delete shop override, revert to global (shop admin only)
 * - previewTemplate: Preview config without saving (admin only)
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  superAdminProcedure,
} from '../trpc';
import {
  loginTemplateConfigSchema,
  updateLoginTemplateSchema,
  type LoginTemplateConfig,
} from '@shop-rewards/shared';
import { mergeLoginTemplateConfig } from '../lib/login-template-merge';
import {
  loginTemplateCache,
  CacheKeys,
  invalidateLoginTemplateCache,
  warmLoginTemplateCache,
} from '../lib/cache/login-template-cache';

/**
 * Input schema for getting template
 */
const getTemplateSchema = z.object({
  shopId: z.string().optional(),
});

/**
 * Input schema for shop-specific operations
 */
const shopIdSchema = z.object({
  shopId: z.string(),
});

/**
 * Input schema for saving shop override
 */
const saveShopOverrideSchema = z.object({
  shopId: z.string(),
  config: updateLoginTemplateSchema,
});

/**
 * Input schema for preview
 */
const previewTemplateSchema = z.object({
  config: loginTemplateConfigSchema,
  shopId: z.string().optional(),
});

export const loginTemplateRouter = createTRPCRouter({
  /**
   * 1. GET TEMPLATE (Public - for login page)
   *
   * Fallback logic:
   * - Check cache first (Valkey)
   * - If shopId provided, get shop override from ShopConfig
   * - Get global template from SystemConfig
   * - Merge shop override with global (field-level)
   * - Cache the merged result
   * - Return config + source indicator
   */
  getTemplate: publicProcedure
    .input(getTemplateSchema)
    .query(async ({ ctx, input }) => {
      const { shopId } = input;
      const cacheKey = shopId ? CacheKeys.shop(shopId) : CacheKeys.global();

      console.log(`[LoginTemplate] Getting template for ${shopId ? `shop ${shopId}` : 'global'}`);

      // Try cache first
      const cached = await loginTemplateCache.get(cacheKey);
      if (cached) {
        console.log('[LoginTemplate] Cache hit');
        return {
          config: cached,
          source: 'cache' as const,
        };
      }

      console.log('[LoginTemplate] Cache miss, fetching from database');

      // Get global template
      const globalConfig = await ctx.db.systemConfig.findUnique({
        where: { key: 'login_template_global' },
      });

      if (!globalConfig || !globalConfig.value) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Global login template not configured. Please run database seed.',
        });
      }

      let globalTemplate: LoginTemplateConfig;
      try {
        globalTemplate = JSON.parse(globalConfig.value) as LoginTemplateConfig;
      } catch (error) {
        console.error('[LoginTemplate] Failed to parse global template:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to parse global template configuration',
        });
      }

      // If no shopId, return global
      if (!shopId) {
        await loginTemplateCache.set(cacheKey, globalTemplate);
        console.log('[LoginTemplate] Returning global template (no shopId)');
        return {
          config: globalTemplate,
          source: 'global' as const,
        };
      }

      // Get shop override
      const shopConfig = await ctx.db.shopConfig.findUnique({
        where: {
          shopId_key: {
            shopId,
            key: 'login_template_override',
          },
        },
      });

      if (!shopConfig || !shopConfig.value) {
        // Shop has no override, use global
        await loginTemplateCache.set(cacheKey, globalTemplate);
        console.log('[LoginTemplate] Shop has no override, returning global');
        return {
          config: globalTemplate,
          source: 'global_fallback' as const,
        };
      }

      // Merge shop override with global
      let shopOverride: Partial<LoginTemplateConfig>;
      try {
        shopOverride = JSON.parse(shopConfig.value);
      } catch (error) {
        console.error('[LoginTemplate] Failed to parse shop override:', error);
        // Return global on parse error
        await loginTemplateCache.set(cacheKey, globalTemplate);
        return {
          config: globalTemplate,
          source: 'global_fallback' as const,
        };
      }

      const merged = mergeLoginTemplateConfig(globalTemplate, shopOverride);
      await loginTemplateCache.set(cacheKey, merged);
      console.log('[LoginTemplate] Returning merged template (shop override applied)');

      return {
        config: merged,
        source: 'shop_override' as const,
      };
    }),

  /**
   * 2. GET GLOBAL TEMPLATE (Super admin only)
   *
   * Returns raw global template configuration from SystemConfig.
   */
  getGlobalTemplate: superAdminProcedure.query(async ({ ctx }) => {
    console.log('[LoginTemplate] Getting global template (admin)');

    const config = await ctx.db.systemConfig.findUnique({
      where: { key: 'login_template_global' },
    });

    if (!config || !config.value) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Global template not found. Please run database seed.',
      });
    }

    let parsedConfig: LoginTemplateConfig;
    try {
      parsedConfig = JSON.parse(config.value) as LoginTemplateConfig;
    } catch (error) {
      console.error('[LoginTemplate] Failed to parse global template:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to parse global template configuration',
      });
    }

    return {
      config: parsedConfig,
      updatedAt: config.updatedAt,
    };
  }),

  /**
   * 3. GET SHOP OVERRIDE (Shop admin or super admin)
   *
   * Returns raw shop override configuration from ShopConfig.
   * Returns null if shop uses global template (no override).
   */
  getShopOverride: protectedProcedure
    .input(shopIdSchema)
    .query(async ({ ctx, input }) => {
      // Check authorization: super admin or own shop
      if (!ctx.session.isSuperAdmin && ctx.session.shopId !== input.shopId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this shop\'s settings',
        });
      }

      console.log(`[LoginTemplate] Getting shop override for shop ${input.shopId}`);

      const config = await ctx.db.shopConfig.findUnique({
        where: {
          shopId_key: {
            shopId: input.shopId,
            key: 'login_template_override',
          },
        },
      });

      if (!config || !config.value) {
        return {
          config: null,
          message: 'Shop uses global template (no override)',
        };
      }

      let parsedConfig: Partial<LoginTemplateConfig>;
      try {
        parsedConfig = JSON.parse(config.value);
      } catch (error) {
        console.error('[LoginTemplate] Failed to parse shop override:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to parse shop override configuration',
        });
      }

      return {
        config: parsedConfig,
        updatedAt: config.updatedAt,
      };
    }),

  /**
   * 4. SAVE GLOBAL TEMPLATE (Super admin only)
   *
   * Saves or updates the global template configuration.
   * Invalidates all caches (global + all shops) to ensure immediate propagation.
   */
  saveGlobalTemplate: superAdminProcedure
    .input(loginTemplateConfigSchema)
    .mutation(async ({ ctx, input }) => {
      console.log('[LoginTemplate] Saving global template');

      // Update metadata
      const now = new Date().toISOString();
      input.metadata.updatedAt = now;
      input.metadata.updatedBy = ctx.session.userId;

      // Upsert to SystemConfig
      await ctx.db.systemConfig.upsert({
        where: { key: 'login_template_global' },
        update: {
          value: JSON.stringify(input),
          updatedBy: ctx.session.userId,
        },
        create: {
          key: 'login_template_global',
          value: JSON.stringify(input),
          description: 'Global login page template configuration',
          isEncrypted: false,
          category: 'branding',
          updatedBy: ctx.session.userId,
        },
      });

      // Invalidate all caches (global + all shops)
      await invalidateLoginTemplateCache();

      // Warm global cache
      await warmLoginTemplateCache(input);

      console.log('[LoginTemplate] Global template saved successfully');

      return {
        success: true,
        message: 'Global template updated successfully',
        updatedAt: now,
      };
    }),

  /**
   * 5. SAVE SHOP OVERRIDE (Shop admin or super admin)
   *
   * Saves or updates shop-specific template overrides.
   * Accepts partial config - only overridden fields are saved.
   * Invalidates shop-specific cache.
   */
  saveShopOverride: protectedProcedure
    .input(saveShopOverrideSchema)
    .mutation(async ({ ctx, input }) => {
      // Check authorization: super admin or own shop
      if (!ctx.session.isSuperAdmin && ctx.session.shopId !== input.shopId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to modify this shop\'s settings',
        });
      }

      console.log(`[LoginTemplate] Saving shop override for shop ${input.shopId}`);

      // Verify shop exists
      const shop = await ctx.db.shop.findUnique({
        where: { id: input.shopId },
      });

      if (!shop) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Shop not found',
        });
      }

      // Update metadata
      const now = new Date().toISOString();
      input.config.metadata.updatedAt = now;
      input.config.metadata.updatedBy = ctx.session.userId;

      // Upsert to ShopConfig
      await ctx.db.shopConfig.upsert({
        where: {
          shopId_key: {
            shopId: input.shopId,
            key: 'login_template_override',
          },
        },
        update: {
          value: JSON.stringify(input.config),
        },
        create: {
          shopId: input.shopId,
          key: 'login_template_override',
          value: JSON.stringify(input.config),
          isEncrypted: false,
        },
      });

      // Invalidate shop-specific cache
      await invalidateLoginTemplateCache(input.shopId);

      console.log('[LoginTemplate] Shop override saved successfully');

      return {
        success: true,
        message: 'Shop template updated successfully',
        updatedAt: now,
      };
    }),

  /**
   * 6. RESET SHOP OVERRIDE (Shop admin or super admin)
   *
   * Deletes shop-specific override, reverting to global template.
   * Invalidates shop-specific cache.
   */
  resetShopOverride: protectedProcedure
    .input(shopIdSchema)
    .mutation(async ({ ctx, input }) => {
      // Check authorization: super admin or own shop
      if (!ctx.session.isSuperAdmin && ctx.session.shopId !== input.shopId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to modify this shop\'s settings',
        });
      }

      console.log(`[LoginTemplate] Resetting shop override for shop ${input.shopId}`);

      // Delete shop override from ShopConfig
      await ctx.db.shopConfig.deleteMany({
        where: {
          shopId: input.shopId,
          key: 'login_template_override',
        },
      });

      // Invalidate shop-specific cache
      await invalidateLoginTemplateCache(input.shopId);

      console.log('[LoginTemplate] Shop override reset successfully');

      return {
        success: true,
        message: 'Shop template reset to global successfully',
      };
    }),

  /**
   * 7. PREVIEW TEMPLATE (Admin only)
   *
   * Does NOT save to database.
   * For live preview functionality in admin UI.
   * If shopId provided, merges preview config with global.
   */
  previewTemplate: protectedProcedure
    .input(previewTemplateSchema)
    .query(async ({ ctx, input }) => {
      console.log('[LoginTemplate] Generating preview');

      // If shopId provided, merge with global
      if (input.shopId) {
        const globalConfig = await ctx.db.systemConfig.findUnique({
          where: { key: 'login_template_global' },
        });

        if (globalConfig && globalConfig.value) {
          try {
            const global = JSON.parse(globalConfig.value) as LoginTemplateConfig;
            const merged = mergeLoginTemplateConfig(global, input.config);
            return {
              preview: merged,
              message: 'Preview with global merge',
            };
          } catch (error) {
            console.error('[LoginTemplate] Failed to parse global for preview:', error);
          }
        }
      }

      // Return standalone preview
      return {
        preview: input.config,
        message: 'Preview standalone',
      };
    }),
});

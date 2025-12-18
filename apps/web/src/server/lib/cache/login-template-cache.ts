/**
 * Login Template Cache Service
 *
 * Valkey/Redis caching layer for login page templates.
 * Significantly improves performance by caching frequently-accessed templates.
 * Login page is accessed by every unauthenticated user, so caching is critical.
 */

import { Redis } from 'ioredis';
import type { LoginTemplateConfig } from '@shop-rewards/shared';

/**
 * Redis/Valkey client instance
 * Singleton pattern - reuse across requests
 */
let redisClient: Redis | null = null;

/**
 * Get or create Redis client
 */
function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.VALKEY_HOST || 'localhost',
      port: parseInt(process.env.VALKEY_PORT || '6379'),
      db: 0,
      keyPrefix: 'shop-rewards:',
      // Connection resilience
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true,
      // Reconnect on error
      reconnectOnError: (err) => {
        const targetErrors = ['READONLY', 'ECONNRESET'];
        if (targetErrors.some((targetError) => err.message.includes(targetError))) {
          return true;
        }
        return false;
      },
    });

    // Log connection events (helpful for debugging)
    redisClient.on('connect', () => {
      console.log('[Cache] Connected to Valkey/Redis');
    });

    redisClient.on('error', (err) => {
      console.error('[Cache] Valkey/Redis error:', err.message);
    });

    redisClient.on('close', () => {
      console.log('[Cache] Valkey/Redis connection closed');
    });
  }

  return redisClient;
}

/**
 * Cache TTL (Time To Live) in seconds
 * 1 hour = 3600 seconds
 *
 * Rationale:
 * - Login page accessed frequently by unauthenticated users
 * - Template changes are rare (maybe monthly)
 * - Balances freshness vs. performance
 * - Manual invalidation on updates ensures immediate propagation
 */
const CACHE_TTL = 60 * 60; // 1 hour

/**
 * Cache key generators
 */
export const CacheKeys = {
  /**
   * Global template cache key
   */
  global: () => 'login_template:global',

  /**
   * Shop-specific template cache key
   */
  shop: (shopId: string) => `login_template:shop:${shopId}`,

  /**
   * Pattern for all login template keys
   */
  pattern: () => 'login_template:*',
};

/**
 * Login Template Cache Operations
 */
export const loginTemplateCache = {
  /**
   * Get template from cache
   *
   * @param key - Cache key (from CacheKeys)
   * @returns Parsed template config or null if not found
   */
  async get(key: string): Promise<LoginTemplateConfig | null> {
    try {
      const redis = getRedisClient();
      const cached = await redis.get(key);

      if (!cached) {
        return null;
      }

      return JSON.parse(cached) as LoginTemplateConfig;
    } catch (error) {
      console.error('[Cache] Error getting login template:', error);
      // Return null on error (fail gracefully, fetch from DB instead)
      return null;
    }
  },

  /**
   * Set template in cache
   *
   * @param key - Cache key (from CacheKeys)
   * @param value - Template configuration to cache
   * @param ttl - Optional custom TTL in seconds (defaults to CACHE_TTL)
   */
  async set(key: string, value: LoginTemplateConfig, ttl: number = CACHE_TTL): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('[Cache] Error setting login template:', error);
      // Don't throw - caching failure shouldn't break the app
    }
  },

  /**
   * Delete specific template from cache
   *
   * @param key - Cache key (from CacheKeys)
   */
  async delete(key: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(key);
    } catch (error) {
      console.error('[Cache] Error deleting login template:', error);
    }
  },

  /**
   * Check if template exists in cache
   *
   * @param key - Cache key (from CacheKeys)
   * @returns true if exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('[Cache] Error checking login template existence:', error);
      return false;
    }
  },

  /**
   * Get TTL (Time To Live) for cached template
   *
   * @param key - Cache key (from CacheKeys)
   * @returns Remaining TTL in seconds, or -1 if not found, or -2 if no expiration
   */
  async getTTL(key: string): Promise<number> {
    try {
      const redis = getRedisClient();
      return await redis.ttl(key);
    } catch (error) {
      console.error('[Cache] Error getting TTL:', error);
      return -1;
    }
  },
};

/**
 * Invalidate login template cache
 *
 * Call this whenever template configuration is updated.
 * Ensures users see changes immediately after save.
 *
 * @param shopId - Optional shop ID. If provided, only invalidates that shop's cache.
 *                 If omitted, invalidates all login template caches (global + all shops).
 */
export async function invalidateLoginTemplateCache(shopId?: string): Promise<void> {
  try {
    const redis = getRedisClient();

    if (shopId) {
      // Invalidate specific shop cache
      const shopKey = CacheKeys.shop(shopId);
      await redis.del(shopKey);
      console.log(`[Cache] Invalidated login template for shop ${shopId}`);
    } else {
      // Invalidate all login template caches (global + all shops)
      const pattern = CacheKeys.pattern();
      const keys = await redis.keys(pattern);

      if (keys.length > 0) {
        // Remove keyPrefix before deletion (ioredis adds it automatically)
        const keysWithoutPrefix = keys.map((key) => key.replace('shop-rewards:', ''));
        await redis.del(...keysWithoutPrefix);
        console.log(`[Cache] Invalidated ${keys.length} login template cache(s)`);
      } else {
        console.log('[Cache] No login template caches to invalidate');
      }
    }
  } catch (error) {
    console.error('[Cache] Error invalidating login template cache:', error);
    // Don't throw - cache invalidation failure shouldn't break updates
  }
}

/**
 * Warm up cache with template
 *
 * Proactively populate cache with template configuration.
 * Useful after updates to avoid cache miss on next request.
 *
 * @param shopId - Optional shop ID. If omitted, warms global cache.
 * @param config - Template configuration to cache
 */
export async function warmLoginTemplateCache(
  config: LoginTemplateConfig,
  shopId?: string
): Promise<void> {
  try {
    const key = shopId ? CacheKeys.shop(shopId) : CacheKeys.global();
    await loginTemplateCache.set(key, config);
    console.log(`[Cache] Warmed login template cache for ${shopId ? `shop ${shopId}` : 'global'}`);
  } catch (error) {
    console.error('[Cache] Error warming login template cache:', error);
  }
}

/**
 * Get cache statistics
 *
 * Useful for monitoring and debugging cache performance.
 *
 * @returns Object with cache stats (hit rate, key count, memory usage)
 */
export async function getLoginTemplateCacheStats(): Promise<{
  keyCount: number;
  keys: string[];
  memoryUsage: string;
}> {
  try {
    const redis = getRedisClient();
    const pattern = CacheKeys.pattern();
    const keys = await redis.keys(pattern);

    // Get memory info
    const info = await redis.info('memory');
    const memoryMatch = info.match(/used_memory_human:(.+)/);
    const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'unknown';

    return {
      keyCount: keys.length,
      keys: keys.map((key) => key.replace('shop-rewards:', '')),
      memoryUsage,
    };
  } catch (error) {
    console.error('[Cache] Error getting cache stats:', error);
    return {
      keyCount: 0,
      keys: [],
      memoryUsage: 'unknown',
    };
  }
}

/**
 * Gracefully close Redis connection
 *
 * Call this on application shutdown to properly close connections.
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('[Cache] Redis connection closed gracefully');
  }
}

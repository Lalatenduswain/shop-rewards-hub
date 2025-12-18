/**
 * Authentication tRPC Router
 *
 * Handles user authentication, MFA setup/verification, and session management.
 *
 * Endpoints:
 * - login: Authenticate user with email/password
 * - loginWithMFA: Complete login with MFA token
 * - logout: Invalidate session
 * - refreshToken: Get new access token using refresh token
 * - setupMFA: Generate MFA secret and QR code
 * - verifyMFASetup: Verify MFA setup with token
 * - disableMFA: Disable MFA for user
 * - generateBackupCodes: Generate new backup codes
 * - verifyBackupCode: Verify and consume backup code
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import {
  hashPassword,
  verifyPassword,
} from '@/lib/auth/hash.service';
import {
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/lib/auth/jwt.service';
import {
  generateMFASecret,
  verifyMFAToken,
  generateBackupCodes,
  verifyBackupCode,
  validateMFASetup,
} from '@/lib/auth/mfa.service';

/**
 * Login input schema
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  shopId: z.string().optional(), // Optional for shop-specific login
});

/**
 * MFA verification schema
 */
const mfaVerificationSchema = z.object({
  userId: z.string(),
  token: z.string().length(6, 'MFA token must be 6 digits'),
});

/**
 * Backup code verification schema
 */
const backupCodeSchema = z.object({
  userId: z.string(),
  code: z.string().min(1, 'Backup code is required'),
});

/**
 * Refresh token schema
 */
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const authRouter = createTRPCRouter({
  /**
   * Login with email and password
   *
   * Returns:
   * - If MFA disabled: JWT tokens
   * - If MFA enabled: userId for next step (MFA verification)
   */
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      console.log('[Auth] Login attempt:', input.email);

      // Find user by email (using findFirst for compound unique key)
      const user = await ctx.db.user.findFirst({
        where: {
          email: input.email,
          ...(input.shopId ? { shopId: input.shopId } : {}),
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        console.warn('[Auth] User not found:', input.email);
        // Use generic error message to prevent email enumeration
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Verify password
      const isValidPassword = await verifyPassword(
        input.password,
        user.passwordHash
      );

      if (!isValidPassword) {
        console.warn('[Auth] Invalid password for:', input.email);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Check if MFA is enabled
      if (user.mfaSecret) {
        console.log('[Auth] MFA required for user:', user.id);
        return {
          requiresMFA: true,
          userId: user.id,
          message: 'MFA verification required',
        };
      }

      // Generate tokens
      const roles = user.roles.map((ur) => ur.role.name);
      const tokens = await generateTokenPair({
        userId: user.id,
        email: user.email,
        name: user.name || `${user.firstName} ${user.lastName}`,
        shopId: user.shopId,
        roles,
        isSuperAdmin: user.isSuperAdmin,
        mfaEnabled: !!user.mfaSecret,
      });

      console.log('[Auth] Login successful:', user.email);

      return {
        requiresMFA: false,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName} ${user.lastName}`,
          isSuperAdmin: user.isSuperAdmin,
        },
        accessToken: tokens.accessToken.token,
        refreshToken: tokens.refreshToken.token,
        expiresAt: tokens.accessToken.expiresAt,
      };
    }),

  /**
   * Complete login with MFA token
   */
  loginWithMFA: publicProcedure
    .input(mfaVerificationSchema)
    .mutation(async ({ input, ctx }) => {
      console.log('[Auth] MFA login attempt:', input.userId);

      // Find user
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      if (!user.mfaSecret) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'MFA is not enabled for this user',
        });
      }

      // Verify MFA token
      const isValidToken = verifyMFAToken(input.token, user.mfaSecret);

      if (!isValidToken) {
        console.warn('[Auth] Invalid MFA token for:', user.id);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid MFA token',
        });
      }

      // Generate tokens
      const roles = user.roles.map((ur) => ur.role.name);
      const tokens = await generateTokenPair({
        userId: user.id,
        email: user.email,
        name: user.name || `${user.firstName} ${user.lastName}`,
        shopId: user.shopId,
        roles,
        isSuperAdmin: user.isSuperAdmin,
        mfaEnabled: !!user.mfaSecret,
      });

      console.log('[Auth] MFA login successful:', user.email);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName} ${user.lastName}`,
          isSuperAdmin: user.isSuperAdmin,
        },
        accessToken: tokens.accessToken.token,
        refreshToken: tokens.refreshToken.token,
        expiresAt: tokens.accessToken.expiresAt,
      };
    }),

  /**
   * Login with backup code (alternative to MFA token)
   */
  loginWithBackupCode: publicProcedure
    .input(backupCodeSchema)
    .mutation(async ({ input, ctx }) => {
      console.log('[Auth] Backup code login attempt:', input.userId);

      // Find user
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      if (!user.mfaSecret) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'MFA is not enabled for this user',
        });
      }

      // Verify backup code
      const isValidCode = verifyBackupCode(input.code, user.mfaBackupCodes);

      if (!isValidCode) {
        console.warn('[Auth] Invalid backup code for:', user.id);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid backup code',
        });
      }

      // Remove used backup code
      const normalizedCode = input.code.toUpperCase().replace(/[\s-]/g, '');
      const updatedCodes = user.mfaBackupCodes.filter(
        (code) => code.toUpperCase().replace(/[\s-]/g, '') !== normalizedCode
      );

      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          mfaBackupCodes: updatedCodes,
        },
      });

      // Generate tokens
      const roles = user.roles.map((ur) => ur.role.name);
      const tokens = await generateTokenPair({
        userId: user.id,
        email: user.email,
        name: user.name || `${user.firstName} ${user.lastName}`,
        shopId: user.shopId,
        roles,
        isSuperAdmin: user.isSuperAdmin,
        mfaEnabled: !!user.mfaSecret,
      });

      console.log('[Auth] Backup code login successful:', user.email);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName} ${user.lastName}`,
          isSuperAdmin: user.isSuperAdmin,
        },
        accessToken: tokens.accessToken.token,
        refreshToken: tokens.refreshToken.token,
        expiresAt: tokens.accessToken.expiresAt,
        backupCodesRemaining: updatedCodes.length,
      };
    }),

  /**
   * Refresh access token using refresh token
   */
  refreshToken: publicProcedure
    .input(refreshTokenSchema)
    .mutation(async ({ input, ctx }) => {
      console.log('[Auth] Token refresh attempt');

      try {
        // Verify refresh token
        const payload = await verifyRefreshToken(input.refreshToken);

        // Find user to get updated roles
        const user = await ctx.db.user.findUnique({
          where: { id: payload.userId },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        // Generate new token pair
        const roles = user.roles.map((ur) => ur.role.name);
        const tokens = await generateTokenPair({
          userId: user.id,
          email: user.email,
          name: user.name || `${user.firstName} ${user.lastName}`,
          shopId: user.shopId,
          roles,
          isSuperAdmin: user.isSuperAdmin,
          mfaEnabled: !!user.mfaSecret,
        });

        console.log('[Auth] Token refresh successful');

        return {
          accessToken: tokens.accessToken.token,
          refreshToken: tokens.refreshToken.token,
          expiresAt: tokens.accessToken.expiresAt,
        };
      } catch (error) {
        console.error('[Auth] Token refresh failed:', error);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired refresh token',
        });
      }
    }),

  /**
   * Setup MFA for user
   * Generates secret and QR code
   */
  setupMFA: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      console.log('[Auth] MFA setup:', input.userId);

      // Find user
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      if (user.mfaSecret) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'MFA is already enabled for this user',
        });
      }

      // Generate MFA secret and QR code
      const mfaSetup = await generateMFASecret(user.email);

      // Store secret temporarily (will be confirmed after verification)
      // Note: Don't save to DB yet - wait for verification
      console.log('[Auth] MFA secret generated for:', user.email);

      return {
        secret: mfaSetup.secret,
        qrCodeDataURL: mfaSetup.qrCodeDataURL,
        backupCodes: mfaSetup.backupCodes,
      };
    }),

  /**
   * Verify MFA setup with token
   * Confirms that user scanned QR code correctly
   */
  verifyMFASetup: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        secret: z.string(),
        token: z.string(),
        backupCodes: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log('[Auth] MFA setup verification:', input.userId);

      // Find user
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Validate MFA setup
      const validation = validateMFASetup(input.token, input.secret);

      if (!validation.valid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: validation.message,
        });
      }

      // Save MFA secret and backup codes to database (encrypted by middleware)
      await ctx.db.user.update({
        where: { id: input.userId },
        data: {
          mfaSecret: input.secret,
          mfaEnabled: true,
          mfaBackupCodes: input.backupCodes,
        },
      });

      console.log('[Auth] MFA enabled successfully for:', user.email);

      return {
        success: true,
        message: 'MFA enabled successfully',
      };
    }),

  /**
   * Disable MFA for user
   * Requires password confirmation
   */
  disableMFA: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log('[Auth] MFA disable request:', input.userId);

      // Find user
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Verify password
      const isValidPassword = await verifyPassword(
        input.password,
        user.passwordHash
      );

      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid password',
        });
      }

      // Remove MFA secret and backup codes
      await ctx.db.user.update({
        where: { id: input.userId },
        data: {
          mfaSecret: null,
          mfaEnabled: false,
          mfaBackupCodes: [],
        },
      });

      console.log('[Auth] MFA disabled for:', user.email);

      return {
        success: true,
        message: 'MFA disabled successfully',
      };
    }),

  /**
   * Generate new backup codes
   * Old codes will be invalidated
   */
  regenerateBackupCodes: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log('[Auth] Backup codes regeneration:', input.userId);

      // Find user
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      if (!user.mfaSecret) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'MFA is not enabled for this user',
        });
      }

      // Verify password
      const isValidPassword = await verifyPassword(
        input.password,
        user.passwordHash
      );

      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid password',
        });
      }

      // Generate new codes
      const newBackupCodes = generateBackupCodes(8);

      // Save new codes
      await ctx.db.user.update({
        where: { id: input.userId },
        data: {
          mfaBackupCodes: newBackupCodes,
        },
      });

      console.log('[Auth] Backup codes regenerated for:', user.email);

      return {
        success: true,
        backupCodes: newBackupCodes,
      };
    }),
});

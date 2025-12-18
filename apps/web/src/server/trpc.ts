/**
 * tRPC initialization and context setup
 *
 * This file sets up the tRPC server with:
 * - Type-safe context
 * - Error handling
 * - Procedure builders
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { prisma } from '@shop-rewards/db';

import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth/jwt.service';

/**
 * User session from JWT token
 */
export interface Session {
  userId: string;
  shopId: string | null;
  roles: string[];
  isSuperAdmin: boolean;
}

/**
 * Context type for tRPC procedures
 * Contains database client, request metadata, and optional session
 */
export interface Context {
  headers: Headers;
  db: typeof prisma;
  session: Session | null;
}

/**
 * Create context for each request
 * This runs for every tRPC procedure call
 * Attempts to extract and verify JWT token from Authorization header
 */
export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  // Extract Authorization header
  const authHeader = opts.req.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  let session: Session | null = null;

  // Verify token if present
  if (token) {
    try {
      const payload = await verifyAccessToken(token);
      session = {
        userId: payload.userId,
        shopId: payload.shopId,
        roles: payload.roles,
        isSuperAdmin: payload.isSuperAdmin,
      };
    } catch (error) {
      // Invalid token - proceed without session
      console.warn('[tRPC] Invalid token:', error);
    }
  }

  return {
    headers: opts.req.headers,
    db: prisma,
    session,
  };
};

/**
 * Initialize tRPC with SuperJSON transformer for Date, Map, Set support
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Middleware for procedures that require authentication
 * Verifies that user is logged in via JWT token
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session, // Now guaranteed to be non-null
    },
  });
});

/**
 * Middleware for procedures that require super admin access
 * Verifies that user is logged in AND is a super admin
 */
export const superAdminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  if (!ctx.session.isSuperAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be a super admin to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

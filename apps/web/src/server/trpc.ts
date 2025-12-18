/**
 * tRPC initialization and context setup
 *
 * This file sets up the tRPC server with:
 * - Type-safe context
 * - Error handling
 * - Procedure builders
 */

import { initTRPC } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson';
import { ZodError } from 'zod';

/**
 * Context type for tRPC procedures
 * Contains database client and request metadata
 */
export interface Context {
  headers: Headers;
  // TODO: Add Prisma client when auth is implemented
  // db: PrismaClient;
  // session: Session | null;
}

/**
 * Create context for each request
 * This runs for every tRPC procedure call
 */
export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    headers: opts.req.headers,
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
 * TODO: Implement when authentication is ready (Phase 3)
 */
// export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
//   if (!ctx.session) {
//     throw new TRPCError({ code: 'UNAUTHORIZED' });
//   }
//   return next({
//     ctx: {
//       ...ctx,
//       session: ctx.session,
//     },
//   });
// });

/**
 * Root tRPC App Router
 *
 * This is the main router that combines all sub-routers.
 * Export the type definition for use in the tRPC client.
 */

import { createTRPCRouter } from './trpc';
import { wizardRouter } from './routers/wizard';
import { authRouter } from './routers/auth';
import { usersRouter } from './routers/users';
import { loginTemplateRouter } from './routers/login-template';

export const appRouter = createTRPCRouter({
  wizard: wizardRouter,
  auth: authRouter,
  users: usersRouter,
  loginTemplate: loginTemplateRouter,
  // TODO: Add more routers as they're implemented
  // shops: shopsRouter,
  // vouchers: vouchersRouter,
  // receipts: receiptsRouter,
  // ads: adsRouter,
  // analytics: analyticsRouter,
  // billing: billingRouter,
  // gdpr: gdprRouter,
});

// Export type definition for client
export type AppRouter = typeof appRouter;

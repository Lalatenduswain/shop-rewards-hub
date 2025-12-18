/**
 * tRPC Client Configuration
 *
 * This sets up the tRPC client for use in React components.
 * Provides type-safe API calls with auto-complete and type checking.
 */

import { type CreateTRPCReact, createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '@/server';

/**
 * Create typed tRPC React hooks
 * Usage: trpc.wizard.saveCompanySetup.useMutation()
 */
export const trpc: CreateTRPCReact<AppRouter, unknown> = createTRPCReact<AppRouter>();

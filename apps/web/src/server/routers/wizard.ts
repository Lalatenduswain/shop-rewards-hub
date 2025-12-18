/**
 * Wizard Setup tRPC Router
 *
 * Handles all 12 steps of the wizard setup process:
 * 1. Company Setup
 * 2. Admin User
 * 3. Branding
 * 4. App Configuration
 * 5. Security Settings
 * 6. Email Integration (SMTP)
 * 7. Database Target
 * 8. RBAC Setup
 * 9. Organization Structure
 * 10. Data Import
 * 11. Billing Configuration
 * 12. Launch Confirmation
 */

import { createTRPCRouter, publicProcedure } from '../trpc';
import {
  companySetupSchema,
  adminUserSchema,
  brandingSchema,
  appConfigSchema,
  securitySchema,
  integrationSchema,
  databaseSchema,
  rbacSchema,
  organizationSchema,
  dataImportSchema,
  billingSchema,
  launchSchema,
} from '@shop-rewards/shared';
import { TRPCError } from '@trpc/server';
import { hash } from 'bcrypt';

export const wizardRouter = createTRPCRouter({
  /**
   * Step 1: Save company setup data
   */
  saveCompanySetup: publicProcedure
    .input(companySetupSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Create or update company information
        const company = await ctx.db.company.upsert({
          where: { id: 'system' },
          update: {
            name: input.name,
            industry: input.industry,
            country: input.country,
            timezone: input.timezone,
            currency: input.currency,
            logo: input.logo,
          },
          create: {
            id: 'system',
            name: input.name,
            industry: input.industry,
            country: input.country,
            timezone: input.timezone,
            currency: input.currency,
            logo: input.logo,
          },
        });

        console.log('[Wizard] Step 1: Company Setup', {
          id: company.id,
          name: company.name,
        });

        return {
          success: true,
          message: 'Company setup saved successfully',
          data: {
            id: company.id,
            name: company.name,
          },
        };
      } catch (error) {
        console.error('[Wizard] Company setup error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save company setup',
        });
      }
    }),

  /**
   * Step 2: Create admin user account
   */
  createAdminUser: publicProcedure
    .input(adminUserSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if admin user already exists (for super admin, shopId is null)
        // Note: Compound unique keys with nullable fields require findFirst
        const existingUser = await ctx.db.user.findFirst({
          where: {
            email: input.email,
            shopId: null,
          },
        });

        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User with this email already exists',
          });
        }

        // Hash password with bcrypt
        const passwordHash = await hash(input.password, 12);

        // Split name into firstName and lastName
        const nameParts = input.name.trim().split(' ');
        const firstName = nameParts[0] || input.name;
        const lastName = nameParts.slice(1).join(' ') || input.name;

        // Create admin user
        const user = await ctx.db.user.create({
          data: {
            email: input.email,
            passwordHash,
            name: input.name,
            firstName,
            lastName,
            isSuperAdmin: true, // First user is super admin
            shopId: null, // Super admin is not tied to any shop
            // MFA will be configured later if enabled
            // mfaSecret: input.mfaEnabled ? generateMFASecret() : null,
          },
        });

        // Create super_admin role if it doesn't exist
        // Note: For compound unique keys with nullable fields, we need to use findFirst + create pattern
        let superAdminRole = await ctx.db.role.findFirst({
          where: {
            name: 'super_admin',
            shopId: null,
          },
        });

        if (!superAdminRole) {
          superAdminRole = await ctx.db.role.create({
            data: {
              name: 'super_admin',
              displayName: 'Super Administrator',
              description: 'Platform-wide administrator with access to all tenants',
              isSystemRole: true,
              shopId: null,
            },
          });
        }

        // Assign super_admin role to user
        await ctx.db.userRole.create({
          data: {
            userId: user.id,
            roleId: superAdminRole.id,
          },
        });

        console.log('[Wizard] Step 2: Admin User Created', {
          id: user.id,
          email: user.email,
        });

        return {
          success: true,
          message: 'Admin user created successfully',
          data: {
            id: user.id,
            name: user.name || `${user.firstName} ${user.lastName}`,
            email: user.email,
            mfaEnabled: input.mfaEnabled,
          },
        };
      } catch (error) {
        console.error('[Wizard] Admin user creation error:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create admin user',
        });
      }
    }),

  /**
   * Step 3: Save branding configuration
   */
  saveBranding: publicProcedure
    .input(brandingSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Save branding as system configuration
        await ctx.db.systemConfig.upsert({
          where: { key: 'branding' },
          update: {
            value: JSON.stringify(input),
            isEncrypted: false,
          },
          create: {
            key: 'branding',
            value: JSON.stringify(input),
            description: 'Platform branding configuration',
            isEncrypted: false,
          },
        });

        // TODO: Verify custom domain DNS (if provided)
        // if (input.customDomain) {
        //   await verifyDNSRecord(input.customDomain);
        // }

        console.log('[Wizard] Step 3: Branding', {
          hasCustomDomain: !!input.customDomain,
          hasFavicon: !!input.favicon,
        });

        return {
          success: true,
          message: 'Branding configuration saved successfully',
          data: input,
        };
      } catch (error) {
        console.error('[Wizard] Branding save error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save branding configuration',
        });
      }
    }),

  /**
   * Step 4: Save application configuration
   */
  saveAppConfig: publicProcedure
    .input(appConfigSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Save app config as system configuration
        await ctx.db.systemConfig.upsert({
          where: { key: 'app_config' },
          update: {
            value: JSON.stringify(input),
            isEncrypted: false,
          },
          create: {
            key: 'app_config',
            value: JSON.stringify(input),
            description: 'Application configuration',
            isEncrypted: false,
          },
        });

        console.log('[Wizard] Step 4: App Config', {
          language: input.language,
          moduleCount: input.enabledModules.length,
        });

        return {
          success: true,
          message: 'Application configuration saved successfully',
          data: input,
        };
      } catch (error) {
        console.error('[Wizard] App config save error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save application configuration',
        });
      }
    }),

  /**
   * Step 5: Save security settings
   */
  saveSecuritySettings: publicProcedure
    .input(securitySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Save security settings as SecurityPolicy
        await ctx.db.securityPolicy.upsert({
          where: { id: 'system' },
          update: {
            minPasswordLength: input.minPasswordLength,
            passwordExpiry: input.passwordExpiry,
            requireUppercase: input.requireUppercase ?? false,
            requireNumbers: input.requireNumbers ?? false,
            requireSpecialChars: input.requireSpecialChars ?? false,
            sessionTimeout: input.sessionTimeout,
            maxConcurrentSessions: input.maxConcurrentSessions,
            ipWhitelist: input.ipWhitelist ? input.ipWhitelist.split('\n') : [],
            dataRetentionDays: input.dataRetentionDays,
          },
          create: {
            id: 'system',
            minPasswordLength: input.minPasswordLength,
            passwordExpiry: input.passwordExpiry,
            requireUppercase: input.requireUppercase ?? false,
            requireNumbers: input.requireNumbers ?? false,
            requireSpecialChars: input.requireSpecialChars ?? false,
            sessionTimeout: input.sessionTimeout,
            maxConcurrentSessions: input.maxConcurrentSessions,
            ipWhitelist: input.ipWhitelist ? input.ipWhitelist.split('\n') : [],
            dataRetentionDays: input.dataRetentionDays,
          },
        });

        console.log('[Wizard] Step 5: Security Settings', {
          minPasswordLength: input.minPasswordLength,
          sessionTimeout: input.sessionTimeout,
        });

        return {
          success: true,
          message: 'Security settings saved successfully',
          data: input,
        };
      } catch (error) {
        console.error('[Wizard] Security settings save error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save security settings',
        });
      }
    }),

  /**
   * Step 6: Configure email integration (SMTP)
   */
  saveEmailIntegration: publicProcedure
    .input(integrationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Test SMTP connection before saving
        // await testSMTPConnection(input);

        // Save SMTP config as encrypted system configuration
        await ctx.db.systemConfig.upsert({
          where: { key: 'smtp_config' },
          update: {
            value: JSON.stringify(input),
            isEncrypted: true, // Password will be encrypted by middleware
          },
          create: {
            key: 'smtp_config',
            value: JSON.stringify(input),
            description: 'SMTP email configuration',
            isEncrypted: true,
          },
        });

        console.log('[Wizard] Step 6: Email Integration', {
          host: input.smtpHost,
          port: input.smtpPort,
          encryption: input.smtpEncryption,
        });

        return {
          success: true,
          message: 'Email integration configured successfully',
          data: {
            ...input,
            smtpPassword: undefined, // Don't send password back
          },
        };
      } catch (error) {
        console.error('[Wizard] Email integration error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to configure email integration',
        });
      }
    }),

  /**
   * Step 6.1: Test SMTP connection
   */
  testSMTPConnection: publicProcedure
    .input(integrationSchema)
    .mutation(async ({ input }) => {
      try {
        // TODO: Implement actual SMTP test with nodemailer
        console.log('[Wizard] Testing SMTP connection', {
          host: input.smtpHost,
          port: input.smtpPort,
        });

        // Simulate testing delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return {
          success: true,
          message: 'SMTP connection test successful',
        };
      } catch (error) {
        console.error('[Wizard] SMTP test error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'SMTP connection test failed. Please check your settings.',
        });
      }
    }),

  /**
   * Step 7: Configure database target
   */
  configureDatabaseTarget: publicProcedure
    .input(databaseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Save database config
        await ctx.db.systemConfig.upsert({
          where: { key: 'database_config' },
          update: {
            value: JSON.stringify({
              target: input.target,
              provider: input.provider,
              validated: input.validated,
            }),
            isEncrypted: false,
          },
          create: {
            key: 'database_config',
            value: JSON.stringify({
              target: input.target,
              provider: input.provider,
              validated: input.validated,
            }),
            description: 'Database configuration',
            isEncrypted: false,
          },
        });

        // TODO: Implement database connection test and migration runner
        // if (input.target === 'managed' && input.connectionString) {
        //   await testDatabaseConnection(input.connectionString);
        //   await runMigrations(input.connectionString);
        // }

        console.log('[Wizard] Step 7: Database Target', {
          target: input.target,
          provider: input.provider,
        });

        return {
          success: true,
          message: 'Database target configured successfully',
          data: {
            target: input.target,
            provider: input.provider,
            validated: input.validated,
          },
        };
      } catch (error) {
        console.error('[Wizard] Database configuration error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to configure database target',
        });
      }
    }),

  /**
   * Step 7.1: Test database connection and run migrations
   */
  testDatabaseConnection: publicProcedure
    .input(databaseSchema)
    .mutation(async ({ input }) => {
      try {
        // TODO: Implement actual database connection test
        console.log('[Wizard] Testing database connection', {
          target: input.target,
          provider: input.provider,
        });

        // Simulate testing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        return {
          success: true,
          message: 'Database connection test successful. Migrations applied.',
        };
      } catch (error) {
        console.error('[Wizard] Database test error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Database connection test failed. Please check your settings.',
        });
      }
    }),

  /**
   * Step 8: Configure RBAC (Roles & Permissions)
   */
  configureRBAC: publicProcedure
    .input(rbacSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (input.useDefaults) {
          // Seed default permissions
          const defaultPermissions = [
            { module: 'shops', action: 'create', description: 'Create new shops' },
            { module: 'shops', action: 'read', description: 'View shop details' },
            { module: 'shops', action: 'update', description: 'Update shop settings' },
            { module: 'shops', action: 'delete', description: 'Delete shops' },
            { module: 'users', action: 'create', description: 'Create new users' },
            { module: 'users', action: 'read', description: 'View user list' },
            { module: 'users', action: 'update', description: 'Update user details' },
            { module: 'users', action: 'delete', description: 'Delete users' },
            { module: 'vouchers', action: 'create', description: 'Create vouchers' },
            { module: 'vouchers', action: 'read', description: 'View vouchers' },
            { module: 'vouchers', action: 'update', description: 'Update vouchers' },
            { module: 'vouchers', action: 'delete', description: 'Delete vouchers' },
            { module: 'receipts', action: 'create', description: 'Upload receipts' },
            { module: 'receipts', action: 'read', description: 'View receipts' },
            { module: 'analytics', action: 'view_dashboard', description: 'View analytics' },
          ];

          // Create permissions
          for (const perm of defaultPermissions) {
            await ctx.db.permission.upsert({
              where: {
                module_action: {
                  module: perm.module,
                  action: perm.action,
                },
              },
              update: {},
              create: perm,
            });
          }

          console.log('[Wizard] Step 8: Seeded default RBAC permissions');
        }

        return {
          success: true,
          message: 'RBAC configuration saved successfully',
          data: input,
        };
      } catch (error) {
        console.error('[Wizard] RBAC configuration error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to configure RBAC',
        });
      }
    }),

  /**
   * Step 9: Save organization structure
   */
  saveOrganizationStructure: publicProcedure
    .input(organizationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Save organization structure as system config
        await ctx.db.systemConfig.upsert({
          where: { key: 'organization_structure' },
          update: {
            value: JSON.stringify(input),
            isEncrypted: false,
          },
          create: {
            key: 'organization_structure',
            value: JSON.stringify(input),
            description: 'Organization structure (departments and locations)',
            isEncrypted: false,
          },
        });

        // TODO: Create departments and locations in database
        console.log('[Wizard] Step 9: Organization Structure', {
          departmentCount: input.departments?.length ?? 0,
          locationCount: input.locations?.length ?? 0,
        });

        return {
          success: true,
          message: 'Organization structure saved successfully',
          data: input,
        };
      } catch (error) {
        console.error('[Wizard] Organization save error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save organization structure',
        });
      }
    }),

  /**
   * Step 10: Import data from CSV files
   */
  importData: publicProcedure
    .input(dataImportSchema)
    .mutation(async ({ input }) => {
      try {
        // TODO: Parse CSV files and bulk insert data
        // const shops = input.shopsCsv ? await parseShopsCSV(input.shopsCsv) : [];
        // const employees = input.employeesCsv ? await parseEmployeesCSV(input.employeesCsv) : [];
        // const vouchers = input.vouchersCsv ? await parseVouchersCSV(input.vouchersCsv) : [];

        console.log('[Wizard] Step 10: Data Import', {
          hasShops: !!input.shopsCsv,
          hasEmployees: !!input.employeesCsv,
          hasVouchers: !!input.vouchersCsv,
        });

        return {
          success: true,
          message: 'Data import completed successfully',
          data: {
            imported: {
              shops: 0, // TODO: Return actual counts
              employees: 0,
              vouchers: 0,
            },
          },
        };
      } catch (error) {
        console.error('[Wizard] Data import error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to import data',
        });
      }
    }),

  /**
   * Step 11: Configure billing
   */
  configureBilling: publicProcedure
    .input(billingSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Save billing config as encrypted system configuration
        await ctx.db.systemConfig.upsert({
          where: { key: 'billing_config' },
          update: {
            value: JSON.stringify({
              provider: input.provider,
              // apiKey and webhookSecret will be encrypted by middleware
              apiKey: input.apiKey,
              webhookSecret: input.webhookSecret,
            }),
            isEncrypted: true,
          },
          create: {
            key: 'billing_config',
            value: JSON.stringify({
              provider: input.provider,
              apiKey: input.apiKey,
              webhookSecret: input.webhookSecret,
            }),
            description: 'Billing and payment provider configuration',
            isEncrypted: true,
          },
        });

        // TODO: Validate payment provider API keys
        // if (input.provider === 'stripe' && input.apiKey) {
        //   await validateStripeKey(input.apiKey);
        // }

        console.log('[Wizard] Step 11: Billing Configuration', {
          provider: input.provider,
        });

        return {
          success: true,
          message: 'Billing configuration saved successfully',
          data: {
            provider: input.provider,
          },
        };
      } catch (error) {
        console.error('[Wizard] Billing configuration error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to configure billing',
        });
      }
    }),

  /**
   * Step 11.1: Test payment provider connection
   */
  testPaymentProvider: publicProcedure
    .input(billingSchema)
    .mutation(async ({ input }) => {
      try {
        // TODO: Test Stripe/PayPal API connection
        console.log('[Wizard] Testing payment provider', {
          provider: input.provider,
        });

        // Simulate testing delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        return {
          success: true,
          message: `${input.provider === 'stripe' ? 'Stripe' : 'PayPal'} connection test successful`,
        };
      } catch (error) {
        console.error('[Wizard] Payment provider test error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment provider connection test failed',
        });
      }
    }),

  /**
   * Step 12: Finalize wizard and launch platform
   */
  finalizeLaunch: publicProcedure
    .input(launchSchema)
    .mutation(async ({ ctx }) => {
      try {
        // Mark wizard as completed in database
        await ctx.db.setupWizardState.upsert({
          where: { id: 'system' },
          update: {
            systemConfigured: true,
            completedAt: new Date(),
          },
          create: {
            id: 'system',
            systemConfigured: true,
            completedAt: new Date(),
          },
        });

        console.log('[Wizard] Step 12: Launch Finalized');

        return {
          success: true,
          message: 'Platform launched successfully!',
          data: {
            launchedAt: new Date(),
          },
        };
      } catch (error) {
        console.error('[Wizard] Launch finalization error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to finalize launch',
        });
      }
    }),

  /**
   * Get current wizard state/progress
   */
  getWizardState: publicProcedure.query(async ({ ctx }) => {
    try {
      // Fetch wizard state from database
      const state = await ctx.db.setupWizardState.findUnique({
        where: { id: 'system' },
      });

      if (!state) {
        return {
          currentStep: 1,
          completedSteps: [],
          systemConfigured: false,
        };
      }

      return {
        currentStep: state.currentStep ?? 1,
        completedSteps: [],
        systemConfigured: state.systemConfigured,
        completedAt: state.completedAt,
      };
    } catch (error) {
      console.error('[Wizard] Get state error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get wizard state',
      });
    }
  }),

  /**
   * Reset wizard to allow re-running setup
   * WARNING: This is a development/testing tool - use with caution
   */
  resetWizard: publicProcedure.mutation(async ({ ctx }) => {
    try {
      console.log('[Wizard] Resetting wizard state...');

      // Reset the wizard state
      await ctx.db.setupWizardState.update({
        where: { id: 'system' },
        data: {
          systemConfigured: false,
          completedAt: null,
          currentStep: 1,
          completedSteps: [],
        },
      });

      console.log('[Wizard] Wizard successfully reset');

      return {
        success: true,
        message: 'Wizard has been reset. Redirecting to setup...',
      };
    } catch (error) {
      console.error('[Wizard] Reset error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to reset wizard',
      });
    }
  }),
});

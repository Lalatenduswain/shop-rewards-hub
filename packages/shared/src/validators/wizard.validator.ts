import { z } from 'zod';

/**
 * Step 1: Company Setup
 */
export const companySetupSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  industry: z.enum([
    'RETAIL',
    'FOOD_BEVERAGE',
    'HEALTHCARE',
    'AUTOMOTIVE',
    'BEAUTY_WELLNESS',
    'ENTERTAINMENT',
    'EDUCATION',
    'TECHNOLOGY',
    'FINANCE',
    'OTHER',
  ]),
  country: z.string().length(2, 'Country code must be ISO 3166-1 alpha-2'),
  timezone: z.string().min(1, 'Timezone is required'),
  currency: z.string().length(3, 'Currency code must be ISO 4217'),
  logoUrl: z.string().url('Invalid logo URL').optional(),
});

export type CompanySetup = z.infer<typeof companySetupSchema>;

/**
 * Step 2: Admin User
 */
export const adminSetupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  mfaEnabled: z.boolean().default(true),
});

export type AdminSetup = z.infer<typeof adminSetupSchema>;

/**
 * Step 3: Branding
 */
export const brandingSetupSchema = z.object({
  customDomain: z.string().url('Invalid custom domain').optional(),
  emailSenderName: z.string().min(1, 'Email sender name is required').max(100),
  emailSenderAddress: z.string().email('Invalid email address'),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  faviconUrl: z.string().url('Invalid favicon URL').optional(),
});

export type BrandingSetup = z.infer<typeof brandingSetupSchema>;

/**
 * Step 4: App Configuration
 */
export const appConfigSetupSchema = z.object({
  defaultLanguage: z.string().length(2, 'Language code must be ISO 639-1'),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
  enabledModules: z.array(z.enum([
    'RECEIPTS',
    'VOUCHERS',
    'CAMPAIGNS',
    'ADS',
    'ANALYTICS',
    'GDPR',
  ])).min(1, 'At least one module must be enabled'),
  notificationChannels: z.array(z.enum([
    'EMAIL',
    'SMS',
    'PUSH',
    'IN_APP',
  ])).min(1, 'At least one notification channel must be enabled'),
});

export type AppConfigSetup = z.infer<typeof appConfigSetupSchema>;

/**
 * Step 5: Security Settings
 */
export const securitySetupSchema = z.object({
  passwordPolicy: z.object({
    minLength: z.number().int().min(8).max(128).default(8),
    requireUppercase: z.boolean().default(true),
    requireLowercase: z.boolean().default(true),
    requireNumbers: z.boolean().default(true),
    requireSpecialChars: z.boolean().default(true),
    expiryDays: z.number().int().min(0).max(365).default(90),
  }),
  sessionTimeout: z.number().int().min(5).max(1440).default(15), // minutes
  ipWhitelist: z.array(z.string().ip()).optional(),
  dataRetentionDays: z.number().int().min(1).max(365).default(30),
});

export type SecuritySetup = z.infer<typeof securitySetupSchema>;

/**
 * Step 6: Integrations (SMTP)
 */
export const smtpConfigSchema = z.object({
  host: z.string().min(1, 'SMTP host is required'),
  port: z.number().int().min(1).max(65535),
  secure: z.boolean().default(true),
  username: z.string().min(1, 'SMTP username is required'),
  password: z.string().min(1, 'SMTP password is required'),
});

export type SmtpConfig = z.infer<typeof smtpConfigSchema>;

/**
 * Step 7: Database Target
 */
export const databaseTargetSchema = z.discriminatedUnion('target', [
  z.object({
    target: z.literal('sqlite'),
    filePath: z.string().min(1, 'SQLite file path is required'),
  }),
  z.object({
    target: z.literal('docker-postgres'),
  }),
  z.object({
    target: z.literal('managed'),
    provider: z.enum(['RDS', 'AZURE', 'GCP', 'ELEPHANTSQL', 'OTHER']),
    connectionString: z.string().min(1, 'Connection string is required'),
  }),
]);

export type DatabaseTarget = z.infer<typeof databaseTargetSchema>;

/**
 * Step 8: RBAC
 */
export const rbacSetupSchema = z.object({
  useDefaultRoles: z.boolean().default(true),
  customRoles: z.array(z.object({
    name: z.string().min(1, 'Role name is required'),
    permissions: z.array(z.string()).min(1, 'At least one permission required'),
  })).optional(),
});

export type RbacSetup = z.infer<typeof rbacSetupSchema>;

/**
 * Step 9: Organization Structure
 */
export const organizationSetupSchema = z.object({
  departments: z.array(z.string()).optional(),
  locations: z.array(z.object({
    name: z.string(),
    address: z.string(),
    country: z.string().length(2),
  })).optional(),
});

export type OrganizationSetup = z.infer<typeof organizationSetupSchema>;

/**
 * Step 10: Data Import
 */
export const dataImportSchema = z.object({
  shopsCsv: z.string().optional(), // Base64 CSV
  employeesCsv: z.string().optional(),
  vouchersCsv: z.string().optional(),
});

export type DataImport = z.infer<typeof dataImportSchema>;

/**
 * Step 11: Billing Configuration
 */
export const billingSetupSchema = z.object({
  provider: z.enum(['STRIPE', 'PAYPAL', 'MANUAL']),
  apiKey: z.string().optional(),
  webhookSecret: z.string().optional(),
  planTiers: z.array(z.object({
    name: z.string(),
    price: z.number().min(0),
    features: z.array(z.string()),
  })).optional(),
});

export type BillingSetup = z.infer<typeof billingSetupSchema>;

/**
 * Step 12: Launch Confirmation
 */
export const launchConfirmationSchema = z.object({
  confirmed: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm to launch the system' }),
  }),
  sendWelcomeEmails: z.boolean().default(true),
  enableAnalytics: z.boolean().default(true),
});

export type LaunchConfirmation = z.infer<typeof launchConfirmationSchema>;

/**
 * Complete wizard state
 */
export const wizardStateSchema = z.object({
  company: companySetupSchema.optional(),
  admin: adminSetupSchema.optional(),
  branding: brandingSetupSchema.optional(),
  appConfig: appConfigSetupSchema.optional(),
  security: securitySetupSchema.optional(),
  smtp: smtpConfigSchema.optional(),
  database: databaseTargetSchema.optional(),
  rbac: rbacSetupSchema.optional(),
  organization: organizationSetupSchema.optional(),
  dataImport: dataImportSchema.optional(),
  billing: billingSetupSchema.optional(),
  launch: launchConfirmationSchema.optional(),
  currentStep: z.number().int().min(1).max(12).default(1),
  completedSteps: z.array(z.number().int().min(1).max(12)).default([]),
});

export type WizardState = z.infer<typeof wizardStateSchema>;

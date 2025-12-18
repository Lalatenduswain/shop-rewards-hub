import { z } from 'zod';

// Step 1: Company Setup
export const companySetupSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  country: z.string().min(2, 'Country is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  currency: z.string().min(3, 'Currency is required'),
  logo: z.string().optional(),
});

export type CompanySetup = z.infer<typeof companySetupSchema>;

// Step 2: Admin User
export const adminUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/\d/, 'Password must contain number'),
  mfaEnabled: z.boolean().optional(),
  bulkInviteCsv: z.string().optional(),
});

export type AdminUser = z.infer<typeof adminUserSchema>;

// Step 3: Branding
export const brandingSchema = z.object({
  customDomain: z.string().optional(),
  emailSenderName: z.string().min(1, 'Email sender name is required'),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  favicon: z.string().optional(),
});

export type Branding = z.infer<typeof brandingSchema>;

// Step 4: App Configuration
export const appConfigSchema = z.object({
  language: z.string().min(2, 'Language is required'),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
  enabledModules: z.array(z.string()).min(1, 'At least one module must be enabled'),
  notifyEmail: z.boolean().optional(),
  notifySms: z.boolean().optional(),
  notifyPush: z.boolean().optional(),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

// Step 5: Security
export const securitySchema = z.object({
  minPasswordLength: z.number().min(8).max(32),
  passwordExpiry: z.number().min(0).max(365),
  requireUppercase: z.boolean().optional(),
  requireNumbers: z.boolean().optional(),
  requireSpecialChars: z.boolean().optional(),
  sessionTimeout: z.number().min(5).max(1440),
  maxConcurrentSessions: z.number().min(1).max(10),
  ipWhitelist: z.string().optional(),
  dataRetentionDays: z.number().min(1).max(3650),
});

export type Security = z.infer<typeof securitySchema>;

// Step 6: Email Integration
export const integrationSchema = z.object({
  smtpHost: z.string().min(1, 'SMTP host is required'),
  smtpPort: z.number().min(1).max(65535),
  smtpUsername: z.string().min(1, 'SMTP username is required'),
  smtpPassword: z.string().min(1, 'SMTP password is required'),
  smtpEncryption: z.enum(['tls', 'ssl', 'none']),
});

export type Integration = z.infer<typeof integrationSchema>;

// Step 7: Database Target
export const databaseSchema = z.object({
  target: z.enum(['sqlite', 'docker-postgres', 'managed']),
  provider: z.string().optional(),
  connectionString: z.string().optional(),
  validated: z.boolean().optional(),
});

export type Database = z.infer<typeof databaseSchema>;

// Step 8: RBAC
export const rbacSchema = z.object({
  useDefaults: z.boolean(),
  customRoles: z.array(z.any()).optional(),
});

export type RBAC = z.infer<typeof rbacSchema>;

// Step 9: Organization
export const organizationSchema = z.object({
  departments: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
});

export type Organization = z.infer<typeof organizationSchema>;

// Step 10: Data Import
export const dataImportSchema = z.object({
  shopsCsv: z.string().optional(),
  employeesCsv: z.string().optional(),
  vouchersCsv: z.string().optional(),
});

export type DataImport = z.infer<typeof dataImportSchema>;

// Step 11: Billing
export const billingSchema = z.object({
  provider: z.enum(['stripe', 'paypal', 'manual']),
  apiKey: z.string().optional(),
  webhookSecret: z.string().optional(),
});

export type Billing = z.infer<typeof billingSchema>;

// Step 12: Launch (no validation needed)
export const launchSchema = z.object({});
export type Launch = z.infer<typeof launchSchema>;

// Complete wizard state
export const wizardStateSchema = z.object({
  company: companySetupSchema.optional(),
  admin: adminUserSchema.optional(),
  branding: brandingSchema.optional(),
  appConfig: appConfigSchema.optional(),
  security: securitySchema.optional(),
  integration: integrationSchema.optional(),
  database: databaseSchema.optional(),
  rbac: rbacSchema.optional(),
  organization: organizationSchema.optional(),
  dataImport: dataImportSchema.optional(),
  billing: billingSchema.optional(),
  currentStep: z.number().min(1).max(12),
  completedSteps: z.array(z.number()),
  lastSaved: z.date().optional(),
});

export type WizardState = z.infer<typeof wizardStateSchema>;

import { z } from 'zod';

/**
 * Password validation schema
 * Requirements: 8+ chars, uppercase, lowercase, number, special char
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase()
  .trim();

/**
 * MFA token validation (6-digit TOTP)
 */
export const mfaTokenSchema = z
  .string()
  .length(6, 'MFA token must be 6 digits')
  .regex(/^[0-9]+$/, 'MFA token must contain only digits');

/**
 * Registration schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  shopId: z.string().cuid().optional(),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  mfaToken: mfaTokenSchema.optional(),
  rememberMe: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * MFA setup schema
 */
export const setupMfaSchema = z.object({
  userId: z.string().cuid(),
  token: mfaTokenSchema,
});

export type SetupMfaInput = z.infer<typeof setupMfaSchema>;

/**
 * Password reset request schema
 */
export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

/**
 * Password reset schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Session validation schema
 */
export const sessionSchema = z.object({
  userId: z.string().cuid(),
  shopId: z.string().cuid().nullable(),
  roles: z.array(z.string()),
  isSuperAdmin: z.boolean(),
  sessionId: z.string(),
  expiresAt: z.date(),
});

export type Session = z.infer<typeof sessionSchema>;

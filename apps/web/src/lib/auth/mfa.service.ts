/**
 * Multi-Factor Authentication (MFA) Service
 *
 * Handles TOTP (Time-based One-Time Password) generation and verification.
 * Uses speakeasy for TOTP and qrcode for QR code generation.
 */

import 'server-only';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * MFA setup result with secret and QR code
 */
export interface MFASetupResult {
  secret: string; // Base32 encoded secret (store encrypted in DB)
  qrCodeDataURL: string; // Data URL for QR code image
  backupCodes: string[]; // Backup codes for account recovery
}

/**
 * Generate MFA secret and QR code for user setup
 *
 * @param userEmail - User's email address
 * @param issuer - Application name (default: ShopRewards Hub)
 * @returns MFA secret, QR code, and backup codes
 */
export async function generateMFASecret(
  userEmail: string,
  issuer: string = 'ShopRewards Hub'
): Promise<MFASetupResult> {
  if (!userEmail) {
    throw new Error('User email is required for MFA setup');
  }

  console.log('[MFA Service] Generating MFA secret for', userEmail);

  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `${issuer} (${userEmail})`,
    issuer,
    length: 32, // 32-byte secret for strong security
  });

  if (!secret.base32) {
    throw new Error('Failed to generate MFA secret');
  }

  // Generate QR code
  const otpAuthUrl = secret.otpauth_url;
  if (!otpAuthUrl) {
    throw new Error('Failed to generate OTP auth URL');
  }

  const qrCodeDataURL = await QRCode.toDataURL(otpAuthUrl);

  // Generate backup codes (8 codes, 10 characters each)
  const backupCodes = generateBackupCodes(8);

  console.log('[MFA Service] MFA secret generated successfully');

  return {
    secret: secret.base32,
    qrCodeDataURL,
    backupCodes,
  };
}

/**
 * Verify TOTP code against secret
 *
 * @param token - 6-digit TOTP code from authenticator app
 * @param secret - Base32 encoded secret
 * @param window - Time window in steps (default: 1 = 30s before/after)
 * @returns True if token is valid
 */
export function verifyMFAToken(
  token: string,
  secret: string,
  window: number = 1
): boolean {
  if (!token || !secret) {
    return false;
  }

  // Remove spaces and dashes from token
  const cleanToken = token.replace(/[\s-]/g, '');

  // Verify token must be 6 digits
  if (!/^\d{6}$/.test(cleanToken)) {
    console.warn('[MFA Service] Invalid token format:', token);
    return false;
  }

  console.log('[MFA Service] Verifying MFA token');

  const isValid = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: cleanToken,
    window, // Allow 1 step before/after (30 seconds each)
  });

  console.log('[MFA Service] Token verification:', isValid ? 'SUCCESS' : 'FAILED');

  return isValid;
}

/**
 * Generate current TOTP code (for testing/debugging only)
 *
 * @param secret - Base32 encoded secret
 * @returns Current 6-digit TOTP code
 */
export function generateMFAToken(secret: string): string {
  const token = speakeasy.totp({
    secret,
    encoding: 'base32',
  });

  return token;
}

/**
 * Generate backup codes for account recovery
 *
 * @param count - Number of codes to generate (default: 8)
 * @param length - Length of each code (default: 10)
 * @returns Array of backup codes
 */
export function generateBackupCodes(
  count: number = 8,
  length: number = 10
): string[] {
  const codes: string[] = [];
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < count; i++) {
    let code = '';
    for (let j = 0; j < length; j++) {
      code += charset[Math.floor(Math.random() * charset.length)];
    }
    // Format as XXXX-XXXX-XX for readability
    const formatted = code.match(/.{1,4}/g)?.join('-') || code;
    codes.push(formatted);
  }

  return codes;
}

/**
 * Verify backup code
 * Note: Backup codes should be one-time use and marked as used in database
 *
 * @param code - Backup code entered by user
 * @param storedCodes - Array of valid backup codes from database
 * @returns True if code is valid and unused
 */
export function verifyBackupCode(
  code: string,
  storedCodes: string[]
): boolean {
  if (!code || !storedCodes || storedCodes.length === 0) {
    return false;
  }

  // Normalize code (uppercase, remove spaces/dashes)
  const normalizedCode = code.toUpperCase().replace(/[\s-]/g, '');

  // Check if code exists in stored codes
  const isValid = storedCodes.some((storedCode) => {
    const normalizedStored = storedCode.toUpperCase().replace(/[\s-]/g, '');
    return normalizedStored === normalizedCode;
  });

  if (isValid) {
    console.log('[MFA Service] Backup code verified successfully');
  } else {
    console.warn('[MFA Service] Invalid backup code');
  }

  return isValid;
}

/**
 * Check if MFA is enabled for user
 * (Helper function for convenience)
 *
 * @param mfaSecret - User's MFA secret from database
 * @returns True if MFA is enabled (secret exists)
 */
export function isMFAEnabled(mfaSecret: string | null | undefined): boolean {
  return !!mfaSecret && mfaSecret.length > 0;
}

/**
 * Validate MFA setup by verifying a token
 * Used during MFA enrollment to ensure user scanned QR code correctly
 *
 * @param token - 6-digit code from authenticator app
 * @param secret - Newly generated secret
 * @returns Validation result with message
 */
export function validateMFASetup(token: string, secret: string): {
  valid: boolean;
  message: string;
} {
  if (!token) {
    return { valid: false, message: 'Verification code is required' };
  }

  if (!secret) {
    return { valid: false, message: 'MFA secret is missing' };
  }

  const cleanToken = token.replace(/[\s-]/g, '');

  if (!/^\d{6}$/.test(cleanToken)) {
    return {
      valid: false,
      message: 'Verification code must be 6 digits',
    };
  }

  const isValid = verifyMFAToken(cleanToken, secret);

  if (isValid) {
    return {
      valid: true,
      message: 'MFA setup verified successfully',
    };
  }

  return {
    valid: false,
    message: 'Invalid verification code. Please check your authenticator app and try again.',
  };
}

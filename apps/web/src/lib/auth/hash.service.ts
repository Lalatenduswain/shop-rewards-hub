/**
 * Password Hashing Service
 *
 * Handles secure password hashing and verification using bcrypt.
 * Uses cost factor of 12 for strong security.
 */

import 'server-only';
import bcrypt from 'bcrypt';

// Bcrypt configuration
const SALT_ROUNDS = 12; // Cost factor (higher = more secure but slower)

/**
 * Hash a plaintext password
 *
 * @param password - Plaintext password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    throw new Error('Password is required');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  console.log('[Hash Service] Hashing password with bcrypt (cost: 12)');

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  console.log('[Hash Service] Password hashed successfully');

  return hash;
}

/**
 * Verify a password against its hash
 *
 * @param password - Plaintext password to verify
 * @param hash - Stored password hash
 * @returns True if password matches hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }

  console.log('[Hash Service] Verifying password');

  const isMatch = await bcrypt.compare(password, hash);

  console.log('[Hash Service] Password verification:', isMatch ? 'SUCCESS' : 'FAILED');

  return isMatch;
}

/**
 * Check if password meets minimum requirements
 *
 * @param password - Password to validate
 * @returns Validation result with message
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  message: string;
} {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character',
    };
  }

  return { valid: true, message: 'Password meets all requirements' };
}

/**
 * Generate a random password that meets requirements
 *
 * @param length - Password length (default: 16)
 * @returns Random password
 */
export function generateSecurePassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}';

  const allChars = lowercase + uppercase + numbers + special;

  // Ensure at least one of each type
  let password = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ].join('');

  // Fill rest of password with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle password
  password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  return password;
}

/**
 * Check if hash needs rehashing (e.g., cost factor changed)
 *
 * @param hash - Password hash to check
 * @returns True if hash should be regenerated
 */
export async function needsRehash(hash: string): Promise<boolean> {
  try {
    // Extract cost factor from hash
    // Bcrypt hash format: $2b$<cost>$<salt><hash>
    const parts = hash.split('$');
    if (parts.length < 4 || !parts[2]) {
      return true; // Invalid hash format
    }

    const costFactor = parseInt(parts[2], 10);

    // Rehash if cost factor is different
    return costFactor !== SALT_ROUNDS;
  } catch {
    return true; // On any error, recommend rehashing
  }
}

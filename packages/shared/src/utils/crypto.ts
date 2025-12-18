import { createHash, randomBytes } from 'crypto';

/**
 * Crypto utilities for file integrity and hashing
 * @module utils/crypto
 */

/**
 * Generate SHA-256 hash of a string
 */
export function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Generate SHA-256 hash of a buffer
 */
export function sha256Buffer(data: Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a random numeric code (for MFA, vouchers, etc.)
 */
export function generateNumericCode(length: number = 6): string {
  const max = Math.pow(10, length);
  const min = Math.pow(10, length - 1);
  const code = Math.floor(Math.random() * (max - min) + min);
  return code.toString();
}

/**
 * Generate a random alphanumeric code (for vouchers, etc.)
 */
export function generateAlphanumericCode(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const randomBytesArray = randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += chars[randomBytesArray[i]! % chars.length];
  }

  return result;
}

/**
 * Verify file integrity by comparing hash
 */
export function verifyFileIntegrity(
  fileData: Buffer,
  expectedHash: string
): boolean {
  const actualHash = sha256Buffer(fileData);
  return actualHash === expectedHash;
}

/**
 * Generate a deterministic hash for duplicate detection
 */
export function generateContentHash(content: string): string {
  return sha256(content);
}

/**
 * Time-safe string comparison to prevent timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  try {
    // Use crypto.timingSafeEqual for constant-time comparison
    const crypto = require('crypto');
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

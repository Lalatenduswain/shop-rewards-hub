/**
 * Field-Level Encryption Middleware
 * Automatically encrypts/decrypts sensitive fields using AES-256-GCM
 * Master key must be set in ENCRYPTION_KEY environment variable
 */

import 'server-only';
import { Prisma } from '@prisma/client';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Get encryption key from environment
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is required. Generate with: openssl rand -hex 32'
    );
  }

  // Key should be 32-byte hex string (64 characters)
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte hex string (64 characters)');
  }

  return Buffer.from(key, 'hex');
}

/**
 * Encrypt plaintext using AES-256-GCM
 * Returns format: iv:authTag:encrypted
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * Expects format: iv:authTag:encrypted
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return ciphertext;

  // Check if it looks like encrypted data
  if (!ciphertext.includes(':')) {
    console.warn('[ENCRYPTION] Attempted to decrypt non-encrypted data');
    return ciphertext;
  }

  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('DECRYPT_ERROR: Invalid ciphertext format');
  }

  const [ivHex, authTagHex, encrypted] = parts as [string, string, string];

  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Models and their encrypted fields
const ENCRYPTED_FIELDS: Record<string, string[]> = {
  User: ['mfaSecret', 'mfaBackupCodes'],
  SystemConfig: ['value'], // Only when isEncrypted = true
  ShopConfig: ['value'],
  Integration: ['config'],
  BillingConfig: ['apiKey', 'webhookSecret'],
};

/**
 * Create encryption middleware
 */
export function createEncryptionMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const modelName = params.model;

    // Only process models with encrypted fields
    if (!modelName || !ENCRYPTED_FIELDS[modelName]) {
      return next(params);
    }

    const fieldsToEncrypt = ENCRYPTED_FIELDS[modelName];

    // ENCRYPT: On write operations
    if (['create', 'update', 'upsert', 'createMany', 'updateMany'].includes(params.action)) {
      let data: any;

      if (params.action === 'upsert') {
        data = params.args.create;
      } else if (params.action === 'createMany') {
        // Handle bulk creates
        if (Array.isArray(params.args.data)) {
          params.args.data = params.args.data.map((item: any) =>
            encryptFields(item, fieldsToEncrypt, modelName)
          );
        }
        return next(params);
      } else {
        data = params.args.data;
      }

      // Encrypt fields
      for (const field of fieldsToEncrypt) {
        if (data && data[field] !== undefined && data[field] !== null) {
          // Special handling for SystemConfig/ShopConfig - only encrypt if isEncrypted flag is true
          if ((modelName === 'SystemConfig' || modelName === 'ShopConfig') && field === 'value') {
            if (data.isEncrypted === false) {
              continue; // Skip encryption
            }
          }

          // Handle arrays (e.g., mfaBackupCodes)
          if (Array.isArray(data[field])) {
            data[field] = data[field].map((val: string) => {
              // Skip if already encrypted
              if (typeof val === 'string' && val.includes(':')) {
                return val;
              }
              return encrypt(val);
            });
          } else {
            // Skip if already encrypted
            if (typeof data[field] === 'string' && data[field].includes(':')) {
              continue;
            }
            data[field] = encrypt(data[field]);
          }
        }
      }
    }

    // Execute the query
    const result = await next(params);

    // DECRYPT: On read operations
    if (['findUnique', 'findFirst', 'findMany', 'findFirstOrThrow', 'findUniqueOrThrow'].includes(params.action)) {
      const decryptResult = (record: any) => {
        if (!record) return record;

        for (const field of fieldsToEncrypt) {
          if (record[field] !== undefined && record[field] !== null) {
            try {
              // Special handling for SystemConfig/ShopConfig - only decrypt if isEncrypted flag is true
              if ((modelName === 'SystemConfig' || modelName === 'ShopConfig') && field === 'value') {
                if (record.isEncrypted === false) {
                  continue; // Skip decryption
                }
              }

              // Handle arrays
              if (Array.isArray(record[field])) {
                record[field] = record[field].map((val: string) => {
                  try {
                    return decrypt(val);
                  } catch (error) {
                    console.error(`[ENCRYPTION] Failed to decrypt array item in ${modelName}.${field}:`, error);
                    return val; // Return original if decryption fails
                  }
                });
              } else {
                record[field] = decrypt(record[field]);
              }
            } catch (error) {
              console.error(`[ENCRYPTION] Failed to decrypt ${modelName}.${field}:`, error);
              // Set to null on decryption failure (data may be corrupted)
              record[field] = null;
            }
          }
        }
        return record;
      };

      // Handle single vs multiple results
      if (Array.isArray(result)) {
        return result.map(decryptResult);
      } else {
        return decryptResult(result);
      }
    }

    return result;
  };
}

/**
 * Helper to encrypt fields in an object
 */
function encryptFields(data: any, fields: string[], modelName: string): any {
  const encrypted = { ...data };

  for (const field of fields) {
    if (encrypted[field] !== undefined && encrypted[field] !== null) {
      // Special handling for config models
      if ((modelName === 'SystemConfig' || modelName === 'ShopConfig') && field === 'value') {
        if (encrypted.isEncrypted === false) {
          continue;
        }
      }

      // Handle arrays
      if (Array.isArray(encrypted[field])) {
        encrypted[field] = encrypted[field].map((val: string) =>
          val.includes(':') ? val : encrypt(val)
        );
      } else {
        if (!encrypted[field].includes(':')) {
          encrypted[field] = encrypt(encrypted[field]);
        }
      }
    }
  }

  return encrypted;
}

/**
 * Manually encrypt a value (for use outside Prisma)
 */
export function encryptValue(value: string): string {
  return encrypt(value);
}

/**
 * Manually decrypt a value (for use outside Prisma)
 */
export function decryptValue(value: string): string {
  return decrypt(value);
}

/**
 * Check if a string is encrypted
 */
export function isEncrypted(value: string): boolean {
  return typeof value === 'string' && value.split(':').length === 3;
}

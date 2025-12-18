/**
 * JWT Authentication Service
 *
 * Handles JWT token generation and verification using jose library.
 * Supports access tokens (15 min) and refresh tokens (7 days).
 */

import 'server-only';
import * as jose from 'jose';

// Token configuration
const ACCESS_TOKEN_TTL = '15m'; // 15 minutes
const REFRESH_TOKEN_TTL = '7d'; // 7 days
const ALGORITHM = 'HS256';

// JWT payload structure
export interface TokenPayload {
  userId: string;
  shopId: string | null;
  roles: string[];
  isSuperAdmin: boolean;
  type: 'access' | 'refresh';
}

// Token generation result
export interface TokenResult {
  token: string;
  expiresAt: Date;
}

/**
 * Get JWT secret from environment
 */
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is required. Please set a strong secret (32+ characters).'
    );
  }

  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  return new TextEncoder().encode(secret);
}

/**
 * Generate access token (15 min TTL)
 *
 * @param payload - Token payload with user info
 * @returns JWT access token and expiration
 */
export async function generateAccessToken(
  payload: Omit<TokenPayload, 'type'>
): Promise<TokenResult> {
  const secret = getJWTSecret();

  const token = await new jose.SignJWT({
    ...payload,
    type: 'access',
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .setIssuer('shoprewards-hub')
    .setAudience('shoprewards-api')
    .sign(secret);

  // Calculate expiration date (15 minutes from now)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  console.log('[JWT Service] Generated access token', {
    userId: payload.userId,
    shopId: payload.shopId,
    expiresAt,
  });

  return { token, expiresAt };
}

/**
 * Generate refresh token (7 day TTL)
 *
 * @param payload - Token payload with user info
 * @returns JWT refresh token and expiration
 */
export async function generateRefreshToken(
  payload: Omit<TokenPayload, 'type'>
): Promise<TokenResult> {
  const secret = getJWTSecret();

  const token = await new jose.SignJWT({
    ...payload,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_TTL)
    .setIssuer('shoprewards-hub')
    .setAudience('shoprewards-api')
    .sign(secret);

  // Calculate expiration date (7 days from now)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  console.log('[JWT Service] Generated refresh token', {
    userId: payload.userId,
    shopId: payload.shopId,
    expiresAt,
  });

  return { token, expiresAt };
}

/**
 * Generate both access and refresh tokens
 *
 * @param payload - Token payload with user info
 * @returns Both tokens with expirations
 */
export async function generateTokenPair(
  payload: Omit<TokenPayload, 'type'>
): Promise<{
  accessToken: TokenResult;
  refreshToken: TokenResult;
}> {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(payload),
    generateRefreshToken(payload),
  ]);

  return { accessToken, refreshToken };
}

/**
 * Verify and decode JWT token
 *
 * @param token - JWT token to verify
 * @returns Decoded payload if valid
 * @throws Error if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  const secret = getJWTSecret();

  try {
    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: 'shoprewards-hub',
      audience: 'shoprewards-api',
      algorithms: [ALGORITHM],
    });

    console.log('[JWT Service] Token verified successfully', {
      userId: payload.userId,
      type: payload.type,
    });

    return payload as unknown as TokenPayload;
  } catch (error) {
    console.error('[JWT Service] Token verification failed:', error);

    if (error instanceof jose.errors.JWTExpired) {
      throw new Error('TOKEN_EXPIRED');
    }

    if (error instanceof jose.errors.JWTInvalid) {
      throw new Error('TOKEN_INVALID');
    }

    throw new Error('TOKEN_VERIFICATION_FAILED');
  }
}

/**
 * Verify access token specifically
 * Ensures token type is 'access'
 *
 * @param token - JWT access token
 * @returns Decoded payload if valid access token
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const payload = await verifyToken(token);

  if (payload.type !== 'access') {
    throw new Error('INVALID_TOKEN_TYPE: Expected access token');
  }

  return payload;
}

/**
 * Verify refresh token specifically
 * Ensures token type is 'refresh'
 *
 * @param token - JWT refresh token
 * @returns Decoded payload if valid refresh token
 */
export async function verifyRefreshToken(
  token: string
): Promise<TokenPayload> {
  const payload = await verifyToken(token);

  if (payload.type !== 'refresh') {
    throw new Error('INVALID_TOKEN_TYPE: Expected refresh token');
  }

  return payload;
}

/**
 * Decode JWT token without verification (unsafe - for debugging only)
 *
 * @param token - JWT token
 * @returns Decoded payload (unverified)
 */
export function decodeTokenUnsafe(token: string): TokenPayload | null {
  try {
    const decoded = jose.decodeJwt(token);
    return decoded as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired without full verification
 *
 * @param token - JWT token
 * @returns True if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeTokenUnsafe(token);

  if (!payload) {
    return true;
  }

  // jose tokens include exp field (expiration timestamp in seconds)
  const exp = (payload as any).exp;
  if (!exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return now >= exp;
}

/**
 * Extract token from Authorization header
 *
 * @param authHeader - Authorization header value (Bearer <token>)
 * @returns Token if found, null otherwise
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return null;
  }

  return parts[1];
}

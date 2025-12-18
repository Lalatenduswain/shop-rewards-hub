'use client';

/**
 * Authentication Context
 *
 * Provides authentication state and user information throughout the app.
 * Reads JWT token from localStorage and decodes it to get user details.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  userId: string;
  email: string;
  name: string | null;
  isSuperAdmin: boolean;
  shopId: string | null;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Decode JWT token to extract user information
 * Note: This only decodes, it does NOT verify the signature
 * Signature verification happens on the backend
 */
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * Load user from localStorage on mount
   */
  useEffect(() => {
    const loadAuth = () => {
      try {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Check if token is expired
        if (isTokenExpired(accessToken)) {
          console.log('[Auth] Access token expired, clearing auth');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Decode token to get user info
        const decoded = decodeJWT(accessToken);
        if (!decoded) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Extract user information from JWT payload
        setUser({
          userId: decoded.userId || decoded.sub,
          email: decoded.email,
          name: decoded.name || null,
          isSuperAdmin: decoded.isSuperAdmin || false,
          shopId: decoded.shopId || null,
          roles: decoded.roles || [],
          permissions: decoded.permissions || [],
        });

        setIsLoading(false);
      } catch (error) {
        console.error('[Auth] Failed to load auth:', error);
        setUser(null);
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  /**
   * Login - store tokens and set user
   */
  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    const decoded = decodeJWT(accessToken);
    if (decoded) {
      setUser({
        userId: decoded.userId || decoded.sub,
        email: decoded.email,
        name: decoded.name || null,
        isSuperAdmin: decoded.isSuperAdmin || false,
        shopId: decoded.shopId || null,
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
      });
    }
  };

  /**
   * Logout - clear tokens and redirect
   */
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/login');
  };

  /**
   * Refresh authentication state from localStorage
   * Useful after token refresh
   */
  const refreshAuth = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && !isTokenExpired(accessToken)) {
      const decoded = decodeJWT(accessToken);
      if (decoded) {
        setUser({
          userId: decoded.userId || decoded.sub,
          email: decoded.email,
          name: decoded.name || null,
          isSuperAdmin: decoded.isSuperAdmin || false,
          shopId: decoded.shopId || null,
          roles: decoded.roles || [],
          permissions: decoded.permissions || [],
        });
      }
    } else {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

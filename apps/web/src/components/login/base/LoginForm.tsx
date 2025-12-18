'use client';

/**
 * LoginForm Base Component
 *
 * Reusable login form with complete authentication logic.
 * Used by all login page templates to ensure consistent auth flow.
 *
 * Features:
 * - Email/password authentication
 * - MFA token verification
 * - Password visibility toggle
 * - Demo account quick login
 * - Error handling
 * - Loading states
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { LoginTemplateText, LoginTemplateDemoAccount } from '@shop-rewards/shared';

interface LoginFormProps {
  /** Text configuration from template */
  text: LoginTemplateText;
  /** Primary color for buttons and focus states */
  primaryColor: string;
  /** Whether to show demo account quick login button */
  showDemoAccount?: boolean;
  /** Optional CSS classes */
  className?: string;
}

export default function LoginForm({
  text,
  primaryColor,
  showDemoAccount = true,
  className = '',
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = trpc.auth.login.useMutation();
  const loginWithMfaMutation = trpc.auth.loginWithMFA.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (requiresMfa) {
        const result = await loginWithMfaMutation.mutateAsync({
          userId: email,
          token: mfaToken,
        });

        if (result?.accessToken) {
          localStorage.setItem('accessToken', result.accessToken);
          localStorage.setItem('refreshToken', result.refreshToken);
          router.push('/admin');
        }
      } else {
        const result = await loginMutation.mutateAsync({
          email,
          password,
        });

        console.log('[LoginForm] Login result:', result);

        if (result?.requiresMFA) {
          setRequiresMfa(true);
        } else if (result?.accessToken) {
          localStorage.setItem('accessToken', result.accessToken);
          localStorage.setItem('refreshToken', result.refreshToken);
          console.log('[LoginForm] Tokens stored, redirecting to /admin');
          router.push('/admin');
        } else {
          console.error('[LoginForm] Unexpected response structure:', result);
          setError('Login failed - unexpected response');
        }
      }
    } catch (err: any) {
      console.error('[LoginForm] Error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    if (!text.demoAccount?.enabled) return;

    setEmail(text.demoAccount.email);
    setPassword('ChangeMe123!'); // Default demo password
    setIsLoading(true);

    loginMutation.mutate(
      {
        email: text.demoAccount.email,
        password: 'ChangeMe123!',
      },
      {
        onSuccess: (result) => {
          if (result?.requiresMFA) {
            setRequiresMfa(true);
            setEmail(text.demoAccount!.email);
          } else if (result?.accessToken) {
            localStorage.setItem('accessToken', result.accessToken);
            localStorage.setItem('refreshToken', result.refreshToken);
            router.push('/admin');
          }
        },
        onError: (err: any) => {
          setError(err.message || 'Demo login failed');
        },
        onSettled: () => {
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <div className={className}>
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Demo Account Banner (only if not in MFA mode) */}
      {!requiresMfa && showDemoAccount && text.demoAccount?.enabled && (
        <div
          className="mb-6 p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}10 0%, ${primaryColor}05 100%)`,
            borderColor: `${primaryColor}40`,
          }}
          onClick={handleDemoLogin}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: primaryColor }}
              >
                Quick Demo Login
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {text.demoAccount.note}
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: primaryColor }}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Try Demo'}
            </button>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} method="post">
        {requiresMfa ? (
          // MFA Token Input
          <div className="mb-6">
            <label htmlFor="mfa-token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter MFA Code
            </label>
            <input
              id="mfa-token"
              type="text"
              value={mfaToken}
              onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              placeholder="000000"
              required
              disabled={isLoading}
              autoComplete="one-time-code"
              className="block w-full h-12 px-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white text-center text-2xl font-mono tracking-wider placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ focusRingColor: primaryColor }}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>
        ) : (
          <>
            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  suppressHydrationWarning
                  className="block w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ focusRingColor: primaryColor }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  suppressHydrationWarning
                  className="block w-full h-12 pl-12 pr-12 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ focusRingColor: primaryColor }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Forgot Password Link */}
        {!requiresMfa && (
          <div className="mb-6 text-right">
            <a
              href="/forgot-password"
              className="text-sm hover:underline transition-colors"
              style={{ color: primaryColor }}
            >
              {text.forgotPassword}
            </a>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full h-12 px-4 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:animate-shimmer"
            style={{ animation: 'shimmer 2s linear infinite' }}
          />

          {/* Button content */}
          <span className="relative flex items-center justify-center gap-2">
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            {isLoading ? 'Signing in...' : requiresMfa ? 'Verify Code' : text.loginButton}
          </span>
        </button>

        {/* Back to Login (MFA mode) */}
        {requiresMfa && (
          <button
            type="button"
            onClick={() => {
              setRequiresMfa(false);
              setMfaToken('');
              setError('');
            }}
            className="mt-4 w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            ← Back to login
          </button>
        )}
      </form>
    </div>
  );
}

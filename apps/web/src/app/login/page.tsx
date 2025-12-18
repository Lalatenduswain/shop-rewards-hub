'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

        console.log('[Login Page] Login result:', result);

        if (result?.requiresMFA) {
          setRequiresMfa(true);
        } else if (result?.accessToken) {
          localStorage.setItem('accessToken', result.accessToken);
          localStorage.setItem('refreshToken', result.refreshToken);
          console.log('[Login Page] Tokens stored, redirecting to /admin');
          router.push('/admin');
        } else {
          console.error('[Login Page] Unexpected response structure:', result);
          setError('Login failed - unexpected response');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Content */}
      <div className="hidden lg:flex lg:flex-1 bg-zinc-900 relative">
        <div className="flex flex-col justify-between w-full p-12 xl:p-16">
          {/* Logo & Branding */}
          <div>
            <div className="inline-flex items-center gap-2 mb-16">
              <div className="w-8 h-8 bg-white rounded-lg"></div>
              <span className="text-white text-xl font-semibold">ShopRewards</span>
            </div>

            <div className="max-w-md">
              <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
                Retail rewards<br />made simple
              </h1>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Manage customer loyalty programs, digital vouchers, and promotional campaigns across your retail network.
              </p>
            </div>
          </div>

          {/* Customer Testimonials */}
          <div className="max-w-lg space-y-6">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
              What Our Customers Say
            </h3>

            <div className="space-y-4">
              {/* Testimonial 1 */}
              <div className="bg-zinc-800/50 rounded-lg p-5 border border-zinc-700/50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    LS
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm">Lalatendu Swain</h4>
                    <p className="text-zinc-400 text-xs">Retail Chain Owner</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  "ShopRewards transformed how we manage loyalty programs across our 12 stores. Customer engagement increased by 40% in just 3 months."
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-zinc-800/50 rounded-lg p-5 border border-zinc-700/50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    AS
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm">Aishwarya Sahoo</h4>
                    <p className="text-zinc-400 text-xs">Boutique Manager</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  "The digital voucher system is incredibly easy to use. Our customers love the convenience, and we've seen repeat purchases go up significantly."
                </p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-zinc-800/50 rounded-lg p-5 border border-zinc-700/50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    RD
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm">Rajesh Das</h4>
                    <p className="text-zinc-400 text-xs">Supermarket Director</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  "Outstanding platform with excellent support. The analytics dashboard helps us understand customer behavior and optimize our campaigns."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 opacity-50"></div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <div className="inline-flex items-center gap-2">
              <div className="w-7 h-7 bg-zinc-900 dark:bg-white rounded-lg"></div>
              <span className="text-zinc-900 dark:text-white text-lg font-semibold">ShopRewards</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              {requiresMfa ? 'Two-factor authentication' : 'Sign in to your account'}
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {requiresMfa
                ? 'Enter the verification code from your authenticator app'
                : 'Enter your credentials to access the dashboard'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} method="post" className="space-y-5">
            {!requiresMfa ? (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent"
                    placeholder="you@example.com"
                    suppressHydrationWarning
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent"
                    placeholder="Enter your password"
                    suppressHydrationWarning
                  />
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="mfaToken" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Verification Code
                </label>
                <input
                  id="mfaToken"
                  name="mfaToken"
                  type="text"
                  autoComplete="one-time-code"
                  required
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="block w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white text-center text-lg tracking-wider placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent"
                  suppressHydrationWarning
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2.5 px-4 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 dark:focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : requiresMfa ? (
                'Verify'
              ) : (
                'Sign in'
              )}
            </button>

            {requiresMfa && (
              <button
                type="button"
                onClick={() => {
                  setRequiresMfa(false);
                  setMfaToken('');
                  setError('');
                }}
                className="w-full text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                ← Back to sign in
              </button>
            )}
          </form>

          {/* Footer Links */}
          {!requiresMfa && (
            <div className="mt-8 text-center">
              <a href="/" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                ← Back to home
              </a>
            </div>
          )}

          {/* Security Badge */}
          <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center">
              Protected by 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

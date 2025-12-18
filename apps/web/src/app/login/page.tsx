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
        // Step 2: Login with MFA token
        const result = await loginWithMfaMutation.mutateAsync({
          userId: email, // TODO: Store userId from initial login
          token: mfaToken,
        });

        if (result?.accessToken) {
          // Store tokens in localStorage
          localStorage.setItem('accessToken', result.accessToken);
          localStorage.setItem('refreshToken', result.refreshToken);

          // Redirect to admin dashboard
          router.push('/admin');
        }
      } else {
        // Step 1: Initial login
        const result = await loginMutation.mutateAsync({
          email,
          password,
        });

        if (result?.requiresMFA) {
          // MFA required - show MFA input
          setRequiresMfa(true);
        } else if (result?.accessToken) {
          // Login successful - store tokens and redirect
          localStorage.setItem('accessToken', result.accessToken);
          localStorage.setItem('refreshToken', result.refreshToken);

          router.push('/admin');
        } else {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
          ShopRewards Hub
        </h1>
        <h2 className="mt-6 text-center text-2xl font-medium text-gray-700 dark:text-gray-300">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {!requiresMfa ? (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="mfaToken" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Authentication Code
                </label>
                <div className="mt-1">
                  <input
                    id="mfaToken"
                    name="mfaToken"
                    type="text"
                    autoComplete="one-time-code"
                    required
                    value={mfaToken}
                    onChange={(e) => setMfaToken(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : requiresMfa ? (
                  'Verify Code'
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            {requiresMfa && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setRequiresMfa(false);
                    setMfaToken('');
                    setError('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Back to login
                </button>
              </div>
            )}
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Need help?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a href="/" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Back to home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * MFA Setup Page
 *
 * Allows users to enable two-factor authentication (2FA) using TOTP.
 * Displays QR code for scanning with authenticator apps and backup codes.
 */

import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function MFASetupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'generate' | 'verify' | 'complete'>('generate');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const setupMFAMutation = trpc.auth.setupMFA.useMutation();
  const verifyMFASetupMutation = trpc.auth.verifyMFASetup.useMutation();

  const handleGenerateQR = async () => {
    if (!user?.userId) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await setupMFAMutation.mutateAsync({ userId: user.userId });
      setQrCode(result.qrCodeDataURL);
      setSecret(result.secret);
      setBackupCodes(result.backupCodes);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to generate MFA setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.userId) return;

    setIsLoading(true);
    setError('');

    try {
      await verifyMFASetupMutation.mutateAsync({
        userId: user.userId,
        secret,
        token: verificationCode,
        backupCodes,
      });
      setStep('complete');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadBackupCodes = () => {
    const content = `ShopRewards Hub - MFA Backup Codes
Generated: ${new Date().toLocaleString()}

${backupCodes.join('\n')}

Keep these codes in a safe place. Each code can only be used once.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shoprewards-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Enable Two-Factor Authentication
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Add an extra layer of security to your account
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'generate' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}>
            1
          </div>
          <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Generate</span>
        </div>
        <div className="w-16 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'verify' ? 'bg-blue-600 text-white' : step === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}>
            2
          </div>
          <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Verify</span>
        </div>
        <div className="w-16 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}>
            3
          </div>
          <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Complete</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Step 1: Generate QR Code */}
      {step === 'generate' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Step 1: Generate QR Code
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Click the button below to generate your unique QR code for two-factor authentication.
          </p>
          <button
            onClick={handleGenerateQR}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </div>
      )}

      {/* Step 2: Scan QR Code and Verify */}
      {step === 'verify' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Step 2: Scan QR Code
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
            </p>

            {qrCode && (
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={qrCode}
                  alt="MFA QR Code"
                  className="w-64 h-64 border-4 border-gray-200 dark:border-gray-700 rounded-lg"
                />
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Manual entry code:
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="px-3 py-1 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white text-sm rounded font-mono">
                      {secret}
                    </code>
                    <button
                      onClick={() => copyToClipboard(secret)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      title="Copy to clipboard"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Verify Setup
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter the 6-digit code from your authenticator app to verify the setup.
            </p>

            <form onSubmit={handleVerifySetup} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="block w-full max-w-xs px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-center text-lg tracking-wider placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Verifying...' : 'Verify and Enable'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('generate');
                    setVerificationCode('');
                    setError('');
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
                >
                  Start Over
                </button>
              </div>
            </form>
          </div>

          {/* Backup Codes */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Save Your Backup Codes
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="px-3 py-2 bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 text-gray-900 dark:text-white text-sm rounded font-mono">
                      {code}
                    </code>
                  ))}
                </div>
                <button
                  onClick={downloadBackupCodes}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Download Backup Codes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 'complete' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Two-Factor Authentication Enabled
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your account is now protected with two-factor authentication.
            </p>
            <div className="space-x-3">
              <button
                onClick={() => router.push('/admin/profile')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Go to Profile
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

/**
 * Regenerate Backup Codes Modal Component
 *
 * Modal for regenerating MFA backup codes.
 * Requires password confirmation and displays new codes.
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

interface RegenerateBackupCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function RegenerateBackupCodesModal({
  isOpen,
  onClose,
  userId,
}: RegenerateBackupCodesModalProps) {
  const [password, setPassword] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'confirm' | 'display'>('confirm');

  const regenerateBackupCodesMutation = trpc.auth.regenerateBackupCodes.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await regenerateBackupCodesMutation.mutateAsync({
        userId,
        password,
      });
      setBackupCodes(result.backupCodes);
      setStep('display');
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate backup codes');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = `ShopRewards Hub - MFA Backup Codes
Generated: ${new Date().toLocaleString()}

${backupCodes.join('\n')}

Keep these codes in a safe place. Each code can only be used once.
Old backup codes have been invalidated.`;

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClose = () => {
    setPassword('');
    setBackupCodes([]);
    setError('');
    setStep('confirm');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-6">
          {step === 'confirm' ? (
            <>
              {/* Header */}
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-amber-600 dark:text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Regenerate Backup Codes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    This will invalidate your old backup codes and generate new ones. Enter your password to confirm.
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !password}
                    className="px-4 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Generating...' : 'Generate New Codes'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your New Backup Codes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Save these codes in a safe place. Your old backup codes have been invalidated.
                </p>
              </div>

              {/* Backup Codes */}
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {backupCodes.map((code, index) => (
                    <code
                      key={index}
                      className="px-3 py-2 bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 text-gray-900 dark:text-white text-sm rounded font-mono"
                    >
                      {code}
                    </code>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={downloadBackupCodes}
                    className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Download Codes
                  </button>
                  <button
                    onClick={() => copyToClipboard(backupCodes.join('\n'))}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Copy All
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

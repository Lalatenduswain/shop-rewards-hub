'use client';

/**
 * User Profile Page
 *
 * View and edit user profile, change password, manage MFA.
 */

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DisableMFAModal from '@/components/security/DisableMFAModal';
import RegenerateBackupCodesModal from '@/components/security/RegenerateBackupCodesModal';

export default function ProfilePage() {
  const { user, refreshAuth } = useAuth();
  const router = useRouter();
  const [showDisableMFAModal, setShowDisableMFAModal] = useState(false);
  const [showRegenerateCodesModal, setShowRegenerateCodesModal] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Your Profile
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Profile Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {user?.email || 'Not available'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {user?.name || 'Not set'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {user?.isSuperAdmin ? 'Super Administrator' : 'Shop Administrator'}
              </p>
              {user?.isSuperAdmin && (
                <span className="mt-1 inline-block px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                  Full Platform Access
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Security Settings
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {user?.mfaEnabled ? (
                  <>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      Enabled
                    </span>
                    <button
                      onClick={() => setShowDisableMFAModal(true)}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                      Disable
                    </button>
                    <button
                      onClick={() => setShowRegenerateCodesModal(true)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Backup Codes
                    </button>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                      Disabled
                    </span>
                    <button
                      onClick={() => router.push('/admin/security/mfa/setup')}
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
                    >
                      Enable
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for additional sections */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Profile Management
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Additional profile features are under construction.
            </p>
            <div className="mt-6">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Coming soon:
              </p>
              <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <li>• Edit profile information</li>
                <li>• Change password</li>
                <li>• Activity history</li>
                <li>• Notification preferences</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {user?.userId && (
        <>
          <DisableMFAModal
            isOpen={showDisableMFAModal}
            onClose={() => setShowDisableMFAModal(false)}
            userId={user.userId}
            onSuccess={() => {
              // Refresh user data to update MFA status
              refreshAuth();
            }}
          />
          <RegenerateBackupCodesModal
            isOpen={showRegenerateCodesModal}
            onClose={() => setShowRegenerateCodesModal(false)}
            userId={user.userId}
          />
        </>
      )}
    </div>
  );
}

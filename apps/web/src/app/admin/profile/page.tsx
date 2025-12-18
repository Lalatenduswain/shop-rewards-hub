'use client';

/**
 * User Profile Page
 *
 * View and edit user profile, change password, manage MFA.
 */

import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

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
                <li>• Enable/disable MFA</li>
                <li>• Manage backup codes</li>
                <li>• Activity history</li>
                <li>• Notification preferences</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

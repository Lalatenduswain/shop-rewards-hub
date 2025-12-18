'use client';

import { useWizardStore, useWizardCompletion } from '@/store/wizardStore';
import { useEffect, useState } from 'react';

export function Step12Launch() {
  const { progress, completedSteps } = useWizardCompletion();
  const wizardData = useWizardStore((state) => state);
  const markStepCompleted = useWizardStore((state) => state.markStepCompleted);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchComplete, setLaunchComplete] = useState(false);

  useEffect(() => {
    markStepCompleted(12);
  }, [markStepCompleted]);

  const handleLaunch = async () => {
    setIsLaunching(true);

    try {
      // TODO: Call tRPC mutation to finalize wizard and create all resources
      await new Promise((resolve) => setTimeout(resolve, 5000));

      setLaunchComplete(true);
    } catch (error) {
      console.error('Launch failed:', error);
      setIsLaunching(false);
    }
  };

  if (launchComplete) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🎉 Platform Launched Successfully!
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Your ShopRewards Hub is now live and ready to use. All configurations have been applied and your database is initialized.
        </p>

        <div className="space-y-4 max-w-md mx-auto">
          <a
            href="/admin"
            className="block w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-11 px-8 py-2"
          >
            Go to Admin Dashboard
          </a>

          <a
            href="/login"
            className="block w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8 py-2"
          >
            Login as Admin
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Next Steps:</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 max-w-xl mx-auto text-left">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">→</span>
              <span>Check your email for admin credentials and MFA setup instructions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">→</span>
              <span>Review the admin dashboard and customize your settings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">→</span>
              <span>Invite team members and assign roles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">→</span>
              <span>Test receipt upload and voucher generation workflows</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Launch! 🚀
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Review your configuration below and click "Launch Platform" to complete the setup process.
        </p>
      </div>

      {/* Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Company</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>Name: {wizardData.company?.name || 'Not set'}</p>
            <p>Industry: {wizardData.company?.industry || 'Not set'}</p>
            <p>Country: {wizardData.company?.country || 'Not set'}</p>
          </div>
        </div>

        {/* Admin */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Admin User</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>Name: {wizardData.admin?.name || 'Not set'}</p>
            <p>Email: {wizardData.admin?.email || 'Not set'}</p>
            <p>MFA: {wizardData.admin?.mfaEnabled ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>

        {/* Application */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Application</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>Language: {wizardData.appConfig?.language || 'Not set'}</p>
            <p>Modules: {wizardData.appConfig?.enabledModules?.length || 0} enabled</p>
          </div>
        </div>

        {/* Database */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Database</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>Target: {wizardData.database?.target || 'Not set'}</p>
            <p>Status: {wizardData.database?.validated ? '✓ Validated' : 'Not validated'}</p>
          </div>
        </div>

        {/* Security */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Security</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>Session Timeout: {wizardData.security?.sessionTimeout || 15} min</p>
            <p>Data Retention: {wizardData.security?.dataRetentionDays || 30} days</p>
          </div>
        </div>

        {/* Billing */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Billing</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>Provider: {wizardData.billing?.provider || 'Not set'}</p>
            <p>Status: {wizardData.billing?.provider === 'manual' ? 'Manual' : 'Automated'}</p>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Setup Progress</h3>
          <span className="text-sm font-bold text-blue-900 dark:text-blue-100">{progress}%</span>
        </div>
        <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-full h-3 overflow-hidden mb-3">
          <div
            className="bg-blue-600 dark:bg-blue-400 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          {completedSteps.length} of 12 steps completed
        </p>
      </div>

      {/* Launch Button */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleLaunch}
          disabled={isLaunching}
          className="w-full inline-flex items-center justify-center rounded-md text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 h-14 px-8 py-2"
        >
          {isLaunching ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Launching Platform...
            </>
          ) : (
            <>
              Launch Platform 🚀
            </>
          )}
        </button>

        {isLaunching && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Setting up your platform... This may take a few moments. Please don't close this window.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

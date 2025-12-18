'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { securitySchema, type Security } from '@shop-rewards/shared';
import { useWizardStore } from '@/store/wizardStore';
import { useEffect } from 'react';

export function Step05Security() {
  const security = useWizardStore((state) => state.security);
  const setSecurityData = useWizardStore((state) => state.setSecurityData);
  const markStepCompleted = useWizardStore((state) => state.markStepCompleted);

  const {
    register,

    watch,
    formState: { errors, isValid },
  } = useForm<Security>({
    resolver: zodResolver(securitySchema),
    defaultValues: security,
    mode: 'onChange',
  });

  const formValues = watch();

  useEffect(() => {
    if (formValues) {
      setSecurityData(formValues);
    }
  }, [formValues, setSecurityData]);

  useEffect(() => {
    if (isValid) {
      markStepCompleted(5);
    }
  }, [isValid, markStepCompleted]);

  return (
    <div className="space-y-6">
      {/* Password Policy */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Password Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="minPasswordLength" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Length <span className="text-red-500">*</span>
            </label>
            <input
              id="minPasswordLength"
              type="number"
              min="8"
              max="32"
              {...register('minPasswordLength', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.minPasswordLength && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.minPasswordLength.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="passwordExpiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password Expiry (days) <span className="text-red-500">*</span>
            </label>
            <input
              id="passwordExpiry"
              type="number"
              min="0"
              max="365"
              {...register('passwordExpiry', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.passwordExpiry && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.passwordExpiry.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Set to 0 for no expiry</p>
          </div>

          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <input
                id="requireUppercase"
                type="checkbox"
                {...register('requireUppercase')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="requireUppercase" className="text-sm text-gray-700 dark:text-gray-300">
                Require uppercase letters
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="requireNumbers"
                type="checkbox"
                {...register('requireNumbers')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="requireNumbers" className="text-sm text-gray-700 dark:text-gray-300">
                Require numbers
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="requireSpecialChars"
                type="checkbox"
                {...register('requireSpecialChars')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="requireSpecialChars" className="text-sm text-gray-700 dark:text-gray-300">
                Require special characters (!@#$%^&*)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Session Settings */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Session Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session Timeout (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              id="sessionTimeout"
              type="number"
              min="5"
              max="1440"
              {...register('sessionTimeout', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.sessionTimeout && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.sessionTimeout.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Recommended: 15-30 minutes</p>
          </div>

          <div>
            <label htmlFor="maxConcurrentSessions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Concurrent Sessions <span className="text-red-500">*</span>
            </label>
            <input
              id="maxConcurrentSessions"
              type="number"
              min="1"
              max="10"
              {...register('maxConcurrentSessions', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.maxConcurrentSessions && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maxConcurrentSessions.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* IP Whitelisting */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">IP Whitelisting (Optional)</h3>
        <div>
          <label htmlFor="ipWhitelist" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Allowed IP Addresses
          </label>
          <textarea
            id="ipWhitelist"
            {...register('ipWhitelist')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="192.168.1.1&#10;10.0.0.0/24&#10;2001:db8::1"
          />
          {errors.ipWhitelist && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ipWhitelist.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            One IP/CIDR per line. Leave empty to allow all IPs.
          </p>
        </div>
      </div>

      {/* GDPR Settings */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">GDPR Compliance</h3>
        <div>
          <label htmlFor="dataRetentionDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data Retention Period (days) <span className="text-red-500">*</span>
          </label>
          <input
            id="dataRetentionDays"
            type="number"
            min="1"
            max="3650"
            {...register('dataRetentionDays', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.dataRetentionDays && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dataRetentionDays.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Receipts will be automatically deleted after this period. Recommended: 30-90 days.
          </p>
        </div>
      </div>

      {/* Validation Status */}
      {isValid && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Security settings configured. Click "Next" to continue.
          </p>
        </div>
      )}
    </div>
  );
}

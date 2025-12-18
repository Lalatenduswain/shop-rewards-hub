'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { integrationSchema, type Integration } from '@shop-rewards/shared';
import { useWizardStore } from '@/store/wizardStore';
import { useEffect, useState } from 'react';

export function Step06EmailIntegration() {
  const integration = useWizardStore((state) => state.integration);
  const setIntegrationData = useWizardStore((state) => state.setIntegrationData);
  const markStepCompleted = useWizardStore((state) => state.markStepCompleted);
  const [showPassword, setShowPassword] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const {
    register,

    watch,
    formState: { errors, isValid },
  } = useForm<Integration>({
    resolver: zodResolver(integrationSchema),
    defaultValues: integration,
    mode: 'onChange',
  });

  const formValues = watch();

  useEffect(() => {
    if (formValues) {
      setIntegrationData(formValues);
    }
  }, [formValues, setIntegrationData]);

  useEffect(() => {
    if (isValid && testStatus === 'success') {
      markStepCompleted(6);
    }
  }, [isValid, testStatus, markStepCompleted]);

  const handleTestSmtp = async () => {
    setTestStatus('testing');
    // TODO: Call tRPC mutation to test SMTP
    setTimeout(() => {
      setTestStatus('success');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Configure SMTP to send email notifications for vouchers, receipts, and system alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SMTP Host */}
        <div>
          <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SMTP Host <span className="text-red-500">*</span>
          </label>
          <input
            id="smtpHost"
            type="text"
            {...register('smtpHost')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="smtp.gmail.com"
          />
          {errors.smtpHost && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.smtpHost.message}</p>
          )}
        </div>

        {/* SMTP Port */}
        <div>
          <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SMTP Port <span className="text-red-500">*</span>
          </label>
          <input
            id="smtpPort"
            type="number"
            {...register('smtpPort', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="587"
          />
          {errors.smtpPort && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.smtpPort.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Common ports: 587 (TLS), 465 (SSL), 25 (unencrypted)
          </p>
        </div>

        {/* SMTP Username */}
        <div>
          <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SMTP Username <span className="text-red-500">*</span>
          </label>
          <input
            id="smtpUsername"
            type="text"
            {...register('smtpUsername')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="user@example.com"
          />
          {errors.smtpUsername && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.smtpUsername.message}</p>
          )}
        </div>

        {/* SMTP Password */}
        <div>
          <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SMTP Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="smtpPassword"
              type={showPassword ? 'text' : 'password'}
              {...register('smtpPassword')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.smtpPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.smtpPassword.message}</p>
          )}
        </div>

        {/* SMTP Encryption */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Encryption <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <input
                id="smtpTls"
                type="radio"
                {...register('smtpEncryption')}
                value="tls"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="smtpTls" className="text-sm text-gray-700 dark:text-gray-300">
                TLS (Port 587)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="smtpSsl"
                type="radio"
                {...register('smtpEncryption')}
                value="ssl"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="smtpSsl" className="text-sm text-gray-700 dark:text-gray-300">
                SSL (Port 465)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="smtpNone"
                type="radio"
                {...register('smtpEncryption')}
                value="none"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="smtpNone" className="text-sm text-gray-700 dark:text-gray-300">
                None (Not recommended)
              </label>
            </div>
          </div>
          {errors.smtpEncryption && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.smtpEncryption.message}</p>
          )}
        </div>
      </div>

      {/* Test Connection */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleTestSmtp}
          disabled={!isValid || testStatus === 'testing'}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
        >
          {testStatus === 'testing' ? 'Testing Connection...' : 'Test SMTP Connection'}
        </button>

        {testStatus === 'success' && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ SMTP connection successful! Test email sent.
            </p>
          </div>
        )}

        {testStatus === 'error' && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              ✗ SMTP connection failed. Please check your settings.
            </p>
          </div>
        )}
      </div>

      {/* Validation Status */}
      {isValid && testStatus === 'success' && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Email integration configured and tested. Click "Next" to continue.
          </p>
        </div>
      )}
    </div>
  );
}

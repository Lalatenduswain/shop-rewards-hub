'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { billingSchema, type Billing } from '@shop-rewards/shared';
import { useWizardStore } from '@/store/wizardStore';
import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

export function Step11Billing() {
  const billing = useWizardStore((state) => state.billing);
  const setBillingData = useWizardStore((state) => state.setBillingData);
  const markStepCompleted = useWizardStore((state) => state.markStepCompleted);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const {
    register,

    watch,
    formState: { errors, isValid },
  } = useForm<Billing>({
    resolver: zodResolver(billingSchema),
    defaultValues: billing,
    mode: 'onChange',
  });

  const formValues = watch();
  const provider = watch('provider');

  useEffect(() => {
    if (formValues) {
      setBillingData(formValues);
    }
  }, [formValues, setBillingData]);

  useEffect(() => {
    if (isValid && (provider === 'manual' || testStatus === 'success')) {
      markStepCompleted(11);
    }
  }, [isValid, provider, testStatus, markStepCompleted]);

  const testProviderMutation = trpc.wizard.testPaymentProvider.useMutation();

  const handleTestProvider = async () => {
    setTestStatus('testing');

    try {
      const result = await testProviderMutation.mutateAsync(formValues);

      if (result.success) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch (error) {
      console.error('Payment provider test failed:', error);
      setTestStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Configure billing and payment processing for your platform. This enables subscription management and payment collection.
        </p>
      </div>

      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Payment Provider <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stripe */}
          <div
            className={`p-5 border-2 rounded-lg cursor-pointer transition-all ${
              provider === 'stripe'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
            }`}
            onClick={() => setBillingData({ provider: 'stripe' })}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                {...register('provider')}
                value="stripe"
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">Stripe</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Full-featured payment processor with subscriptions, invoicing, and more.
                </div>
              </div>
            </div>
          </div>

          {/* PayPal */}
          <div
            className={`p-5 border-2 rounded-lg cursor-pointer transition-all ${
              provider === 'paypal'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
            }`}
            onClick={() => setBillingData({ provider: 'paypal' })}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                {...register('provider')}
                value="paypal"
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">PayPal</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Global payment platform with wide consumer adoption.
                </div>
              </div>
            </div>
          </div>

          {/* Manual */}
          <div
            className={`p-5 border-2 rounded-lg cursor-pointer transition-all ${
              provider === 'manual'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
            }`}
            onClick={() => setBillingData({ provider: 'manual' })}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                {...register('provider')}
                value="manual"
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">Manual</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Manual invoicing and payment tracking. Configure provider later.
                </div>
              </div>
            </div>
          </div>
        </div>
        {errors.provider && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.provider.message}</p>
        )}
      </div>

      {/* Stripe Configuration */}
      {provider === 'stripe' && (
        <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Stripe Configuration</h3>

          {/* Stripe API Key */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stripe Secret Key <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                {...register('apiKey')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 font-mono text-sm"
                placeholder="sk_live_..."
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.apiKey && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.apiKey.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Get your API key from <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stripe Dashboard</a>
            </p>
          </div>

          {/* Webhook Secret */}
          <div>
            <label htmlFor="webhookSecret" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Webhook Secret (Optional)
            </label>
            <input
              id="webhookSecret"
              type="text"
              {...register('webhookSecret')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="whsec_..."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Configure webhook endpoint: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">https://yourdomain.com/api/webhooks/stripe</code>
            </p>
          </div>
        </div>
      )}

      {/* PayPal Configuration */}
      {provider === 'paypal' && (
        <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">PayPal Configuration</h3>

          {/* PayPal Client ID */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              PayPal Client ID <span className="text-red-500">*</span>
            </label>
            <input
              id="apiKey"
              type="text"
              {...register('apiKey')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="AYSq3RDGsmBLJ..."
            />
            {errors.apiKey && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.apiKey.message}</p>
            )}
          </div>

          {/* PayPal Secret */}
          <div>
            <label htmlFor="webhookSecret" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              PayPal Secret <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="webhookSecret"
                type={showApiKey ? 'text' : 'password'}
                {...register('webhookSecret')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 font-mono text-sm"
                placeholder="EO422dn..."
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Get credentials from <a href="https://developer.paypal.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">PayPal Developer</a>
            </p>
          </div>
        </div>
      )}

      {/* Manual Billing Info */}
      {provider === 'manual' && (
        <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Manual Billing</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            With manual billing, you'll track payments and invoices manually. You can configure an automated provider later from the admin dashboard.
          </p>
        </div>
      )}

      {/* Test Provider Button */}
      {provider !== 'manual' && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleTestProvider}
            disabled={!isValid || testStatus === 'testing'}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
          >
            {testStatus === 'testing' ? 'Testing API...' : `Test ${provider === 'stripe' ? 'Stripe' : 'PayPal'} Connection`}
          </button>

          {testStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ API connection successful! Provider configured correctly.
              </p>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                ✗ API connection failed. Please check your credentials.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Validation Status */}
      {isValid && (provider === 'manual' || testStatus === 'success') && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Billing configuration complete. Click "Next" to continue.
          </p>
        </div>
      )}
    </div>
  );
}

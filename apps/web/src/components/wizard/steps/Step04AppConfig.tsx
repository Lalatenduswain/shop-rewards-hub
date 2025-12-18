'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appConfigSchema, type AppConfig } from '@shop-rewards/shared';
import { useWizardStore } from '@/store/wizardStore';
import { useEffect } from 'react';

const AVAILABLE_MODULES = [
  { id: 'receipts', label: 'Receipt Upload & OCR', description: 'Allow customers to upload receipts for rewards' },
  { id: 'vouchers', label: 'Voucher Management', description: 'Create and manage digital vouchers' },
  { id: 'ads', label: 'Advertisement System', description: 'Display targeted ads to customers' },
  { id: 'analytics', label: 'Analytics Dashboard', description: 'Track performance metrics' },
  { id: 'loyalty', label: 'Loyalty Points', description: 'Points-based rewards system' },
  { id: 'referrals', label: 'Referral Program', description: 'Customer referral tracking' },
] as const;

export function Step04AppConfig() {
  const appConfig = useWizardStore((state) => state.appConfig);
  const setAppConfigData = useWizardStore((state) => state.setAppConfigData);
  const markStepCompleted = useWizardStore((state) => state.markStepCompleted);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<AppConfig>({
    resolver: zodResolver(appConfigSchema),
    defaultValues: appConfig,
    mode: 'onChange',
  });

  const enabledModules = watch('enabledModules') || [];

  useEffect(() => {
    if (isValid) {
      markStepCompleted(4);
    }
  }, [isValid, markStepCompleted]);

  // Save form data
  const saveFormData = (data: AppConfig) => {
    setAppConfigData(data);
  };

  const toggleModule = (moduleId: string) => {
    const current = enabledModules || [];
    const updated = current.includes(moduleId)
      ? current.filter((m) => m !== moduleId)
      : [...current, moduleId];
    setValue('enabledModules', updated, { shouldValidate: true });
    handleSubmit(saveFormData)();
  };

  return (
    <form onSubmit={handleSubmit(saveFormData)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Language <span className="text-red-500">*</span>
          </label>
          <select
            id="language"
            {...register('language')}
            onChange={handleSubmit(saveFormData)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="hi">Hindi</option>
            <option value="zh">Chinese (Simplified)</option>
          </select>
          {errors.language && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.language.message}</p>
          )}
        </div>

        {/* Date Format */}
        <div>
          <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Format <span className="text-red-500">*</span>
          </label>
          <select
            id="dateFormat"
            {...register('dateFormat')}
            onChange={handleSubmit(saveFormData)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
          </select>
          {errors.dateFormat && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dateFormat.message}</p>
          )}
        </div>
      </div>

      {/* Enabled Modules */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Enabled Modules <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE_MODULES.map((module) => {
            const isEnabled = enabledModules.includes(module.id);
            return (
              <div
                key={module.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isEnabled
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                }`}
                onClick={() => toggleModule(module.id)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => toggleModule(module.id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{module.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {module.description}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {errors.enabledModules && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.enabledModules.message}</p>
        )}
      </div>

      {/* Notification Settings */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Notification Channels <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              id="notifyEmail"
              type="checkbox"
              {...register('notifyEmail')}
              onChange={handleSubmit(saveFormData)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="notifyEmail" className="text-sm text-gray-700 dark:text-gray-300">
              Email Notifications
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="notifySms"
              type="checkbox"
              {...register('notifySms')}
              onChange={handleSubmit(saveFormData)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="notifySms" className="text-sm text-gray-700 dark:text-gray-300">
              SMS Notifications
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="notifyPush"
              type="checkbox"
              {...register('notifyPush')}
              onChange={handleSubmit(saveFormData)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="notifyPush" className="text-sm text-gray-700 dark:text-gray-300">
              Push Notifications (Mobile App)
            </label>
          </div>
        </div>
      </div>

      {/* Validation Status */}
      {isValid && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Application configuration complete ({enabledModules.length} modules enabled). Click "Next" to continue.
          </p>
        </div>
      )}
    </form>
  );
}

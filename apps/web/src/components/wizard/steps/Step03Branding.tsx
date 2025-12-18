'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { brandingSchema, type Branding } from '@shop-rewards/shared';
import { useWizardStore } from '@/store/wizardStore';
import { useEffect } from 'react';

export function Step03Branding() {
  const branding = useWizardStore((state) => state.branding);
  const setBrandingData = useWizardStore((state) => state.setBrandingData);
  const markStepCompleted = useWizardStore((state) => state.markStepCompleted);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<Branding>({
    resolver: zodResolver(brandingSchema),
    defaultValues: branding,
    mode: 'onChange',
  });

  const primaryColor = watch('primaryColor');
  const secondaryColor = watch('secondaryColor');

  useEffect(() => {
    if (isValid) {
      markStepCompleted(3);
    }
  }, [isValid, markStepCompleted]);

  // Save form data
  const saveFormData = (data: Branding) => {
    setBrandingData(data);
  };

  return (
    <form onSubmit={handleSubmit(saveFormData)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Custom Domain */}
        <div className="col-span-2">
          <label htmlFor="customDomain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Domain (Optional)
          </label>
          <input
            id="customDomain"
            type="text"
            {...register('customDomain')}
            onBlur={handleSubmit(saveFormData)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="rewards.yourcompany.com"
          />
          {errors.customDomain && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.customDomain.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Point your DNS CNAME record to: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">app.shoprewards.com</code>
          </p>
        </div>

        {/* Email Sender Name */}
        <div className="col-span-2">
          <label htmlFor="emailSenderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Sender Name <span className="text-red-500">*</span>
          </label>
          <input
            id="emailSenderName"
            type="text"
            {...register('emailSenderName')}
            onBlur={handleSubmit(saveFormData)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Acme Rewards Team"
          />
          {errors.emailSenderName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.emailSenderName.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            This name will appear in the "From" field of all system emails
          </p>
        </div>

        {/* Primary Color */}
        <div>
          <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Primary Brand Color <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <input
              id="primaryColor"
              type="color"
              {...register('primaryColor')}
              className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              value={primaryColor || '#3B82F6'}
              onChange={(e) => setBrandingData({ primaryColor: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="#3B82F6"
            />
          </div>
          {errors.primaryColor && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.primaryColor.message}</p>
          )}
        </div>

        {/* Secondary Color */}
        <div>
          <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Secondary Brand Color <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <input
              id="secondaryColor"
              type="color"
              {...register('secondaryColor')}
              className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              value={secondaryColor || '#6366F1'}
              onChange={(e) => setBrandingData({ secondaryColor: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="#6366F1"
            />
          </div>
          {errors.secondaryColor && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.secondaryColor.message}</p>
          )}
        </div>

        {/* Color Preview */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color Preview
          </label>
          <div className="flex gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-md">
            <div
              className="flex-1 h-20 rounded-md flex items-center justify-center text-white font-medium"
              style={{ backgroundColor: primaryColor || '#3B82F6' }}
            >
              Primary
            </div>
            <div
              className="flex-1 h-20 rounded-md flex items-center justify-center text-white font-medium"
              style={{ backgroundColor: secondaryColor || '#6366F1' }}
            >
              Secondary
            </div>
          </div>
        </div>

        {/* Favicon Upload */}
        <div className="col-span-2">
          <label htmlFor="favicon" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Favicon (Optional)
          </label>
          <input
            id="favicon"
            type="file"
            accept="image/x-icon,image/png"
            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setBrandingData({ favicon: reader.result as string });
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            ICO or PNG format. Recommended: 32x32px or 16x16px
          </p>
        </div>
      </div>

      {/* Validation Status */}
      {isValid && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Branding configured. Click "Next" to continue.
          </p>
        </div>
      )}
    </form>
  );
}

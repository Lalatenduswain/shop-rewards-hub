'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySetupSchema, type CompanySetup } from '@shop-rewards/shared';
import { useWizardStore } from '@/store/wizardStore';
import { useEffect } from 'react';

export function Step01CompanySetup() {
  const company = useWizardStore((state) => state.company);
  const setCompanyData = useWizardStore((state) => state.setCompanyData);
  const markStepCompleted = useWizardStore((state) => state.markStepCompleted);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CompanySetup>({
    resolver: zodResolver(companySetupSchema),
    defaultValues: company,
    mode: 'onChange',
  });

  // Save data when form is valid and mark step completed
  useEffect(() => {
    if (isValid) {
      markStepCompleted(1);
    }
  }, [isValid, markStepCompleted]);

  // Save form data on blur or when moving to next step
  const saveFormData = (data: CompanySetup) => {
    setCompanyData(data);
  };

  return (
    <form onSubmit={handleSubmit(saveFormData)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            onBlur={handleSubmit(saveFormData)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Acme Corporation"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Industry */}
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Industry <span className="text-red-500">*</span>
          </label>
          <select
            id="industry"
            {...register('industry')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select industry</option>
            <option value="retail">Retail</option>
            <option value="ecommerce">E-Commerce</option>
            <option value="hospitality">Hospitality</option>
            <option value="automotive">Automotive</option>
            <option value="healthcare">Healthcare</option>
            <option value="other">Other</option>
          </select>
          {errors.industry && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.industry.message}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            id="country"
            {...register('country')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select country</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="IN">India</option>
            <option value="SG">Singapore</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
          </select>
          {errors.country && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.country.message}</p>
          )}
        </div>

        {/* Timezone */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timezone <span className="text-red-500">*</span>
          </label>
          <select
            id="timezone"
            {...register('timezone')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select timezone</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">GMT</option>
            <option value="Europe/Paris">Central European Time</option>
            <option value="Asia/Kolkata">India Standard Time</option>
            <option value="Asia/Singapore">Singapore Time</option>
            <option value="Australia/Sydney">Australian Eastern Time</option>
          </select>
          {errors.timezone && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.timezone.message}</p>
          )}
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Currency <span className="text-red-500">*</span>
          </label>
          <select
            id="currency"
            {...register('currency')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select currency</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="GBP">British Pound (GBP)</option>
            <option value="CAD">Canadian Dollar (CAD)</option>
            <option value="AUD">Australian Dollar (AUD)</option>
            <option value="INR">Indian Rupee (INR)</option>
            <option value="SGD">Singapore Dollar (SGD)</option>
          </select>
          {errors.currency && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currency.message}</p>
          )}
        </div>

        {/* Logo Upload (Optional) */}
        <div className="col-span-2">
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Logo (Optional)
          </label>
          <div className="mt-1 flex items-center gap-4">
            <input
              id="logo"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setCompanyData({ logo: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, or SVG. Max 2MB. Recommended: 200x200px
          </p>
        </div>
      </div>

      {/* Validation Status */}
      {isValid && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Company information is complete. Click "Next" to continue.
          </p>
        </div>
      )}
    </form>
  );
}

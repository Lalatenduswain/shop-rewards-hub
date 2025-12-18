'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminUserSchema, type AdminUser } from '@shop-rewards/shared';
import { useWizardStore } from '@/store/wizardStore';
import { useEffect, useState } from 'react';

export function Step02AdminUser() {
  const admin = useWizardStore((state) => state.admin);
  const setAdminData = useWizardStore((state) => state.setAdminData);
  const markStepCompleted = useWizardStore((state) => state.markStepCompleted);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AdminUser>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: admin,
    mode: 'onChange',
  });

  const password = watch('password');

  useEffect(() => {
    if (isValid) {
      markStepCompleted(2);
    }
  }, [isValid, markStepCompleted]);

  // Save form data
  const saveFormData = (data: AdminUser) => {
    setAdminData(data);
  };

  // Password strength indicator
  const getPasswordStrength = (pwd: string | undefined): number => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/\d/.test(pwd)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="admin@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="col-span-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
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
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
          )}

          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passwordStrength < 50
                        ? 'bg-red-500'
                        : passwordStrength < 75
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Use at least 8 characters with uppercase, lowercase, numbers, and symbols
              </p>
            </div>
          )}
        </div>

        {/* MFA Enabled */}
        <div className="col-span-2">
          <div className="flex items-start gap-3">
            <input
              id="mfaEnabled"
              type="checkbox"
              {...register('mfaEnabled')}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <label htmlFor="mfaEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Multi-Factor Authentication (MFA)
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Recommended for enhanced security. You'll scan a QR code with an authenticator app during first login.
              </p>
            </div>
          </div>
        </div>

        {/* Bulk Invite CSV (Optional) */}
        <div className="col-span-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label htmlFor="bulkInviteCsv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bulk Invite Employees (Optional)
          </label>
          <input
            id="bulkInviteCsv"
            type="file"
            accept=".csv"
            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setAdminData({ bulkInviteCsv: reader.result as string });
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            CSV format: name,email,role (e.g., "Jane Smith,jane@example.com,manager")
          </p>
        </div>
      </div>

      {/* Validation Status */}
      {isValid && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Admin account configured. Click "Next" to continue.
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rbacSchema, type RBAC } from '@shop-rewards/shared';
import { useWizardStore } from '@/store/wizardStore';
import { useEffect } from 'react';

const DEFAULT_ROLES = [
  {
    name: 'super_admin',
    description: 'Full system access, cross-tenant capabilities',
    permissions: ['*:*'],
    isSystem: true,
  },
  {
    name: 'admin',
    description: 'Shop owner with full control over their tenant',
    permissions: ['shops:*', 'users:*', 'vouchers:*', 'receipts:*', 'ads:*', 'analytics:*'],
    isSystem: true,
  },
  {
    name: 'manager',
    description: 'Department manager with approval rights',
    permissions: ['vouchers:approve', 'receipts:review', 'users:read', 'analytics:read'],
    isSystem: false,
  },
  {
    name: 'user',
    description: 'End customer with basic access',
    permissions: ['receipts:create', 'receipts:read_own', 'vouchers:read_own', 'vouchers:redeem'],
    isSystem: true,
  },
];

export function Step08RBAC() {
  const rbac = useWizardStore((state) => state.rbac);
  const setRbacData = useWizardStore((state) => state.setRbacData);
  const markStepCompleted = useWizardStore((state) => state.markStepCompleted);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<RBAC>({
    resolver: zodResolver(rbacSchema),
    defaultValues: rbac || { useDefaults: true, customRoles: [] },
    mode: 'onChange',
  });

  const useDefaults = watch('useDefaults');

  useEffect(() => {
    if (isValid) {
      markStepCompleted(8);
    }
  }, [isValid, markStepCompleted]);

  // Save form data
  const saveFormData = (data: RBAC) => {
    setRbacData(data);
  };

  return (
    <form onSubmit={handleSubmit(saveFormData)} className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Configure Role-Based Access Control (RBAC) for your platform. You can use default roles or create custom ones.
        </p>
      </div>

      {/* Use Default Roles */}
      <div>
        <div className="flex items-start gap-3 p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <input
            id="useDefaults"
            type="checkbox"
            {...register('useDefaults')}
            onChange={handleSubmit(saveFormData)}
            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <label htmlFor="useDefaults" className="text-sm font-medium text-gray-900 dark:text-white">
              Use Default Roles (Recommended)
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Pre-configured roles with appropriate permissions for most use cases. You can customize later.
            </p>
          </div>
        </div>
      </div>

      {/* Default Roles Preview */}
      {useDefaults && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Default Roles</h3>
          <div className="space-y-3">
            {DEFAULT_ROLES.map((role) => (
              <div
                key={role.name}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {role.name}
                      {role.isSystem && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                          System
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {role.description}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Permissions:</div>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-mono"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Roles Section */}
      {!useDefaults && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Custom Roles</h3>
          <div className="p-8 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Custom role configuration will be available after completing the wizard.
            </p>
            <button
              type="button"
              onClick={() => {
                setValue('useDefaults', true);
                handleSubmit(saveFormData)();
              }}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              Use Default Roles Instead
            </button>
          </div>
        </div>
      )}

      {/* Permission Modules Info */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Available Permission Modules</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'shops',
            'users',
            'roles',
            'vouchers',
            'receipts',
            'ads',
            'analytics',
            'billing',
            'settings',
          ].map((module) => (
            <div
              key={module}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300 font-mono"
            >
              {module}:*
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Permissions follow the format <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">module:action</code>.
          Use <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">*</code> as wildcard.
        </p>
      </div>

      {/* Validation Status */}
      {isValid && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ RBAC configuration complete. {useDefaults ? '4 default roles' : 'Custom roles'} will be created. Click "Next" to continue.
          </p>
        </div>
      )}
    </form>
  );
}

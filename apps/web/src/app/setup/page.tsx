'use client';

import { useWizardStore, useWizardCompletion } from '@/store/wizardStore';

export default function SetupPage() {
  const currentStep = useWizardStore((state) => state.currentStep);
  const { progress, completedSteps, remainingSteps } = useWizardCompletion();
  const nextStep = useWizardStore((state) => state.nextStep);
  const previousStep = useWizardStore((state) => state.previousStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ShopRewards Hub Setup
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete the 12-step wizard to configure your platform
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Step {currentStep} of 12
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {progress}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {completedSteps.length} steps completed • {remainingSteps} remaining
            </div>
          </div>
        </div>

        {/* Wizard Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Step {currentStep}: {getStepTitle(currentStep)}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {getStepDescription(currentStep)}
              </p>
            </div>

            {/* Step Content Placeholder */}
            <div className="min-h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                Step {currentStep} component will be rendered here
              </p>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={previousStep}
                disabled={currentStep === 1}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                disabled={currentStep === 12}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {currentStep === 12 ? 'Complete Setup' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStepTitle(step: number): string {
  const titles = [
    'Company Setup',
    'Admin User',
    'Branding',
    'App Configuration',
    'Security Settings',
    'Email Integration',
    'Database Target',
    'Roles & Permissions',
    'Organization Structure',
    'Data Import',
    'Billing Configuration',
    'Launch Confirmation',
  ];
  return titles[step - 1] || 'Unknown Step';
}

function getStepDescription(step: number): string {
  const descriptions = [
    'Configure your company details and basic information',
    'Create the super administrator account',
    'Customize your brand colors and logo',
    'Configure application settings and enabled modules',
    'Set security policies and data retention',
    'Configure SMTP for email notifications',
    'Choose and configure your database',
    'Set up roles and permissions (RBAC)',
    'Define departments and locations',
    'Import existing data (optional)',
    'Configure billing and payment providers',
    'Review and launch your platform',
  ];
  return descriptions[step - 1] || 'Step description';
}

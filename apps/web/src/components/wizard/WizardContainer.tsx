'use client';

import { useWizardStore } from '@/store/wizardStore';
import { ProgressBar } from './ProgressBar';
import { StepNavigation } from './StepNavigation';
import { Step01CompanySetup } from './steps/Step01CompanySetup';
import { Step02AdminUser } from './steps/Step02AdminUser';
import { Step03Branding } from './steps/Step03Branding';
import { Step04AppConfig } from './steps/Step04AppConfig';
import { Step05Security } from './steps/Step05Security';
import { Step06EmailIntegration } from './steps/Step06EmailIntegration';
import { Step07DatabaseTarget } from './steps/Step07DatabaseTarget';
import { Step08RBAC } from './steps/Step08RBAC';
import { Step09Organization } from './steps/Step09Organization';
import { Step10DataImport } from './steps/Step10DataImport';
import { Step11Billing } from './steps/Step11Billing';
import { Step12Launch } from './steps/Step12Launch';

const STEP_COMPONENTS = [
  Step01CompanySetup,
  Step02AdminUser,
  Step03Branding,
  Step04AppConfig,
  Step05Security,
  Step06EmailIntegration,
  Step07DatabaseTarget,
  Step08RBAC,
  Step09Organization,
  Step10DataImport,
  Step11Billing,
  Step12Launch,
];

const STEP_TITLES = [
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

const STEP_DESCRIPTIONS = [
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

export function WizardContainer() {
  const currentStep = useWizardStore((state) => state.currentStep);
  const isLoading = useWizardStore((state) => state.isLoading);
  const error = useWizardStore((state) => state.error);

  const CurrentStepComponent = STEP_COMPONENTS[currentStep - 1];
  const stepTitle = STEP_TITLES[currentStep - 1];
  const stepDescription = STEP_DESCRIPTIONS[currentStep - 1];

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
        <ProgressBar />

        {/* Main Wizard Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            {/* Step Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Step {currentStep}: {stepTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {stepDescription}
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Step Content */}
            <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
              {CurrentStepComponent && <CurrentStepComponent />}
            </div>

            {/* Navigation */}
            <StepNavigation />
          </div>
        </div>
      </div>
    </div>
  );
}

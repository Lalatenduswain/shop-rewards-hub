'use client';

import { useWizardStore } from '@/store/wizardStore';

export function StepNavigation() {
  const currentStep = useWizardStore((state) => state.currentStep);
  const previousStep = useWizardStore((state) => state.previousStep);
  const nextStep = useWizardStore((state) => state.nextStep);
  const isLoading = useWizardStore((state) => state.isLoading);

  return (
    <div className="mt-8 flex justify-between items-center">
      <button
        onClick={previousStep}
        disabled={currentStep === 1 || isLoading}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
      >
        ← Previous
      </button>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Step {currentStep} of 12
      </div>

      <button
        onClick={nextStep}
        disabled={currentStep === 12 || isLoading}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        {currentStep === 12 ? 'Complete Setup' : 'Next →'}
      </button>
    </div>
  );
}

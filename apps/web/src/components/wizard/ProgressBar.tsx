'use client';

import { useWizardCompletion } from '@/store/wizardStore';

export function ProgressBar() {
  const { progress, completedSteps, remainingSteps } = useWizardCompletion();

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {completedSteps.length} of 12 steps completed
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {progress}% Complete
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{remainingSteps} steps remaining</span>
          <span>Keep going! 💪</span>
        </div>
      </div>
    </div>
  );
}

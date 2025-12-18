'use client';

import { useWizardCompletion } from '@/store/wizardStore';
import { useEffect, useState } from 'react';

export function ProgressBar() {
  const { progress, completedSteps, remainingSteps } = useWizardCompletion();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent hydration mismatch by only showing actual progress after client-side mount
  const displayProgress = isClient ? progress : 0;
  const displayCompleted = isClient ? completedSteps.length : 0;
  const displayRemaining = isClient ? remainingSteps : 12;

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {displayCompleted} of 12 steps completed
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {displayProgress}% Complete
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${displayProgress}%` }}
          />
        </div>

        <div className="mt-4 flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{displayRemaining} steps remaining</span>
          <span>Keep going! 💪</span>
        </div>
      </div>
    </div>
  );
}

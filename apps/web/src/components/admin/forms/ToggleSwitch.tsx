'use client';

/**
 * ToggleSwitch Component
 *
 * A reusable accessible toggle switch component.
 * Features:
 * - Smooth animation
 * - Label with optional description
 * - Enabled/disabled states
 * - Full dark mode support
 * - Accessible with ARIA labels
 * - Keyboard navigation (Space/Enter to toggle)
 *
 * Used in: CustomizationForm (feature toggles like showTestimonials, showStats, etc.)
 */

import { Check, X } from 'lucide-react';

interface ToggleSwitchProps {
  /** Toggle label text */
  label: string;
  /** Optional description text */
  description?: string;
  /** Current state (on/off) */
  checked: boolean;
  /** Callback when toggle changes */
  onChange: (checked: boolean) => void;
  /** Optional className for wrapper */
  className?: string;
  /** Disable the toggle */
  disabled?: boolean;
  /** Show checkmark/X icons inside toggle */
  showIcons?: boolean;
}

export default function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
  className = '',
  disabled = false,
  showIcons = false,
}: ToggleSwitchProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`flex items-start gap-4 ${className}`}>
      {/* Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`relative inline-flex h-7 w-14 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
          checked
            ? 'bg-blue-600 dark:bg-blue-500'
            : 'bg-gray-300 dark:bg-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {/* Sliding Knob */}
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out flex items-center justify-center ${
            checked ? 'translate-x-7' : 'translate-x-0'
          }`}
        >
          {/* Optional Icons */}
          {showIcons && (
            <>
              {checked ? (
                <Check className="h-3 w-3 text-blue-600 dark:text-blue-500" />
              ) : (
                <X className="h-3 w-3 text-gray-400 dark:text-gray-500" />
              )}
            </>
          )}
        </span>
      </button>

      {/* Label and Description */}
      <div className="flex-1">
        <label
          htmlFor={`toggle-${label}`}
          className={`block text-sm font-medium text-gray-900 dark:text-white ${
            disabled ? 'opacity-50' : 'cursor-pointer'
          }`}
          onClick={handleToggle}
        >
          {label}
        </label>
        {description && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

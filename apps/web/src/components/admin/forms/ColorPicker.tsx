'use client';

/**
 * ColorPicker Component
 *
 * A reusable color picker with synced hex input and native color selector.
 * Features:
 * - Native HTML5 color picker
 * - Hex code text input (synced)
 * - Color swatch preview
 * - Optional "Reset to default" button
 * - Label and error message support
 * - Full dark mode support
 * - Accessible with ARIA labels
 *
 * Used in: CustomizationForm (login template colors)
 */

import { useState, useEffect } from 'react';
import { Palette, RotateCcw } from 'lucide-react';

interface ColorPickerProps {
  /** Input label text */
  label: string;
  /** Current color value (hex format: #RRGGBB) */
  value: string;
  /** Callback when color changes */
  onChange: (color: string) => void;
  /** Optional default color for reset button */
  defaultValue?: string;
  /** Optional error message */
  error?: string;
  /** Optional helper text */
  helperText?: string;
  /** Optional className for wrapper */
  className?: string;
  /** Disable the input */
  disabled?: boolean;
  /** Required field indicator */
  required?: boolean;
}

export default function ColorPicker({
  label,
  value,
  onChange,
  defaultValue,
  error,
  helperText,
  className = '',
  disabled = false,
  required = false,
}: ColorPickerProps) {
  const [hexValue, setHexValue] = useState(value);
  const [isValidHex, setIsValidHex] = useState(true);

  // Sync hex value when prop changes
  useEffect(() => {
    setHexValue(value);
    validateHex(value);
  }, [value]);

  /**
   * Validates hex color format (#RRGGBB)
   */
  const validateHex = (hex: string): boolean => {
    const isValid = /^#[0-9A-Fa-f]{6}$/.test(hex);
    setIsValidHex(isValid);
    return isValid;
  };

  /**
   * Handle hex text input changes
   */
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Auto-add # prefix
    if (!newValue.startsWith('#')) {
      newValue = '#' + newValue;
    }

    // Convert to uppercase for consistency
    newValue = newValue.toUpperCase();

    // Limit to 7 characters (#RRGGBB)
    newValue = newValue.slice(0, 7);

    setHexValue(newValue);

    // Only propagate valid hex codes
    if (validateHex(newValue)) {
      onChange(newValue);
    }
  };

  /**
   * Handle native color picker changes
   */
  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setHexValue(newValue);
    onChange(newValue);
    validateHex(newValue);
  };

  /**
   * Reset to default color
   */
  const handleReset = () => {
    if (defaultValue) {
      setHexValue(defaultValue);
      onChange(defaultValue);
      validateHex(defaultValue);
    }
  };

  return (
    <div className={className}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Color Picker Container */}
      <div className="flex items-center gap-3">
        {/* Color Swatch + Native Picker */}
        <div className="relative">
          <label
            htmlFor={`color-${label}`}
            className="flex items-center justify-center w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors overflow-hidden"
            style={{ backgroundColor: isValidHex ? hexValue : '#CCCCCC' }}
          >
            {/* Native Color Picker (Hidden) */}
            <input
              id={`color-${label}`}
              type="color"
              value={isValidHex ? hexValue : '#CCCCCC'}
              onChange={handleColorPickerChange}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label={`${label} color picker`}
            />

            {/* Palette Icon (visible when color is very light) */}
            <Palette
              className="h-5 w-5 text-gray-600 dark:text-gray-400 opacity-0 hover:opacity-100 transition-opacity"
              style={{
                opacity: disabled ? 0.5 : undefined,
              }}
            />
          </label>
        </div>

        {/* Hex Input */}
        <div className="flex-1">
          <input
            type="text"
            value={hexValue}
            onChange={handleHexChange}
            placeholder="#000000"
            disabled={disabled}
            className={`block w-full h-12 px-4 bg-gray-50 dark:bg-gray-950 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-mono uppercase ${
              error || !isValidHex
                ? 'border-red-300 dark:border-red-800 focus:ring-red-500'
                : 'border-gray-200 dark:border-gray-800 focus:ring-blue-500'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={`${label} hex code`}
            aria-invalid={!isValidHex || !!error}
          />
        </div>

        {/* Reset Button (if default provided) */}
        {defaultValue && !disabled && (
          <button
            type="button"
            onClick={handleReset}
            disabled={hexValue === defaultValue}
            className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reset to default"
            aria-label={`Reset ${label} to default`}
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Helper Text or Error */}
      {(helperText || error || !isValidHex) && (
        <div className="mt-2">
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          {!isValidHex && !error && (
            <p className="text-xs text-red-600 dark:text-red-400">
              Invalid hex color format (use #RRGGBB)
            </p>
          )}
          {!error && isValidHex && helperText && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
}

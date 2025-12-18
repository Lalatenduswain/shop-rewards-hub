'use client';

/**
 * ImageUpload Component
 *
 * A reusable image upload component with drag-and-drop, preview, and Base64 conversion.
 * Features:
 * - Drag-and-drop zone
 * - Click to browse
 * - Image preview with dimensions
 * - File size/type validation (PNG, JPG, SVG, max 1MB)
 * - Convert to Base64 for storage
 * - Remove/replace button
 * - Loading state during conversion
 * - Full dark mode support
 * - Accessible with ARIA labels
 *
 * Used in: CustomizationForm (logo, background image upload)
 */

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';

interface ImageUploadProps {
  /** Input label text */
  label: string;
  /** Current image value (Base64 or URL) */
  value?: string | null;
  /** Callback when image changes (receives Base64 string) */
  onChange: (base64: string | null) => void;
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
  /** Max file size in bytes (default: 1MB) */
  maxSize?: number;
  /** Accepted file types */
  accept?: string;
  /** Optional aspect ratio hint (e.g., "16:9", "1:1") */
  aspectRatioHint?: string;
}

const DEFAULT_MAX_SIZE = 1024 * 1024; // 1MB
const DEFAULT_ACCEPT = 'image/png,image/jpeg,image/jpg,image/svg+xml';

export default function ImageUpload({
  label,
  value,
  onChange,
  error,
  helperText,
  className = '',
  disabled = false,
  required = false,
  maxSize = DEFAULT_MAX_SIZE,
  accept = DEFAULT_ACCEPT,
  aspectRatioHint,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validates file before processing
   */
  const validateFile = (file: File): string | null => {
    // Check file type
    const acceptedTypes = accept.split(',').map(t => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      return `File too large. Max size: ${maxSizeMB}MB`;
    }

    return null;
  };

  /**
   * Converts image file to Base64
   */
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * Gets image dimensions
   */
  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = url;
    });
  };

  /**
   * Processes uploaded file
   */
  const processFile = async (file: File) => {
    setUploadError(null);

    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setIsConverting(true);

    try {
      // Convert to Base64
      const base64 = await convertToBase64(file);

      // Get dimensions
      const dimensions = await getImageDimensions(base64);
      setImageDimensions(dimensions);

      // Update preview and trigger onChange
      setPreviewUrl(base64);
      onChange(base64);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process image');
    } finally {
      setIsConverting(false);
    }
  };

  /**
   * Handle file input change
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  /**
   * Handle drag events
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [disabled]);

  /**
   * Handle remove image
   */
  const handleRemove = () => {
    setPreviewUrl(null);
    setImageDimensions(null);
    setUploadError(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Open file browser
   */
  const handleBrowseClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={className}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {aspectRatioHint && (
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            (Recommended: {aspectRatioHint})
          </span>
        )}
      </label>

      {/* Upload Area or Preview */}
      {previewUrl ? (
        // Preview Card
        <div className="relative group">
          <div className="bg-gray-50 dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-800 rounded-xl p-4 overflow-hidden">
            {/* Preview Image */}
            <div className="flex items-center justify-center mb-3">
              <img
                src={previewUrl}
                alt={label}
                className="max-h-48 max-w-full rounded-lg object-contain"
              />
            </div>

            {/* Image Info */}
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>
                  {imageDimensions
                    ? `${imageDimensions.width} × ${imageDimensions.height}px`
                    : 'Uploaded'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Replace Button (on hover) */}
          {!disabled && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
              <button
                type="button"
                onClick={handleBrowseClick}
                className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Replace Image
              </button>
            </div>
          )}
        </div>
      ) : (
        // Upload Zone
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
              : error || uploadError
              ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10'
              : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`Upload ${label}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBrowseClick();
            }
          }}
        >
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            {isConverting ? (
              <div className="mb-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              </div>
            ) : (
              <div
                className={`mb-4 p-3 rounded-full ${
                  isDragging
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'bg-gray-200 dark:bg-gray-800'
                }`}
              >
                {uploadError || error ? (
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                )}
              </div>
            )}

            {/* Text */}
            {isConverting ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Processing image...
              </p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {isDragging ? 'Drop image here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {accept.includes('svg') ? 'PNG, JPG, or SVG' : 'PNG or JPG'} •{' '}
                  Max {(maxSize / (1024 * 1024)).toFixed(0)}MB
                </p>
              </>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      )}

      {/* Helper Text or Error */}
      {(helperText || error || uploadError) && (
        <div className="mt-2">
          {(error || uploadError) && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {error || uploadError}
            </p>
          )}
          {!error && !uploadError && helperText && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
}

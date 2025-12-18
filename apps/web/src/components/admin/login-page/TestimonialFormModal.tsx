'use client';

/**
 * TestimonialFormModal Component
 *
 * Modal form for adding/editing customer testimonials.
 * Fields:
 * - Name (required, max 100 chars)
 * - Role (required, max 100 chars)
 * - Company (required, max 100 chars)
 * - Quote (required, min 10, max 500 chars)
 * - Rating (1-5 stars selector)
 * - Avatar upload or initials
 * - Order (number, for sorting)
 *
 * Used in: CustomizationForm (testimonials section)
 */

import { useState, useEffect } from 'react';
import { X, Star, Upload } from 'lucide-react';
import ImageUpload from '../forms/ImageUpload';
import type { LoginTemplateTestimonial } from '@shop-rewards/shared';

interface TestimonialFormModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** Callback when testimonial is saved */
  onSave: (testimonial: LoginTemplateTestimonial) => void;
  /** Optional existing testimonial to edit */
  testimonial?: LoginTemplateTestimonial | null;
  /** Optional callback for delete action */
  onDelete?: () => void;
}

export default function TestimonialFormModal({
  isOpen,
  onClose,
  onSave,
  testimonial,
  onDelete,
}: TestimonialFormModalProps) {
  const [formData, setFormData] = useState<Partial<LoginTemplateTestimonial>>({
    id: '',
    name: '',
    role: '',
    company: '',
    quote: '',
    rating: 5,
    avatar: { url: null, initials: '' },
    order: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when modal opens or testimonial changes
  useEffect(() => {
    if (isOpen) {
      if (testimonial) {
        setFormData(testimonial);
      } else {
        // New testimonial - generate ID
        setFormData({
          id: `testimonial-${Date.now()}`,
          name: '',
          role: '',
          company: '',
          quote: '',
          rating: 5,
          avatar: { url: null, initials: '' },
          order: 0,
        });
      }
      setErrors({});
    }
  }, [isOpen, testimonial]);

  // Auto-generate initials from name
  useEffect(() => {
    if (formData.name && !formData.avatar?.url) {
      const initials = formData.name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      setFormData((prev) => ({
        ...prev,
        avatar: { ...prev.avatar, initials, url: prev.avatar?.url || null },
      }));
    }
  }, [formData.name]);

  /**
   * Validates form
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (!formData.role || formData.role.trim().length === 0) {
      newErrors.role = 'Role is required';
    } else if (formData.role.length > 100) {
      newErrors.role = 'Role must be less than 100 characters';
    }

    if (!formData.company || formData.company.trim().length === 0) {
      newErrors.company = 'Company is required';
    } else if (formData.company.length > 100) {
      newErrors.company = 'Company must be less than 100 characters';
    }

    if (!formData.quote || formData.quote.trim().length === 0) {
      newErrors.quote = 'Quote is required';
    } else if (formData.quote.length < 10) {
      newErrors.quote = 'Quote must be at least 10 characters';
    } else if (formData.quote.length > 500) {
      newErrors.quote = 'Quote must be less than 500 characters';
    }

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submit
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSave(formData as LoginTemplateTestimonial);
      onClose();
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this testimonial?')) {
      onDelete();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {testimonial ? 'Edit Testimonial' : 'Add Testimonial'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-gray-500">({formData.name?.length || 0}/100)</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value.slice(0, 100) })
                }
                maxLength={100}
                placeholder="Sarah Chen"
                className={`block w-full h-12 px-4 bg-gray-50 dark:bg-gray-950 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.name
                    ? 'border-red-300 dark:border-red-800 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-800 focus:ring-blue-500'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-gray-500">({formData.role?.length || 0}/100)</span>
              </label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value.slice(0, 100) })
                }
                maxLength={100}
                placeholder="Operations Director"
                className={`block w-full h-12 px-4 bg-gray-50 dark:bg-gray-950 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.role
                    ? 'border-red-300 dark:border-red-800 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-800 focus:ring-blue-500'
                }`}
              />
              {errors.role && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.role}</p>
              )}
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-gray-500">({formData.company?.length || 0}/100)</span>
              </label>
              <input
                type="text"
                value={formData.company || ''}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value.slice(0, 100) })
                }
                maxLength={100}
                placeholder="TechMart Retail"
                className={`block w-full h-12 px-4 bg-gray-50 dark:bg-gray-950 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.company
                    ? 'border-red-300 dark:border-red-800 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-800 focus:ring-blue-500'
                }`}
              />
              {errors.company && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.company}</p>
              )}
            </div>

            {/* Quote */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quote <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-gray-500">({formData.quote?.length || 0}/500)</span>
              </label>
              <textarea
                value={formData.quote || ''}
                onChange={(e) =>
                  setFormData({ ...formData, quote: e.target.value.slice(0, 500) })
                }
                maxLength={500}
                rows={4}
                placeholder="ShopRewards transformed how we engage with customers..."
                className={`block w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none ${
                  errors.quote
                    ? 'border-red-300 dark:border-red-800 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-800 focus:ring-blue-500'
                }`}
              />
              {errors.quote && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.quote}</p>
              )}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (formData.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {formData.rating || 0}/5
                </span>
              </div>
            </div>

            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Avatar (Optional)
              </label>
              <div className="flex items-start gap-4">
                {/* Avatar Preview */}
                <div className="flex-shrink-0">
                  {formData.avatar?.url ? (
                    <img
                      src={formData.avatar.url}
                      alt={formData.name || 'Avatar'}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold border-2 border-gray-200 dark:border-gray-700">
                      {formData.avatar?.initials || '??'}
                    </div>
                  )}
                </div>

                {/* Upload */}
                <div className="flex-1">
                  <ImageUpload
                    label=""
                    value={formData.avatar?.url}
                    onChange={(url) =>
                      setFormData({
                        ...formData,
                        avatar: { ...formData.avatar!, url },
                      })
                    }
                    helperText="Upload a photo or use auto-generated initials"
                    aspectRatioHint="1:1"
                    maxSize={512 * 1024} // 512KB for avatars
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            {testimonial && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Delete Testimonial
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {testimonial ? 'Save Changes' : 'Add Testimonial'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

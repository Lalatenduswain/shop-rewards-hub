'use client';

/**
 * CustomizationForm Component
 *
 * Comprehensive form for customizing login template.
 * Sections:
 * 1. Colors (primary, secondary, accent)
 * 2. Branding (logo, background image)
 * 3. Text Content (taglines, button text, footer)
 * 4. Testimonials (add/edit/remove)
 * 5. Features (toggles for showTestimonials, showStats, etc.)
 *
 * Used in: Admin Login Page (/admin/settings/login-page)
 */

import { useState } from 'react';
import ColorPicker from '../forms/ColorPicker';
import ImageUpload from '../forms/ImageUpload';
import ToggleSwitch from '../forms/ToggleSwitch';
import { Plus, Trash2, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import type { LoginTemplateConfig, UpdateLoginTemplate } from '@shop-rewards/shared';

interface CustomizationFormProps {
  /** Current configuration values */
  config: Partial<UpdateLoginTemplate>;
  /** Callback when config changes */
  onChange: (config: Partial<UpdateLoginTemplate>) => void;
  /** Optional className for wrapper */
  className?: string;
  /** Validation errors */
  errors?: Record<string, string>;
}

type Section = 'colors' | 'branding' | 'text' | 'testimonials' | 'features';

export default function CustomizationForm({
  config,
  onChange,
  className = '',
  errors = {},
}: CustomizationFormProps) {
  const [expandedSections, setExpandedSections] = useState<Section[]>(['colors', 'text']);

  const toggleSection = (section: Section) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const isSectionExpanded = (section: Section) => expandedSections.includes(section);

  // Helper to update nested config
  const updateConfig = (updates: Partial<UpdateLoginTemplate>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Customize Template
      </h3>

      {/* Colors Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('colors')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg" />
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Colors
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Customize primary, secondary, and accent colors
              </p>
            </div>
          </div>
          {isSectionExpanded('colors') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {isSectionExpanded('colors') && (
          <div className="p-4 pt-0 space-y-4 border-t border-gray-100 dark:border-gray-700">
            <ColorPicker
              label="Primary Color"
              value={config.colors?.primary || '#3b82f6'}
              onChange={(primary) =>
                updateConfig({
                  colors: { ...config.colors, primary },
                })
              }
              defaultValue="#3b82f6"
              helperText="Used for buttons, links, and primary accents"
              error={errors['colors.primary']}
            />

            <ColorPicker
              label="Secondary Color"
              value={config.colors?.secondary || '#1e40af'}
              onChange={(secondary) =>
                updateConfig({
                  colors: { ...config.colors, secondary },
                })
              }
              defaultValue="#1e40af"
              helperText="Used for backgrounds and secondary elements"
              error={errors['colors.secondary']}
            />

            <ColorPicker
              label="Accent Color"
              value={config.colors?.accent || '#60a5fa'}
              onChange={(accent) =>
                updateConfig({
                  colors: { ...config.colors, accent },
                })
              }
              defaultValue="#60a5fa"
              helperText="Used for highlights and call-to-actions"
              error={errors['colors.accent']}
            />
          </div>
        )}
      </div>

      {/* Branding Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('branding')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Branding
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Upload logo and background images
              </p>
            </div>
          </div>
          {isSectionExpanded('branding') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {isSectionExpanded('branding') && (
          <div className="p-4 pt-0 space-y-4 border-t border-gray-100 dark:border-gray-700">
            <ImageUpload
              label="Logo"
              value={config.logo?.url}
              onChange={(url) =>
                updateConfig({
                  logo: { type: url ? 'url' : 'default', url },
                })
              }
              helperText="Recommended: 200x60px, PNG or SVG with transparent background"
              aspectRatioHint="3:1"
              error={errors['logo.url']}
            />

            <ImageUpload
              label="Background Image (Optional)"
              value={config.backgroundImage?.url}
              onChange={(url) =>
                updateConfig({
                  backgroundImage: {
                    type: url ? 'url' : 'gradient',
                    url,
                  },
                })
              }
              helperText="Recommended: 1920x1080px, high-quality image"
              aspectRatioHint="16:9"
              error={errors['backgroundImage.url']}
            />
          </div>
        )}
      </div>

      {/* Text Content Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('text')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Text Content
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Customize taglines, button text, and footer
              </p>
            </div>
          </div>
          {isSectionExpanded('text') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {isSectionExpanded('text') && (
          <div className="p-4 pt-0 space-y-4 border-t border-gray-100 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tagline
                <span className="ml-2 text-xs text-gray-500">({config.text?.tagline?.length || 0}/100)</span>
              </label>
              <input
                type="text"
                value={config.text?.tagline || ''}
                onChange={(e) =>
                  updateConfig({
                    text: { ...config.text, tagline: e.target.value.slice(0, 100) },
                  })
                }
                maxLength={100}
                placeholder="Your Rewards, Simplified"
                className="block w-full h-12 px-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors['text.tagline'] && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors['text.tagline']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sub-Tagline (Optional)
                <span className="ml-2 text-xs text-gray-500">({config.text?.subTagline?.length || 0}/200)</span>
              </label>
              <textarea
                value={config.text?.subTagline || ''}
                onChange={(e) =>
                  updateConfig({
                    text: { ...config.text, subTagline: e.target.value.slice(0, 200) },
                  })
                }
                maxLength={200}
                rows={2}
                placeholder="Manage customer loyalty programs with ease"
                className="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Login Button Text
              </label>
              <input
                type="text"
                value={config.text?.loginButton || ''}
                onChange={(e) =>
                  updateConfig({
                    text: { ...config.text, loginButton: e.target.value.slice(0, 30) },
                  })
                }
                maxLength={30}
                placeholder="Sign In"
                className="block w-full h-12 px-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Footer Text
              </label>
              <input
                type="text"
                value={config.text?.footer || ''}
                onChange={(e) =>
                  updateConfig({
                    text: { ...config.text, footer: e.target.value.slice(0, 150) },
                  })
                }
                maxLength={150}
                placeholder="© 2025 ShopRewards Hub. All rights reserved."
                className="block w-full h-12 px-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('features')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Features
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Toggle features on/off
              </p>
            </div>
          </div>
          {isSectionExpanded('features') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {isSectionExpanded('features') && (
          <div className="p-4 pt-0 space-y-4 border-t border-gray-100 dark:border-gray-700">
            <ToggleSwitch
              label="Show Testimonials"
              description="Display customer testimonials on the login page"
              checked={config.features?.showTestimonials ?? true}
              onChange={(checked) =>
                updateConfig({
                  features: { ...config.features, showTestimonials: checked },
                })
              }
              showIcons
            />

            <ToggleSwitch
              label="Show Stats"
              description="Display statistics (shops, customers, engagement)"
              checked={config.features?.showStats ?? true}
              onChange={(checked) =>
                updateConfig({
                  features: { ...config.features, showStats: checked },
                })
              }
              showIcons
            />

            <ToggleSwitch
              label="Enable Demo Account"
              description="Show quick login button for demo account"
              checked={config.features?.showDemoAccount ?? true}
              onChange={(checked) =>
                updateConfig({
                  features: { ...config.features, showDemoAccount: checked },
                })
              }
              showIcons
            />
          </div>
        )}
      </div>
    </div>
  );
}

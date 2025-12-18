'use client';

/**
 * TemplateSelector Component
 *
 * Grid of 5 template cards for selecting login page template.
 * Features:
 * - Thumbnail preview for each template
 * - Template name and description
 * - "Current" badge on active template
 * - Click to select
 * - Hover effect with zoom
 * - Responsive grid
 *
 * Used in: Admin Login Page Customization (/admin/settings/login-page)
 */

import { Check, Briefcase, Minimize2, Zap, Building2, Sparkles } from 'lucide-react';
import type { LoginTemplateConfig } from '@shop-rewards/shared';

interface TemplateSelectorProps {
  /** Current template type */
  currentTemplate: LoginTemplateConfig['templateType'];
  /** Callback when template is selected */
  onSelect: (templateType: LoginTemplateConfig['templateType']) => void;
  /** Optional className for wrapper */
  className?: string;
}

// Template metadata
const TEMPLATES = [
  {
    type: 'professional' as const,
    name: 'Professional',
    description: 'Two-column layout with stats and testimonials. Perfect for SaaS platforms.',
    icon: Briefcase,
    color: '#3b82f6',
    features: ['Stats grid', 'Testimonials', 'Animated elements'],
  },
  {
    type: 'minimal' as const,
    name: 'Minimal',
    description: 'Clean, centered form with minimal distractions. Ideal for internal tools.',
    icon: Minimize2,
    color: '#64748b',
    features: ['Ultra-clean', 'Focused', 'Fast loading'],
  },
  {
    type: 'modern' as const,
    name: 'Modern',
    description: 'Glassmorphism with vibrant gradients. Great for consumer apps.',
    icon: Zap,
    color: '#8b5cf6',
    features: ['Glassmorphic card', 'Gradient backgrounds', 'Floating animations'],
  },
  {
    type: 'corporate' as const,
    name: 'Corporate',
    description: 'Formal 50/50 split with trust indicators. Best for enterprise.',
    icon: Building2,
    color: '#1f2937',
    features: ['Security badges', 'Professional styling', 'Trust-focused'],
  },
  {
    type: 'creative' as const,
    name: 'Creative',
    description: 'Asymmetric layout with bold typography. Perfect for agencies and brands.',
    icon: Sparkles,
    color: '#ec4899',
    features: ['Bold design', 'Artistic elements', 'Brand-forward'],
  },
];

export default function TemplateSelector({
  currentTemplate,
  onSelect,
  className = '',
}: TemplateSelectorProps) {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Select Template
      </h3>

      {/* Template Grid */}
      <div className="grid grid-cols-1 gap-4">
        {TEMPLATES.map((template) => {
          const isActive = currentTemplate === template.type;
          const Icon = template.icon;

          return (
            <button
              key={template.type}
              type="button"
              onClick={() => onSelect(template.type)}
              className={`relative group text-left bg-white dark:bg-gray-800 border-2 rounded-xl p-4 transition-all hover:shadow-lg hover:scale-[1.02] ${
                isActive
                  ? 'border-blue-500 dark:border-blue-400 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-blue-500 dark:bg-blue-600 text-white text-xs font-semibold rounded-full">
                  <Check className="h-3 w-3" />
                  <span>Current</span>
                </div>
              )}

              {/* Template Icon */}
              <div className="flex items-start gap-4 mb-3">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${template.color}15` }}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{ color: template.color }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Template Name */}
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {template.name}
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {template.features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded-md"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Hover Effect Border */}
              <div
                className={`absolute inset-0 rounded-xl transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                style={{
                  boxShadow: `0 0 0 2px ${template.color}30`,
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Helper Text */}
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Select a template to customize its colors, images, and content. Changes will appear in the live preview.
      </p>
    </div>
  );
}

'use client';

/**
 * Template Renderer
 *
 * Dynamic template selector that renders the correct login template
 * based on configuration.
 *
 * Used by:
 * - Login page (main template rendering)
 * - Admin preview panel (live preview of changes)
 *
 * Supports all 5 template types:
 * - professional: Two-column with stats and testimonials
 * - minimal: Clean, centered form
 * - modern: Glassmorphism with vibrant gradients
 * - corporate: Formal enterprise look
 * - creative: Artistic, brand-forward design
 */

import type { LoginTemplateConfig } from '@shop-rewards/shared';
import ProfessionalTemplate from './ProfessionalTemplate';
import MinimalTemplate from './MinimalTemplate';
import ModernTemplate from './ModernTemplate';
import CorporateTemplate from './CorporateTemplate';
import CreativeTemplate from './CreativeTemplate';

interface TemplateRendererProps {
  /** Complete template configuration */
  config: LoginTemplateConfig;
  /** Optional className for wrapper */
  className?: string;
}

export default function TemplateRenderer({ config, className = '' }: TemplateRendererProps) {
  // Render appropriate template based on templateType
  switch (config.templateType) {
    case 'professional':
      return (
        <div className={className}>
          <ProfessionalTemplate config={config} />
        </div>
      );

    case 'minimal':
      return (
        <div className={className}>
          <MinimalTemplate config={config} />
        </div>
      );

    case 'modern':
      return (
        <div className={className}>
          <ModernTemplate config={config} />
        </div>
      );

    case 'corporate':
      return (
        <div className={className}>
          <CorporateTemplate config={config} />
        </div>
      );

    case 'creative':
      return (
        <div className={className}>
          <CreativeTemplate config={config} />
        </div>
      );

    default:
      // Fallback to professional template for unknown types
      console.warn(`Unknown template type: ${config.templateType}, falling back to professional`);
      return (
        <div className={className}>
          <ProfessionalTemplate config={config} />
        </div>
      );
  }
}

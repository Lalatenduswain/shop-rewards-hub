'use client';

/**
 * LogoHeader Base Component
 *
 * Displays logo and tagline for login templates.
 * Supports custom logo URL or falls back to default icon.
 *
 * Features:
 * - Logo image support (URL or Base64)
 * - Default icon fallback
 * - Animated entrance
 * - Responsive sizing
 */

import { Gift } from 'lucide-react';
import type { LoginTemplateLogo } from '@shop-rewards/shared';

interface LogoHeaderProps {
  /** Logo configuration */
  logo: LoginTemplateLogo;
  /** Primary tagline */
  tagline: string;
  /** Optional sub-tagline */
  subTagline?: string;
  /** Primary brand color */
  primaryColor: string;
  /** Optional CSS classes */
  className?: string;
}

export default function LogoHeader({
  logo,
  tagline,
  subTagline,
  primaryColor,
  className = '',
}: LogoHeaderProps) {
  return (
    <div className={className}>
      {/* Logo */}
      <div
        className="flex items-center gap-3 mb-8"
        style={{ animation: 'fade-in 0.8s ease-out 0.4s forwards', opacity: 0 }}
      >
        {logo.url && logo.type === 'url' ? (
          // Custom logo image
          <img
            src={logo.url}
            alt="Logo"
            className="h-12 w-auto object-contain"
          />
        ) : (
          // Default icon with brand name
          <>
            <div
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2.5 rounded-xl shadow-lg border"
              style={{ borderColor: `${primaryColor}40` }}
            >
              <Gift className="h-7 w-7" style={{ color: primaryColor }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                ShopRewards
              </h1>
              <p className="text-sm font-medium" style={{ color: primaryColor }}>
                Hub
              </p>
            </div>
          </>
        )}
      </div>

      {/* Tagline */}
      <div className="mb-8">
        <h2
          className="text-4xl font-bold text-slate-800 dark:text-white mb-4 leading-tight"
          style={{
            animation: 'fade-slide-up 0.8s ease-out 1s forwards',
            opacity: 0,
          }}
        >
          {tagline}
        </h2>
        {subTagline && (
          <p
            className="text-slate-600 dark:text-slate-400 text-lg max-w-md"
            style={{ animation: 'fade-slide-up 0.6s ease-out 1.2s forwards', opacity: 0 }}
          >
            {subTagline}
          </p>
        )}
      </div>
    </div>
  );
}

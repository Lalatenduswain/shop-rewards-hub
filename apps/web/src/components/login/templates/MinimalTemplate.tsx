'use client';

/**
 * Minimal Login Template
 *
 * Clean, centered form with minimal distractions.
 * Features: Simple logo, clean typography, focus on form.
 * Best for: Internal tools, developer platforms, admin portals.
 */

import type { LoginTemplateConfig } from '@shop-rewards/shared';
import LoginForm from '../base/LoginForm';

interface MinimalTemplateProps {
  config: LoginTemplateConfig;
}

export default function MinimalTemplate({ config }: MinimalTemplateProps) {
  const { colors, logo, text, features } = config;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          {logo.url && logo.type === 'url' ? (
            <img
              src={logo.url}
              alt="Logo"
              className="h-16 w-auto mx-auto mb-6"
            />
          ) : (
            <div className="mb-6">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: colors.primary }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {text.tagline}
          </h1>
          {text.subTagline && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {text.subTagline}
            </p>
          )}
        </div>

        {/* Login Form */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
          <LoginForm
            text={text}
            primaryColor={colors.primary}
            showDemoAccount={features.showDemoAccount}
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {text.footer}
          </p>
        </div>
      </div>
    </div>
  );
}

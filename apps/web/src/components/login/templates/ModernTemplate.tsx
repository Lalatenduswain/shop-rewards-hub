'use client';

/**
 * Modern Login Template
 *
 * Full-screen with glassmorphism and vibrant gradients.
 * Features: Blurred background, frosted glass card, bold colors.
 * Best for: Consumer apps, creative industries, startups.
 */

import type { LoginTemplateConfig } from '@shop-rewards/shared';
import LoginForm from '../base/LoginForm';
import AnimatedBackground from '../base/AnimatedBackground';

interface ModernTemplateProps {
  config: LoginTemplateConfig;
}

export default function ModernTemplate({ config }: ModernTemplateProps) {
  const { colors, logo, backgroundImage, text, features } = config;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Vibrant Animated Background */}
      <AnimatedBackground
        background={backgroundImage}
        colors={colors}
        showParticles={true}
        particleCount={30}
      />

      {/* Additional Gradient Overlay for Modern Look */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(circle at 20% 50%, ${colors.primary}40 0%, transparent 50%),
                       radial-gradient(circle at 80% 80%, ${colors.accent}40 0%, transparent 50%)`,
        }}
      />

      {/* Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            {logo.url && logo.type === 'url' ? (
              <img
                src={logo.url}
                alt="Logo"
                className="h-20 w-auto mx-auto mb-6"
              />
            ) : (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm mb-6 border border-white/30">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
            )}

            <h1 className="text-4xl font-bold text-white mb-3">
              {text.tagline}
            </h1>
            {text.subTagline && (
              <p className="text-white/80 text-lg">
                {text.subTagline}
              </p>
            )}
          </div>

          {/* Login Form with Modern Styling */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6">
            <LoginForm
              text={text}
              primaryColor={colors.primary}
              showDemoAccount={features.showDemoAccount}
            />
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-white/60">
              {text.footer}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Orbs for Extra Visual Interest */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20 animate-pulse" style={{ backgroundColor: colors.accent }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse" style={{ backgroundColor: colors.primary, animationDelay: '2s' }} />
    </div>
  );
}

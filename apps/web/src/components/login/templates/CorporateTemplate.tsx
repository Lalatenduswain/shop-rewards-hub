'use client';

/**
 * Corporate Login Template
 *
 * Formal 50/50 split layout with trust indicators.
 * Features: Security badges, professional styling, trust-focused.
 * Best for: Financial services, healthcare, enterprise applications.
 */

import type { LoginTemplateConfig } from '@shop-rewards/shared';
import LoginForm from '../base/LoginForm';
import TestimonialCard from '../base/TestimonialCard';
import { Shield, Lock, Award, CheckCircle } from 'lucide-react';

interface CorporateTemplateProps {
  config: LoginTemplateConfig;
}

export default function CorporateTemplate({ config }: CorporateTemplateProps) {
  const { colors, logo, text, features, testimonials } = config;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Professional Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 dark:bg-black">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo & Tagline */}
          <div>
            {logo.url && logo.type === 'url' ? (
              <img
                src={logo.url}
                alt="Logo"
                className="h-12 w-auto mb-8"
              />
            ) : (
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Enterprise</h1>
                  <p className="text-white/60 text-sm">Secure Platform</p>
                </div>
              </div>
            )}

            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              {text.tagline}
            </h2>
            {text.subTagline && (
              <p className="text-white/80 text-lg mb-12 max-w-md">
                {text.subTagline}
              </p>
            )}

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-4 mb-12 max-w-md">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Lock className="h-6 w-6 text-white/80 mb-2" />
                <p className="text-white font-semibold text-sm">Bank-Level</p>
                <p className="text-white/60 text-xs">Security</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Shield className="h-6 w-6 text-white/80 mb-2" />
                <p className="text-white font-semibold text-sm">ISO 27001</p>
                <p className="text-white/60 text-xs">Certified</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Award className="h-6 w-6 text-white/80 mb-2" />
                <p className="text-white font-semibold text-sm">SOC 2</p>
                <p className="text-white/60 text-xs">Compliant</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <CheckCircle className="h-6 w-6 text-white/80 mb-2" />
                <p className="text-white font-semibold text-sm">99.9%</p>
                <p className="text-white/60 text-xs">Uptime SLA</p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          {features.showTestimonials && testimonials && testimonials.length > 0 && (
            <div className="max-w-md">
              <TestimonialCard
                testimonial={testimonials[0]}
                animationDelay={1.5}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Security Notice */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Secure Connection
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Your credentials are encrypted with 256-bit SSL
                </p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Form Content */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Sign In
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Access your secure account
              </p>

              <LoginForm
                text={text}
                primaryColor={colors.primary}
                showDemoAccount={features.showDemoAccount}
              />
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                {text.footer}
              </p>
            </div>
          </div>

          {/* Support Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need help? <a href="#" className="font-medium" style={{ color: colors.primary }}>Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * Creative Login Template
 *
 * Asymmetric layout with bold branding and artistic elements.
 * Features: Unique positioning, bold typography, brand-forward design.
 * Best for: Agencies, retail brands, fashion, creative industries.
 */

import type { LoginTemplateConfig } from '@shop-rewards/shared';
import LoginForm from '../base/LoginForm';
import TestimonialCard from '../base/TestimonialCard';
import { Sparkles } from 'lucide-react';

interface CreativeTemplateProps {
  config: LoginTemplateConfig;
}

export default function CreativeTemplate({ config }: CreativeTemplateProps) {
  const { colors, logo, backgroundImage, text, features, testimonials } = config;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      {/* Dynamic Background with Bold Colors */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 50%, ${colors.secondary} 100%)`,
        }}
      />

      {/* Decorative Shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />

      {/* Geometric Patterns */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 border-4 border-white/20 rotate-45" />
      <div className="absolute bottom-1/3 right-1/3 w-24 h-24 border-4 border-white/10 rounded-full" />

      {/* Left Side - Creative Branding (Asymmetric) */}
      <div className="relative z-10 lg:w-[45%] p-8 lg:p-12 flex flex-col justify-center">
        {/* Logo */}
        <div className="mb-12">
          {logo.url && logo.type === 'url' ? (
            <img
              src={logo.url}
              alt="Logo"
              className="h-16 w-auto"
            />
          ) : (
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">CREATIVE</h1>
                <p className="text-white/80 text-lg font-light tracking-widest">STUDIO</p>
              </div>
            </div>
          )}
        </div>

        {/* Bold Typography */}
        <div className="mb-12 max-w-lg">
          <h2 className="text-6xl lg:text-7xl font-black text-white leading-none mb-6">
            {text.tagline.split(' ').map((word, i) => (
              <span
                key={i}
                className="block"
                style={{
                  animation: `fade-slide-up 0.6s ease-out ${i * 0.1}s forwards`,
                  opacity: 0,
                }}
              >
                {word}
              </span>
            ))}
          </h2>
          {text.subTagline && (
            <p className="text-white/90 text-xl font-light leading-relaxed">
              {text.subTagline}
            </p>
          )}
        </div>

        {/* Testimonial (if enabled) */}
        {features.showTestimonials && testimonials && testimonials.length > 0 && (
          <div className="max-w-md hidden lg:block">
            <TestimonialCard
              testimonial={testimonials[0]}
              animationDelay={1.2}
            />
          </div>
        )}
      </div>

      {/* Right Side - Login Form (Offset) */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md lg:transform lg:-translate-y-12">
          {/* Form Card with Creative Styling */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
            {/* Colorful Top Border */}
            <div
              className="h-3"
              style={{
                background: `linear-gradient(90deg, ${colors.accent} 0%, ${colors.primary} 50%, ${colors.secondary} 100%)`,
              }}
            />

            {/* Form Content */}
            <div className="p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="h-12 w-1 rounded-full"
                  style={{ backgroundColor: colors.primary }}
                />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Let's get you signed in
                  </p>
                </div>
              </div>

              <LoginForm
                text={text}
                primaryColor={colors.primary}
                showDemoAccount={features.showDemoAccount}
              />
            </div>

            {/* Footer with Creative Touch */}
            <div
              className="px-8 lg:px-10 py-5"
              style={{ backgroundColor: `${colors.primary}10` }}
            >
              <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                {text.footer}
              </p>
            </div>
          </div>

          {/* Floating Accent Element */}
          <div
            className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-20 blur-2xl"
            style={{ backgroundColor: colors.accent }}
          />
        </div>
      </div>

      {/* Global Animation Styles */}
      <style jsx global>{`
        @keyframes fade-slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

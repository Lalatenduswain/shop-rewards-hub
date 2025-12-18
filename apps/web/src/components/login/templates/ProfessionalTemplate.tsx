'use client';

/**
 * Professional Login Template
 *
 * Two-column layout with branding sidebar and login form.
 * Features: Stats grid, testimonials, animated background, modern design.
 * Best for: SaaS platforms, B2B applications, professional services.
 */

import type { LoginTemplateConfig } from '@shop-rewards/shared';
import LoginForm from '../base/LoginForm';
import StatsGrid from '../base/StatsGrid';
import TestimonialCard from '../base/TestimonialCard';
import LogoHeader from '../base/LogoHeader';
import AnimatedBackground from '../base/AnimatedBackground';

interface ProfessionalTemplateProps {
  config: LoginTemplateConfig;
}

export default function ProfessionalTemplate({ config }: ProfessionalTemplateProps) {
  const { colors, logo, backgroundImage, text, features, stats, testimonials } = config;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Premium Branding */}
      <div className="hidden lg:flex lg:w-[35%] xl:w-[40%] 2xl:w-1/2 relative overflow-hidden">
        {/* Animated Background */}
        <AnimatedBackground
          background={backgroundImage}
          colors={colors}
          showParticles={true}
          particleCount={20}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo & Tagline */}
          <LogoHeader
            logo={logo}
            tagline={text.tagline}
            subTagline={text.subTagline}
            primaryColor={colors.primary}
          />

          {/* Stats Grid */}
          {features.showStats && stats && stats.length > 0 && (
            <StatsGrid stats={stats} className="max-w-md mb-12" />
          )}

          {/* Testimonial */}
          {features.showTestimonials && testimonials && testimonials.length > 0 && (
            <div className="max-w-md">
              <TestimonialCard
                testimonial={testimonials[0]}
                animationDelay={2}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        {/* Mobile Logo (hidden on lg+) */}
        <div className="absolute top-8 left-8 lg:hidden">
          <LogoHeader
            logo={logo}
            tagline={text.tagline}
            primaryColor={colors.primary}
          />
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Card Header with Gradient */}
            <div
              className="h-2"
              style={{
                background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
              }}
            />

            {/* Form Content */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Sign in to your account to continue
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
        </div>
      </div>

      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

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

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes mesh-move {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -30px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 30px) scale(1.05);
          }
        }

        @keyframes float-up {
          0% {
            transform: translateY(100vh);
            opacity: 0;
          }
          10% {
            opacity: 0.4;
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-100vh);
            opacity: 0;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
      `}</style>
    </div>
  );
}

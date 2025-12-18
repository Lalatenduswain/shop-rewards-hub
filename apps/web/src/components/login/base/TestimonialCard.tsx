'use client';

/**
 * TestimonialCard Base Component
 *
 * Displays customer testimonial with rating, quote, and attribution.
 * Features avatar support with fallback to initials.
 *
 * Used by templates to show social proof and customer success stories.
 */

import { Star } from 'lucide-react';
import type { LoginTemplateTestimonial } from '@shop-rewards/shared';

interface TestimonialCardProps {
  /** Testimonial data */
  testimonial: LoginTemplateTestimonial;
  /** Optional CSS classes */
  className?: string;
  /** Optional animation delay (in seconds) */
  animationDelay?: number;
}

export default function TestimonialCard({
  testimonial,
  className = '',
  animationDelay = 2,
}: TestimonialCardProps) {
  return (
    <div
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/60 dark:border-gray-700/60 shadow-sm ${className}`}
      style={{
        animation: `fade-slide-up 0.8s ease-out ${animationDelay}s forwards`,
        opacity: 0,
      }}
    >
      {/* Star Rating */}
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < testimonial.rating
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="mb-4">
        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          "{testimonial.quote}"
        </p>
      </blockquote>

      {/* Attribution */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {testimonial.avatar.url ? (
            <img
              src={testimonial.avatar.url}
              alt={testimonial.name}
              className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-sm">
              <span className="text-white text-sm font-semibold">
                {testimonial.avatar.initials || testimonial.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Name and Title */}
        <div>
          <p className="font-semibold text-slate-800 dark:text-white text-sm">
            {testimonial.name}
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-xs">
            {testimonial.role}
            {testimonial.company && ` • ${testimonial.company}`}
          </p>
        </div>
      </div>
    </div>
  );
}

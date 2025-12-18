'use client';

/**
 * AnimatedBackground Base Component
 *
 * Provides animated background effects for login templates.
 * Supports gradients, solid colors, and floating particles.
 *
 * Features:
 * - Gradient backgrounds with mesh animations
 * - Solid color backgrounds
 * - Floating particle effects
 * - Customizable colors
 */

import type { LoginTemplateBackground, LoginTemplateColors } from '@shop-rewards/shared';

interface AnimatedBackgroundProps {
  /** Background configuration */
  background: LoginTemplateBackground;
  /** Color scheme for fallbacks */
  colors: LoginTemplateColors;
  /** Whether to show floating particles */
  showParticles?: boolean;
  /** Number of floating particles */
  particleCount?: number;
}

export default function AnimatedBackground({
  background,
  colors,
  showParticles = true,
  particleCount = 20,
}: AnimatedBackgroundProps) {
  // Render background based on type
  const renderBackground = () => {
    if (background.type === 'url' && background.url) {
      // Image background
      return (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${background.url})` }}
        />
      );
    }

    if (background.type === 'gradient' && background.gradient) {
      // Gradient background
      const { from, to, direction } = background.gradient;
      return (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${direction}, ${from} 0%, ${to} 100%)`,
          }}
        />
      );
    }

    // Fallback: soft gradient using color scheme
    return (
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${colors.secondary}20 0%, ${colors.primary}20 100%)`,
        }}
      );
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background Layer */}
      {renderBackground()}

      {/* Animated Mesh Gradient Overlay (only for gradient type) */}
      {background.type === 'gradient' && (
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{
              backgroundColor: colors.accent,
              animation: 'mesh-move 30s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{
              backgroundColor: colors.primary,
              animation: 'mesh-move 30s ease-in-out infinite 10s',
            }}
          />
        </div>
      )}

      {/* Floating Particles */}
      {showParticles && background.type !== 'url' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: particleCount }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: colors.accent,
                left: `${Math.random() * 100}%`,
                animation: `float-up ${20 + Math.random() * 20}s linear infinite`,
                animationDelay: `${Math.random() * 20}s`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>
      )}

      {/* Dark overlay for image backgrounds to ensure text readability */}
      {background.type === 'url' && background.url && (
        <div className="absolute inset-0 bg-black/30" />
      )}
    </div>
  );
}

/**
 * CSS Keyframe Animations (to be added to global styles or parent component)
 *
 * @keyframes mesh-move {
 *   0%, 100% { transform: translate(0, 0) scale(1); }
 *   25% { transform: translate(30px, -30px) scale(1.1); }
 *   50% { transform: translate(-20px, 20px) scale(0.9); }
 *   75% { transform: translate(20px, 30px) scale(1.05); }
 * }
 *
 * @keyframes float-up {
 *   0% {
 *     transform: translateY(100vh);
 *     opacity: 0;
 *   }
 *   10% {
 *     opacity: 0.4;
 *   }
 *   90% {
 *     opacity: 0.4;
 *   }
 *   100% {
 *     transform: translateY(-100vh);
 *     opacity: 0;
 *   }
 * }
 */

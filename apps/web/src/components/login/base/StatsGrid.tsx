'use client';

/**
 * StatsGrid Base Component
 *
 * Displays animated statistics grid with configurable stats.
 * Features animated counters and icon support.
 *
 * Used by templates to show platform metrics (shops, users, engagement, etc.)
 */

import { useEffect, useState } from 'react';
import { Store, Shield, Users, TrendingUp, Star, Gift } from 'lucide-react';
import type { LoginTemplateStat } from '@shop-rewards/shared';

interface StatsGridProps {
  /** Array of stats to display */
  stats?: LoginTemplateStat[];
  /** Optional CSS classes */
  className?: string;
}

/**
 * Icon mapping for stats
 */
const ICON_MAP = {
  Store,
  Shield,
  Users,
  TrendingUp,
  Star,
  Gift,
};

/**
 * Color mapping for stats (Tailwind classes)
 */
const COLOR_MAP = {
  violet: {
    icon: 'text-violet-600',
    border: 'border-violet-200/60',
    bg: 'bg-violet-50',
  },
  rose: {
    icon: 'text-rose-600',
    border: 'border-rose-200/60',
    bg: 'bg-rose-50',
  },
  blue: {
    icon: 'text-blue-600',
    border: 'border-blue-200/60',
    bg: 'bg-blue-50',
  },
  emerald: {
    icon: 'text-emerald-600',
    border: 'border-emerald-200/60',
    bg: 'bg-emerald-50',
  },
  amber: {
    icon: 'text-amber-600',
    border: 'border-amber-200/60',
    bg: 'bg-amber-50',
  },
  indigo: {
    icon: 'text-indigo-600',
    border: 'border-indigo-200/60',
    bg: 'bg-indigo-50',
  },
};

/**
 * Animated Counter Component
 * Animates from 0 to target value with easing
 */
function AnimatedCounter({ end, duration = 1500 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(end * easeOutQuart));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{count.toLocaleString()}</>;
}

export default function StatsGrid({ stats = [], className = '' }: StatsGridProps) {
  if (!stats || stats.length === 0) {
    return null;
  }

  // Sort stats by order
  const sortedStats = [...stats].sort((a, b) => a.order - b.order);

  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      {sortedStats.map((stat, index) => {
        const Icon = ICON_MAP[stat.icon] || Store;
        const colors = COLOR_MAP[stat.color] || COLOR_MAP.violet;

        // Calculate animation delay for staggered entrance
        const animationDelay = 1.4 + index * 0.1;
        const isEven = index % 2 === 0;
        const animationName = isEven ? 'slide-in-left' : 'slide-in-right';

        return (
          <div
            key={stat.id}
            className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border ${colors.border} shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300`}
            style={{
              animation: `${animationName} 0.6s ease-out ${animationDelay}s forwards`,
              opacity: 0,
            }}
          >
            <Icon className={`h-6 w-6 ${colors.icon} mb-2`} />
            <div className="text-2xl font-bold text-slate-800 dark:text-white">
              {typeof stat.value === 'number' ? (
                <>
                  <AnimatedCounter end={stat.value} />
                  {stat.suffix}
                </>
              ) : (
                stat.value
              )}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-sm">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}

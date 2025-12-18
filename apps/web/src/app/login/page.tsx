'use client';

/**
 * Login Page
 *
 * Dynamic login page that fetches and renders the configured template.
 * Supports 5 different templates with full customization.
 *
 * Flow:
 * 1. Check if user is already logged in → redirect to admin
 * 2. Fetch login template configuration from backend
 * 3. Render appropriate template using TemplateRenderer
 * 4. Fall back to default config if fetch fails
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import TemplateRenderer from '@/components/login/templates/TemplateRenderer';
import type { LoginTemplateConfig } from '@shop-rewards/shared';

/**
 * Default fallback configuration
 * Used if API fetch fails or returns no data
 */
const DEFAULT_CONFIG: LoginTemplateConfig = {
  version: '1.0',
  templateType: 'professional',
  colors: {
    primary: '#3b82f6',
    secondary: '#1e40af',
    accent: '#60a5fa',
  },
  logo: {
    url: null,
    type: 'default',
  },
  backgroundImage: {
    url: null,
    type: 'gradient',
    gradient: {
      from: '#1e40af',
      to: '#3b82f6',
      direction: 'to-br',
    },
  },
  text: {
    tagline: 'Retail Rewards Made Simple',
    subTagline: 'Manage customer loyalty programs with ease',
    loginButton: 'Sign In',
    forgotPassword: 'Forgot password?',
    footer: '© 2025 ShopRewards Hub. All rights reserved.',
    demoAccount: {
      enabled: true,
      email: 'admin@shoprewards.local',
      note: 'Quick login with demo credentials for testing',
    },
  },
  features: {
    showTestimonials: true,
    showStats: true,
    showSocialLogin: false,
    showDemoAccount: true,
  },
  stats: [
    {
      id: 'stat1',
      label: 'Active Shops',
      value: 500,
      suffix: '+',
      icon: 'Store',
      color: 'violet',
      order: 0,
    },
    {
      id: 'stat2',
      label: 'Happy Customers',
      value: 50000,
      suffix: '+',
      icon: 'Users',
      color: 'rose',
      order: 1,
    },
    {
      id: 'stat3',
      label: 'Engagement Rate',
      value: 40,
      suffix: '%',
      icon: 'TrendingUp',
      color: 'blue',
      order: 2,
    },
    {
      id: 'stat4',
      label: 'Security',
      value: 100,
      suffix: '%',
      icon: 'Shield',
      color: 'emerald',
      order: 3,
    },
  ],
  testimonials: [
    {
      id: 'default1',
      name: 'Sarah Chen',
      role: 'Operations Director',
      company: 'TechMart Retail',
      quote:
        'ShopRewards transformed how we engage with customers. Redemption rates increased by 40% in just 3 months!',
      rating: 5,
      avatar: {
        url: null,
        initials: 'SC',
      },
      order: 0,
    },
  ],
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
  },
};

export default function LoginPage() {
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      // User already has a token, redirect to admin
      router.push('/admin');
    }
  }, [router]);

  // Fetch login template configuration
  // Note: shopId detection can be added later for multi-tenant support
  const { data, isLoading, error } = trpc.loginTemplate.getTemplate.useQuery(
    {
      // shopId: detectShopIdFromDomain(), // Future: detect from custom domain
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Get configuration (use fetched config or fallback to default)
  const config = data?.config || DEFAULT_CONFIG;

  // Log template source for debugging
  if (data?.source) {
    console.log(`[LoginPage] Template source: ${data.source}`);
  }
  if (error) {
    console.warn('[LoginPage] Failed to fetch template, using default:', error.message);
  }

  // Render the configured template
  return <TemplateRenderer config={config} />;
}

'use client';

/**
 * Admin Settings Page
 *
 * System-wide settings and configuration management.
 */

import Link from 'next/link';
import { Palette, Mail, Shield, Plug, Bell, Cog } from 'lucide-react';

interface SettingCard {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  iconColor: string;
  available: boolean;
}

export default function SettingsPage() {
  const settingsCards: SettingCard[] = [
    {
      title: 'Login Page Customization',
      description: 'Customize your login page template, colors, branding, and content',
      href: '/admin/settings/login-page',
      icon: <Palette className="h-6 w-6" />,
      iconColor: 'from-blue-500 to-purple-500',
      available: true,
    },
    {
      title: 'Email Settings',
      description: 'Configure SMTP settings and email templates',
      href: '/admin/settings/email',
      icon: <Mail className="h-6 w-6" />,
      iconColor: 'from-green-500 to-teal-500',
      available: false,
    },
    {
      title: 'Security Policies',
      description: 'Manage password policies, MFA requirements, and access controls',
      href: '/admin/settings/security',
      icon: <Shield className="h-6 w-6" />,
      iconColor: 'from-red-500 to-pink-500',
      available: false,
    },
    {
      title: 'Integrations',
      description: 'Connect third-party services and manage API keys',
      href: '/admin/settings/integrations',
      icon: <Plug className="h-6 w-6" />,
      iconColor: 'from-yellow-500 to-orange-500',
      available: false,
    },
    {
      title: 'Notifications',
      description: 'Configure notification preferences and delivery channels',
      href: '/admin/settings/notifications',
      icon: <Bell className="h-6 w-6" />,
      iconColor: 'from-indigo-500 to-violet-500',
      available: false,
    },
    {
      title: 'System Configuration',
      description: 'General system settings and advanced configuration',
      href: '/admin/settings/system',
      icon: <Cog className="h-6 w-6" />,
      iconColor: 'from-gray-500 to-slate-500',
      available: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage system settings and configuration
        </p>
      </div>

      {/* Settings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCards.map((card) => (
          <Link
            key={card.href}
            href={card.available ? card.href : '#'}
            className={`group relative bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-all ${
              card.available
                ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer'
                : 'opacity-60 cursor-not-allowed'
            }`}
            onClick={(e) => {
              if (!card.available) {
                e.preventDefault();
              }
            }}
          >
            {/* Coming Soon Badge */}
            {!card.available && (
              <div className="absolute top-4 right-4 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400 rounded">
                Coming Soon
              </div>
            )}

            {/* Icon */}
            <div
              className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.iconColor} text-white mb-4`}
            >
              {card.icon}
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {card.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {card.description}
            </p>

            {/* Arrow Icon (only for available cards) */}
            {card.available && (
              <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                <span>Configure</span>
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
